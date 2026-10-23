import type { CSSProperties } from 'react'
import type { Destination } from '../data/provinces'

type DestinationCardProps = {
  destination: Destination
  index: number
}

export function DestinationCard({ destination, index }: DestinationCardProps) {
  return (
    <article
      className="destination-card"
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

      <ul className="destination-card__students">
        {destination.students.map((student, studentIndex) => (
          <li key={`${student.name}-${studentIndex}`}>
            <span className="destination-card__name">{student.name}</span>
            <span className="destination-card__school">{student.university}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
