import type { CSSProperties } from 'react'
import type { Destination } from '../data/provinces'
import { groupByUniversity } from '../lib/school-groups'

type DestinationCardProps = {
  destination: Destination
  index: number
}

export function DestinationCard({ destination, index }: DestinationCardProps) {
  const groups = groupByUniversity(destination.students)
  const wide = destination.students.length > 5

  return (
    <article
      className={`destination-card${wide ? ' destination-card--wide' : ''}`}
      data-region={destination.region}
      style={{ '--i': index } as CSSProperties}
    >
      <span className="destination-card__ghost" aria-hidden="true">
        {destination.province.slice(0, 1)}
      </span>

      <header className="destination-card__head">
        <span className="destination-card__region">{destination.region}</span>
        <span className="destination-card__count">
          {String(destination.students.length).padStart(2, '0')}
        </span>
      </header>

      <h3>{destination.province}</h3>

      <div className="destination-card__groups">
        {groups.map((group) => (
          <section
            className="destination-card__group"
            key={group.university}
            aria-label={`${group.university}，${group.students.length} 人`}
          >
            <h4>{group.university}</h4>
            <p>
              {group.students.map((student) => (
                <span key={student.name}>{student.name}</span>
              ))}
            </p>
          </section>
        ))}
      </div>
    </article>
  )
}
