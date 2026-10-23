import type { RefObject } from 'react'
import {
  FEATURE_PATHS,
  MAP_VIEWBOX,
  OUTLINE_PATH,
  PROVINCE_FEATURES,
  SEA_INSET,
  layoutAnnotations,
} from '../data/map'
import { REGIONS, type Province, type Region } from '../data/provinces'
import { useClassData } from '../data/class-context'
import { groupByUniversity } from '../lib/school-groups'
import { Seal } from './Seal'

type ExportPosterProps = {
  posterRef: RefObject<HTMLDivElement | null>
}

const REGION_COLORS = {
  华北: '#7c7a58',
  东北: '#627073',
  华东: '#b16b47',
  华中: '#967053',
  华南: '#a84f32',
  西南: '#717b55',
  西北: '#b18a56',
} as const satisfies Record<Region, string>

const EXPORT_FONT =
  "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', SimSun, serif"

export function ExportPoster({ posterRef }: ExportPosterProps) {
  const {
    school,
    copy,
    teachers,
    headTeacher,
    destinationsSorted,
    destinationByProvince,
    totals,
  } = useClassData()
  const annotations = layoutAnnotations(destinationsSorted).annotations

  return (
    <div className="export-poster-stage" aria-hidden="true">
      <div className="export-poster" ref={posterRef}>
        <div className="export-poster__inner">
          <header className="export-poster__header">
            <div className="export-poster__title">
              <p className="export-poster__kicker">
                {school.englishEyebrow} · 毕业去向图
              </p>
              <h1>{school.heroTitle}</h1>
              <p className="export-poster__phrase">{copy.heroPhrase}</p>
            </div>
            <div className="export-poster__seal">
              <Seal chars={school.seal} />
            </div>
          </header>

          <div className="export-poster__meta">
            <span>{totals.students} 位同窗</span>
            <span>{totals.provinces} 个省市</span>
            <span>{totals.universities} 所高校</span>
            <span>{totals.teachers} 位恩师</span>
            <span className="export-poster__archive">{school.archiveNumber}</span>
          </div>

          <div className="export-poster__body">
            <section className="export-poster__map" aria-label="毕业去向地图">
              <svg viewBox={MAP_VIEWBOX} role="img" aria-label="同学毕业去向地图">
                <rect
                  width="1120"
                  height="680"
                  rx="8"
                  style={{ fill: 'rgba(41, 38, 31, 0.025)' }}
                />
                <g>
                  {PROVINCE_FEATURES.map((feature) => {
                    const province = feature.properties.name as Province
                    const destination = destinationByProvince.get(province)
                    const color = destination
                      ? REGION_COLORS[destination.region]
                      : undefined
                    return (
                      <path
                        key={province}
                        d={FEATURE_PATHS.get(province)}
                        style={{
                          fill: color ?? 'rgba(41, 38, 31, 0.055)',
                          fillOpacity: color ? 0.58 : 1,
                          stroke: color ?? 'rgba(41, 38, 31, 0.13)',
                          strokeOpacity: color ? 0.48 : 1,
                          strokeWidth: 0.7,
                          strokeLinejoin: 'round',
                        }}
                      />
                    )
                  })}
                  <path
                    d={OUTLINE_PATH}
                    style={{
                      fill: 'none',
                      stroke: 'rgba(41, 38, 31, 0.38)',
                      strokeWidth: 1.1,
                      strokeLinejoin: 'round',
                    }}
                  />
                </g>

                <g className="export-map__annotations">
                  {annotations.map((annotation) => {
                    const anchor =
                      annotation.side === 'left' ? 'start' : 'end'
                    return (
                      <g key={annotation.province}>
                        <line
                          x1={annotation.lineStart[0]}
                          y1={annotation.lineStart[1]}
                          x2={annotation.target[0]}
                          y2={annotation.target[1]}
                          style={{
                            stroke: 'rgba(41, 38, 31, 0.32)',
                            strokeWidth: 0.8,
                            strokeDasharray: '3 5',
                          }}
                        />
                        <circle
                          cx={annotation.lineStart[0]}
                          cy={annotation.lineStart[1]}
                          r="2"
                          style={{ fill: '#7d7462' }}
                        />
                        <circle
                          cx={annotation.target[0]}
                          cy={annotation.target[1]}
                          r={annotation.radius + 8}
                          style={{
                            fill: 'none',
                            stroke: 'rgba(166, 61, 44, 0.22)',
                            strokeWidth: 1,
                          }}
                        />
                        <circle
                          cx={annotation.target[0]}
                          cy={annotation.target[1]}
                          r={annotation.radius}
                          style={{ fill: '#a63d2c' }}
                        />
                        <text
                          x={annotation.x}
                          y={annotation.y}
                          textAnchor={anchor}
                          style={{
                            fill: '#29261f',
                            fontFamily: EXPORT_FONT,
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                          }}
                        >
                          {annotation.province}
                        </text>
                        <text
                          x={annotation.x}
                          y={annotation.y + annotation.metaOffset}
                          textAnchor={anchor}
                          style={{
                            fill: '#7d7462',
                            fontFamily: EXPORT_FONT,
                            fontSize: 10.5,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {annotation.destination.students.length} 位
                        </text>
                      </g>
                    )
                  })}
                </g>

                <g className="export-map__inset">
                  <rect
                    x={SEA_INSET.frame.x}
                    y={SEA_INSET.frame.y}
                    width={SEA_INSET.frame.width}
                    height={SEA_INSET.frame.height}
                    style={{
                      fill: 'rgba(244, 237, 223, 0.36)',
                      stroke: 'rgba(41, 38, 31, 0.2)',
                      strokeWidth: 0.7,
                    }}
                  />
                  <clipPath id="export-sea-inset-clip">
                    <rect
                      x={SEA_INSET.frame.x}
                      y={SEA_INSET.frame.y}
                      width={SEA_INSET.frame.width}
                      height={SEA_INSET.frame.height}
                    />
                  </clipPath>
                  <g clipPath="url(#export-sea-inset-clip)">
                    {SEA_INSET.paths.map((path) => (
                      <path
                        key={path.name}
                        d={path.d}
                        style={
                          path.name === '九段线'
                            ? {
                                fill: 'none',
                                stroke: 'rgba(41, 38, 31, 0.4)',
                                strokeWidth: 0.8,
                              }
                            : {
                                fill: 'rgba(41, 38, 31, 0.16)',
                                stroke: 'rgba(41, 38, 31, 0.3)',
                                strokeWidth: 0.5,
                              }
                        }
                      />
                    ))}
                  </g>
                  <text
                    x={SEA_INSET.frame.x + SEA_INSET.frame.width / 2}
                    y={SEA_INSET.frame.y + SEA_INSET.frame.height + 13}
                    textAnchor="middle"
                    style={{
                      fill: '#a69a85',
                      fontFamily: EXPORT_FONT,
                      fontSize: 9.5,
                      letterSpacing: '0.08em',
                    }}
                  >
                    南海诸岛
                  </text>
                </g>
              </svg>

              <ul className="export-poster__legend" aria-label="地区图例">
                {REGIONS.map((region) => (
                  <li key={region} data-region={region}>
                    <span aria-hidden="true" />
                    {region}
                  </li>
                ))}
              </ul>
            </section>

            <aside className="export-poster__aside">
              <p className="export-poster__aside-label">行囊</p>
              <p className="export-poster__motto">{copy.motto}</p>

              <dl className="export-poster__stats">
                <div>
                  <dt>同窗</dt>
                  <dd>{totals.students}</dd>
                </div>
                <div>
                  <dt>省市</dt>
                  <dd>{totals.provinces}</dd>
                </div>
                <div>
                  <dt>高校</dt>
                  <dd>{totals.universities}</dd>
                </div>
                <div>
                  <dt>恩师</dt>
                  <dd>{totals.teachers}</dd>
                </div>
              </dl>

              <div className="export-poster__teachers">
                <p className="export-poster__aside-label">恩师名录</p>
                <ul>
                  {teachers.map((teacher) => (
                    <li key={`${teacher.subject}-${teacher.name}`}>
                      <span>{teacher.headTeacher ? '班主任' : teacher.subject}</span>
                      <span>{teacher.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="export-poster__teacher-note">
                  —— {headTeacher.name} 老师与各科恩师
                </p>
              </div>
            </aside>
          </div>

          <section className="export-poster__roster">
            <header className="export-poster__roster-head">
              <div>
                <p className="export-poster__aside-label">星散录</p>
                <h2>各赴前程</h2>
              </div>
              <p>按省份与院校聚合 · 院校与姓名按拼音</p>
            </header>

            <div className="export-poster__columns">
              {destinationsSorted.map((destination) => (
                <article
                  className="export-destination"
                  data-region={destination.region}
                  key={destination.province}
                >
                  <header className="export-destination__head">
                    <span>{destination.region}</span>
                    <span>{String(destination.students.length).padStart(2, '0')} 人</span>
                  </header>
                  <h3>{destination.province}</h3>

                  {groupByUniversity(destination.students).map((group) => (
                    <div className="export-destination__group" key={group.university}>
                      <p className="export-destination__university">
                        {group.university}
                      </p>
                      <p className="export-destination__names">
                        {group.students.map((student) => student.name).join(' · ')}
                      </p>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <section className="export-poster__wishes">
            <header className="export-poster__wishes-head">
              <div>
                <p className="export-poster__aside-label">恩师寄语</p>
                <h2>{copy.letterTitle}</h2>
              </div>
              <p>{copy.letterKicker}</p>
            </header>

            <div className="export-poster__wish-grid">
              {teachers.map((teacher) => (
                <article
                  className="export-wish"
                  data-head={teacher.headTeacher ? 'true' : undefined}
                  key={`${teacher.subject}-${teacher.name}`}
                >
                  <header className="export-wish__head">
                    <span className="export-wish__subject">
                      {teacher.subject}
                    </span>
                    {teacher.headTeacher && (
                      <span className="export-wish__badge">班主任</span>
                    )}
                  </header>
                  <h3>{teacher.name}</h3>
                  <p>{teacher.message}</p>
                </article>
              ))}
            </div>

            <div className="export-poster__wishes-foot">
              <p>
                {school.className} 全体教师 · {copy.letterDate}
              </p>
              <Seal chars={copy.letterSeal} />
            </div>
          </section>

          <footer className="export-poster__footer">
            <div>
              <p className="export-poster__footer-motto">{copy.footerMotto}</p>
              <p className="export-poster__footer-meta">
                {school.name} · {school.className} · {school.archiveNumber}
              </p>
            </div>
            <div className="export-poster__footer-seal">
              <Seal chars="后会有期" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
