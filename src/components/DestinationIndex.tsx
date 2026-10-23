import { useState } from 'react'
import { useClassData } from '../data/class-context'
import { REGIONS, type Region } from '../data/provinces'
import { DestinationCard } from './DestinationCard'

type Filter = Region | '全部'

const FILTERS: readonly Filter[] = ['全部', ...REGIONS]

export function DestinationIndex() {
  const { destinationsSorted, destinationsByRegion, copy } = useClassData()
  const [filter, setFilter] = useState<Filter>('全部')
  const destinations =
    filter === '全部' ? destinationsSorted : destinationsByRegion[filter]
  const studentCount = destinations.reduce(
    (total, destination) => total + destination.students.length,
    0,
  )

  return (
    <section id="roster" className="roster" aria-labelledby="roster-title" tabIndex={-1}>
      <div className="frame">
        <header className="section-heading" data-reveal>
          <p className="eyebrow">02 · Scattered stars</p>
          <div className="section-heading__row">
            <h2 id="roster-title">星散录</h2>
            <p className="section-heading__note">{copy.rosterNote}</p>
          </div>
        </header>

        <div className="roster__toolbar" data-reveal>
          <div className="roster__filters" role="group" aria-label="按地区筛选去向">
            {FILTERS.map((item) => {
              const count =
                item === '全部'
                  ? destinationsSorted.length
                  : destinationsByRegion[item].length

              return (
                <button
                  key={item}
                  type="button"
                  className={`roster-filter ${filter === item ? 'is-active' : ''}`}
                  data-region={item === '全部' ? undefined : item}
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                >
                  {item}
                  <span className="roster-filter__count">{count}</span>
                </button>
              )
            })}
          </div>
          <p className="roster__status" aria-live="polite">
            <span>{String(destinations.length).padStart(2, '0')}</span> 个省市
            <i aria-hidden="true" />
            <span>{String(studentCount).padStart(2, '0')}</span> 位同学
          </p>
        </div>

        <div className="roster__grid" data-reveal>
          {destinations.map((destination, index) => (
            <DestinationCard
              key={`${filter}-${destination.province}`}
              destination={destination}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
