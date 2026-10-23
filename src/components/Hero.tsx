import { useRef } from 'react'
import type { Destination } from '../data/provinces'
import { useClassData } from '../data/class-context'
import { DestinationMap } from './DestinationMap'
import { HeroBackdrop } from './HeroBackdrop'
import { Seal } from './Seal'
import { TeacherRoster } from './TeacherRoster'
import { useHeroScroll } from '../hooks/useHeroScroll'

type HeroProps = {
  onOpen: (destination: Destination) => void
}

export function Hero({ onOpen }: HeroProps) {
  const { school, copy } = useClassData()
  const heroRef = useRef<HTMLElement>(null)
  useHeroScroll(heroRef)

  return (
    <section ref={heroRef} id="top" className="hero" aria-labelledby="hero-title">
      <HeroBackdrop />

      <div className="hero__frame frame">
        <div className="hero__topline" aria-hidden="true">
          <span>{school.name} · 毕业档案</span>
          <span>{school.archiveNumber}</span>
        </div>

        <header className="hero__masthead">
          <p className="eyebrow">
            {school.englishEyebrow}
          </p>
          <h1 id="hero-title" className="hero__title">
            <span className="hero__title-cn">{school.heroTitle}</span>
            <span className="hero__title-dest">
              {copy.heroPhrase}
              <Seal chars={school.seal} className="seal--hero" />
            </span>
          </h1>

          <div className="hero__motto">
            <span className="hero__rule" aria-hidden="true" />
            <p>{copy.motto}</p>
            <span className="hero__rule" aria-hidden="true" />
          </div>
          <p className="hero__latin">{copy.mottoEn}</p>
        </header>

        <div className="hero__body">
          <DestinationMap onOpen={onOpen} />
          <TeacherRoster />
        </div>

      </div>
    </section>
  )
}
