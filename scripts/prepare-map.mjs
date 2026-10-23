// Preprocesses the DataV China boundary GeoJSON for d3-geo.
// Source: https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
// - reverses polygon winding (d3-geo expects clockwise exterior rings)
// - shortens province names for display
// - splits the South China Sea islands into a separate inset collection
// - unions the provinces into a coastline outline for the heavier ink border
import { readFileSync, writeFileSync } from 'node:fs'
import { geoArea } from 'd3-geo'
import { merge } from 'topojson-client'
import { topology } from 'topojson-server'

const source = JSON.parse(readFileSync('scripts/data/china-source.json', 'utf8'))

const SHORT = {
  北京市: '北京', 天津市: '天津', 河北省: '河北', 山西省: '山西', 内蒙古自治区: '内蒙古',
  辽宁省: '辽宁', 吉林省: '吉林', 黑龙江省: '黑龙江', 上海市: '上海', 江苏省: '江苏',
  浙江省: '浙江', 安徽省: '安徽', 福建省: '福建', 江西省: '江西', 山东省: '山东',
  河南省: '河南', 湖北省: '湖北', 湖南省: '湖南', 广东省: '广东', 广西壮族自治区: '广西',
  海南省: '海南', 重庆市: '重庆', 四川省: '四川', 贵州省: '贵州', 云南省: '云南',
  西藏自治区: '西藏', 陕西省: '陕西', 甘肃省: '甘肃', 青海省: '青海',
  宁夏回族自治区: '宁夏', 新疆维吾尔自治区: '新疆', 台湾省: '台湾',
  香港特别行政区: '香港', 澳门特别行政区: '澳门',
}

const reverse = (rings) => rings.map((ring) => [...ring].reverse())
const normalize = (feature) => {
  const geometry = feature.geometry
  if (geometry.type === 'Polygon') geometry.coordinates = reverse(geometry.coordinates)
  if (geometry.type === 'MultiPolygon') geometry.coordinates = geometry.coordinates.map(reverse)
  return feature
}

const maxLatitude = (polygon) => Math.max(...polygon[0].map(([, lat]) => lat))
const features = []
const southSeaFeatures = []
let hainanAll = []

for (const raw of source.features) {
  const feature = normalize(structuredClone(raw))
  if (!feature.properties.name) {
    southSeaFeatures.push({ type: 'Feature', properties: { name: '九段线' }, geometry: feature.geometry })
    continue
  }
  const name = SHORT[feature.properties.name]
  if (!name) throw new Error(`Unknown province: ${feature.properties.name}`)
  if (name === '海南') {
    hainanAll = feature.geometry.coordinates
    const mainIsland = hainanAll.filter((polygon) => maxLatitude(polygon) > 17.5)
    const southIslands = hainanAll.filter((polygon) => maxLatitude(polygon) <= 17.5)
    southSeaFeatures.push({ type: 'Feature', properties: { name: '南海诸岛' }, geometry: { type: 'MultiPolygon', coordinates: southIslands } })
    features.push({ type: 'Feature', properties: { name }, geometry: { type: 'MultiPolygon', coordinates: mainIsland } })
    continue
  }
  features.push({ type: 'Feature', properties: { name }, geometry: feature.geometry })
}

for (const feature of features) {
  const area = geoArea(feature)
  if (!Number.isFinite(area) || area > 0.2) throw new Error(`Bad winding: ${feature.properties.name} ${area}`)
}

features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'zh-Hans-CN'))

// Union the provinces so the coastline can have a heavier ink outline than
// the internal province borders.
const topo = topology({ provinces: { type: 'FeatureCollection', features } })
const outline = merge(topo, topo.objects.provinces.geometries)
if (!outline || !['Polygon', 'MultiPolygon'].includes(outline.type)) {
  throw new Error('Failed to build the country outline')
}

const data = {
  type: 'FeatureCollection',
  features,
  southSea: { type: 'FeatureCollection', features: southSeaFeatures },
  outline,
}
writeFileSync('src/data/china.json', JSON.stringify(data))
console.log(`Wrote ${features.length} provinces, ${southSeaFeatures.length} inset features, ${(JSON.stringify(data).length / 1024).toFixed(0)} KB`)
