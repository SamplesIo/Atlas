import { useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  FEATURE_PATHS,
  MAP_VIEWBOX,
  MOBILE_MAP_VIEWBOX,
  OUTLINE_PATH,
  PROVINCE_FEATURES,
  SEA_INSET,
  layoutAnnotations,
} from '../data/map'
import { REGIONS, type Destination, type Province } from '../data/provinces'
import { useClassData } from '../data/class-context'
import { useMediaQuery } from '../hooks/useMediaQuery'

type DestinationMapProps = {
  onOpen: (destination: Destination) => void
}

export function DestinationMap({ onOpen }: DestinationMapProps) {
  const { destinations, destinationByProvince, school, totals, copy } = useClassData()
  const [active, setActive] = useState<Province | null>(null)
  const isNarrow = useMediaQuery('(max-width: 860px)')
  const layout = useMemo(() => layoutAnnotations(destinations), [destinations])

  const activate = (province: Province) => setActive(province)
  const deactivate = (province: Province) =>
    setActive((current) => (current === province ? null : current))

  const handleKeyDown = (
    event: KeyboardEvent<SVGPathElement>,
    destination: Destination,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen(destination)
  }

  return (
    <div className="map-panel">
      <div className="map-canvas">
        <svg
          className="china-map"
          viewBox={isNarrow ? MOBILE_MAP_VIEWBOX : MAP_VIEWBOX}
          style={{
            aspectRatio: isNarrow ? '834 / 680' : '1120 / 680',
          }}
          role="group"
          aria-labelledby="map-title"
          aria-describedby="map-instructions"
        >
          <title id="map-title">{school.heroTitle} · {copy.heroPhrase}</title>
          <desc id="map-instructions">
            {school.heroTitle}共有 {totals.students} 位同学，前往 {totals.provinces}{' '}
            个省市。使用 Tab 键浏览有去向的省份，按回车键查看完整名册。
          </desc>

          <defs>
            <radialGradient id="map-wash" cx="50%" cy="48%" r="55%">
              <stop offset="0" stopColor="#b9a67f" stopOpacity=".16" />
              <stop offset=".66" stopColor="#b9a67f" stopOpacity=".05" />
              <stop offset="1" stopColor="#b9a67f" stopOpacity="0" />
            </radialGradient>
            <pattern id="map-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r=".8" fill="#5b5343" opacity=".24" />
            </pattern>
            <clipPath id="sea-inset-clip">
              <rect
                x={SEA_INSET.frame.x}
                y={SEA_INSET.frame.y}
                width={SEA_INSET.frame.width}
                height={SEA_INSET.frame.height}
              />
            </clipPath>
          </defs>

          <rect width="1120" height="680" fill="url(#map-wash)" />
          <rect x="14" y="6" width="1092" height="668" fill="url(#map-dots)" opacity=".5" />

          <g className="map-provinces">
            {PROVINCE_FEATURES.map((feature, index) => {
              const province = feature.properties.name as Province
              const destination = destinationByProvince.get(province)
              const isActive = active === province
              const count = destination?.students.length ?? 0
              const fillOpacity = destination ? 0.5 + count * 0.13 : 0.42

              return (
                <path
                  key={province}
                  d={FEATURE_PATHS.get(province)}
                  className={[
                    'province',
                    destination ? 'province--destination' : '',
                    isActive ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-region={destination?.region}
                  style={
                    {
                      '--i': index,
                      '--fill-opacity': fillOpacity,
                    } as CSSProperties
                  }
                  tabIndex={destination ? 0 : undefined}
                  role={destination ? 'button' : undefined}
                  aria-haspopup={destination ? 'dialog' : undefined}
                  aria-label={
                    destination
                      ? `${province}，${count} 位同学：${destination.students
                          .map((student) => student.name)
                          .join('、')}。查看同窗去处。`
                      : undefined
                  }
                  onPointerEnter={destination ? () => activate(province) : undefined}
                  onPointerLeave={destination ? () => deactivate(province) : undefined}
                  onFocus={destination ? () => activate(province) : undefined}
                  onBlur={destination ? () => deactivate(province) : undefined}
                  onClick={destination ? () => onOpen(destination) : undefined}
                  onKeyDown={
                    destination
                      ? (event) => handleKeyDown(event, destination)
                      : undefined
                  }
                />
              )
            })}
          </g>

          <path className="map-outline" d={OUTLINE_PATH} aria-hidden="true" />

          <g
            className={`map-annotations ${layout.dense ? 'is-dense' : ''}`.trim()}
            aria-hidden="true"
          >
            {layout.annotations.map((annotation, index) => {
              const isActive = active === annotation.province
              const { x, y, side, target, lineStart, radius } = annotation
              const labelAnchor = side === 'left' ? 'start' : 'end'

              return (
                <g
                  key={annotation.province}
                  className={`annotation ${isActive ? 'is-active' : ''}`}
                  data-region={annotation.destination.region}
                  style={{ '--i': index } as CSSProperties}
                  onPointerEnter={() => activate(annotation.province)}
                  onPointerLeave={() => deactivate(annotation.province)}
                  onClick={() => onOpen(annotation.destination)}
                >
                  <line
                    className="annotation__leader"
                    x1={lineStart[0]}
                    y1={lineStart[1]}
                    x2={target[0]}
                    y2={target[1]}
                  />
                  <circle
                    className="annotation__tick"
                    cx={lineStart[0]}
                    cy={lineStart[1]}
                    r="2"
                  />
                  <circle
                    className="annotation__halo"
                    cx={target[0]}
                    cy={target[1]}
                    r={radius + 9}
                  />
                  <circle
                    className="annotation__anchor"
                    cx={target[0]}
                    cy={target[1]}
                    r={radius}
                  />
                  <rect
                    className="annotation__hit"
                    x={side === 'left' ? x - 10 : x - 142}
                    y={y - annotation.hitHeight / 2 - 3}
                    width="152"
                    height={annotation.hitHeight}
                    rx="2"
                  />
                  <text
                    className="annotation__name"
                    x={x}
                    y={y}
                    textAnchor={labelAnchor}
                  >
                    {annotation.province}
                  </text>
                  <text
                    className="annotation__meta"
                    x={x}
                    y={y + annotation.metaOffset}
                    textAnchor={labelAnchor}
                  >
                    {annotation.destination.students.length} 位同窗
                  </text>
                </g>
              )
            })}
          </g>

          <g className="sea-inset" aria-hidden="true">
            <rect
              className="sea-inset__frame"
              x={SEA_INSET.frame.x}
              y={SEA_INSET.frame.y}
              width={SEA_INSET.frame.width}
              height={SEA_INSET.frame.height}
            />
            <g clipPath="url(#sea-inset-clip)">
              {SEA_INSET.paths.map((path) => (
                <path
                  key={path.name}
                  className={
                    path.name === '九段线' ? 'sea-inset__line' : 'sea-inset__island'
                  }
                  d={path.d}
                />
              ))}
            </g>
            <text
              className="sea-inset__label"
              x={SEA_INSET.frame.x + SEA_INSET.frame.width / 2}
              y={SEA_INSET.frame.y + SEA_INSET.frame.height + 14}
              textAnchor="middle"
            >
              南海诸岛
            </text>
          </g>
        </svg>
      </div>

      <footer className="map-meta">
        <ul className="map-legend" aria-label="地区图例">
          {REGIONS.map((region) => (
            <li key={region} data-region={region}>
              <span className="map-legend__dot" aria-hidden="true" />
              {region}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  )
}
