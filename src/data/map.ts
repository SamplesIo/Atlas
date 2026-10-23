import { geoConicEqualArea, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import rawMap from './china.json'
import type { Destination, Province } from './provinces'

type ProvinceProperties = { name: string }

type ChinaData = {
  type: 'FeatureCollection'
  features: Feature<Geometry, ProvinceProperties>[]
  southSea: FeatureCollection<Geometry, ProvinceProperties>
  outline: Geometry
}

const data = rawMap as unknown as ChinaData

export const PROVINCE_FEATURES = data.features
const PROVINCE_FEATURE_BY_NAME = new Map(
  PROVINCE_FEATURES.map((feature) => [feature.properties.name, feature]),
)

const mainCollection: FeatureCollection<Geometry, ProvinceProperties> = {
  type: 'FeatureCollection',
  features: PROVINCE_FEATURES,
}

const projection = geoConicEqualArea()
  .parallels([25, 47])
  .rotate([-105, 0])
  .fitExtent(
    [
      [170, 10],
      [970, 670],
    ],
    mainCollection,
  )

const geoPathGenerator = geoPath(projection)
const MAP_BOUNDS = geoPathGenerator.bounds(mainCollection)
const MAP_MID_X = (MAP_BOUNDS[0][0] + MAP_BOUNDS[1][0]) / 2

export const FEATURE_PATHS = new Map(
  PROVINCE_FEATURES.map((feature) => [
    feature.properties.name,
    geoPathGenerator(feature) ?? '',
  ]),
)

export const OUTLINE_PATH = geoPathGenerator(data.outline) ?? ''

export const MAP_VIEWBOX = '0 0 1120 680'
export const MOBILE_MAP_VIEWBOX = '150 0 834 680'

type Side = 'left' | 'right'

type AnnotationSeed = {
  readonly destination: Destination
  readonly target: readonly [number, number]
  readonly naturalSide: Side
}

export type Annotation = {
  readonly province: Province
  readonly destination: Destination
  readonly x: number
  readonly y: number
  readonly side: Side
  readonly target: readonly [number, number]
  readonly lineStart: readonly [number, number]
  readonly radius: number
  readonly metaOffset: number
  readonly hitHeight: number
}

export type AnnotationLayout = {
  readonly annotations: readonly Annotation[]
  readonly dense: boolean
  readonly leftCount: number
  readonly rightCount: number
}

const LABEL_X: Record<Side, number> = { left: 18, right: 1102 }
const LINE_START_X: Record<Side, number> = { left: 125, right: 982 }
const LABEL_TOP: Record<Side, number> = { left: 200, right: 112 }
const LABEL_BOTTOM = 630
const MAX_LABEL_GAP = 58
const BALANCE_THRESHOLD = 8
const LEFT_RATIO = 0.4

function centroidOf(province: Province): readonly [number, number] {
  const feature = PROVINCE_FEATURE_BY_NAME.get(province)
  if (!feature) throw new Error(`地图中缺少省份：${province}`)
  const centroid = geoPathGenerator.centroid(feature)
  if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) {
    throw new Error(`无法计算省份中心：${province}`)
  }
  return centroid
}

function placeSide(seeds: AnnotationSeed[], side: Side): Annotation[] {
  const sorted = [...seeds].sort((a, b) => a.target[1] - b.target[1])
  const top = LABEL_TOP[side]
  const span = LABEL_BOTTOM - top
  const count = sorted.length
  if (count === 0) return []

  const spacing =
    count === 1 ? 0 : Math.min(MAX_LABEL_GAP, span / (count - 1))
  const block = spacing * (count - 1)
  const start =
    count === 1
      ? Math.min(Math.max(sorted[0].target[1], top), LABEL_BOTTOM)
      : top + (span - block) / 2

  return sorted.map((seed, index) => {
    const y = count === 1 ? start : start + index * spacing
    const labelSpacing = count === 1 ? MAX_LABEL_GAP : spacing
    return {
      province: seed.destination.province,
      destination: seed.destination,
      x: LABEL_X[side],
      y,
      side,
      target: seed.target,
      lineStart: [LINE_START_X[side], y - 6],
      radius: 2.8 + seed.destination.students.length * 0.85,
      metaOffset: Math.min(17, Math.max(12, labelSpacing * 0.36)),
      hitHeight: Math.max(24, Math.min(42, labelSpacing - 4)),
    }
  })
}

export function layoutAnnotations(
  destinations: readonly Destination[],
): AnnotationLayout {
  const seeds: AnnotationSeed[] = destinations.map((destination) => {
    const target = centroidOf(destination.province)
    return {
      destination,
      target,
      naturalSide: target[0] < MAP_MID_X ? 'left' : 'right',
    }
  })

  const left = seeds.filter((seed) => seed.naturalSide === 'left')
  const right = seeds
    .filter((seed) => seed.naturalSide === 'right')
    .sort((a, b) => a.target[0] - b.target[0])

  if (seeds.length >= BALANCE_THRESHOLD) {
    const targetLeft = Math.ceil(seeds.length * LEFT_RATIO)
    while (left.length < targetLeft && right.length > 0) {
      left.push(right.shift()!)
    }
  }

  const leftAnnotations = placeSide(left, 'left')
  const rightAnnotations = placeSide(right, 'right')
  const dense = left.length > 13 || right.length > 13

  return {
    annotations: [...leftAnnotations, ...rightAnnotations],
    dense,
    leftCount: left.length,
    rightCount: right.length,
  }
}

const insetCollection: FeatureCollection<Geometry, ProvinceProperties> = {
  type: 'FeatureCollection',
  features: [
    ...data.southSea.features,
    PROVINCE_FEATURE_BY_NAME.get('海南')!,
  ],
}

const insetProjection = geoMercator().fitExtent(
  [
    [30, 36],
    [138, 144],
  ],
  insetCollection,
)

const insetPathGenerator = geoPath(insetProjection)

export const SEA_INSET = {
  frame: { x: 24, y: 30, width: 120, height: 120 },
  paths: insetCollection.features.map((feature) => ({
    name: feature.properties.name,
    d: insetPathGenerator(feature) ?? '',
  })),
}
