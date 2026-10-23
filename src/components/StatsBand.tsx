import type { CSSProperties } from 'react'
import { useClassData } from '../data/class-context'
import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'

type Stat = {
  readonly label: string
  readonly latin: string
  readonly value: number
  readonly unit: string
}

const STAT_LABELS = [
  { label: '同窗', latin: 'classmates', key: 'students', unit: '位' },
  { label: '省市', latin: 'cities & provinces', key: 'provinces', unit: '个' },
  { label: '高校', latin: 'universities', key: 'universities', unit: '所' },
  { label: '恩师', latin: 'mentors', key: 'teachers', unit: '位' },
] as const

type StatItemProps = {
  stat: Stat
  active: boolean
  index: number
}

function StatItem({ stat, active, index }: StatItemProps) {
  const value = useCountUp(stat.value, active)

  return (
    <div className="stat" style={{ '--i': index } as CSSProperties}>
      <dt className="stat__label">
        <span className="stat__latin">{stat.latin}</span>
        {stat.label}
      </dt>
      <dd className="stat__value">
        <span className="stat__number">{String(value).padStart(2, '0')}</span>
        <span className="stat__unit">{stat.unit}</span>
      </dd>
    </div>
  )
}

export function StatsBand() {
  const { totals, school, copy } = useClassData()
  const { ref, inView } = useInView<HTMLDivElement>(0.35)
  const stats: readonly Stat[] = STAT_LABELS.map((stat) => ({
    label: stat.label,
    latin: stat.latin,
    unit: stat.unit,
    value: totals[stat.key],
  }))

  return (
    <section id="scatter" className="stats-band" aria-labelledby="stats-title">
      <div className="frame stats-band__inner" ref={ref}>
        <header className="stats-band__head">
          <p className="eyebrow eyebrow--light">
            Class {school.classCode} · in numbers
          </p>
          <h2 id="stats-title">{copy.statsTitle}</h2>
          <p className="stats-band__note">{copy.statsNote}</p>
        </header>

        <dl className="stats-band__grid">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} active={inView} index={index} />
          ))}
        </dl>

        <span className="stats-band__watermark" aria-hidden="true">
          各赴
          <br />
          前程
        </span>
      </div>
    </section>
  )
}
