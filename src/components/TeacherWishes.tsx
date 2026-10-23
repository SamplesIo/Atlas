import { useRef, type CSSProperties } from 'react'
import { useClassData } from '../data/class-context'
import { Seal } from './Seal'
import { RopePhysics } from './RopePhysics'

const TILTS = [-2.2, 1.6, -1.4, 2.1, -1.8, 1.5, -1.1, 1.9]
const DROPS = [0, 26, 8, 34, 12, 30, 3, 20]

export function TeacherWishes() {
  const { teachers, copy, school } = useClassData()
  const ropeRef = useRef<HTMLDivElement>(null)

  return (
    <section className="wishes-section" aria-labelledby="wishes-title">
      <span className="wishes-section__stamp" aria-hidden="true">
        {copy.letterStamp}
      </span>

      <div className="frame wishes-frame">
        <header className="wishes-head" data-reveal>
          <p className="eyebrow">03 · Teachers' wishes</p>
          <h2 id="wishes-title">{copy.letterTitle}</h2>
          <p className="wishes-head__kicker">{copy.letterKicker}</p>
          <p className="wishes-head__note">{copy.letterAside}</p>
        </header>

        <div className="wishes-rope" ref={ropeRef}>
          <RopePhysics containerRef={ropeRef} />
          <span className="wishes-rope__start" aria-hidden="true" />

          <ul className="wishes-list" data-reveal>
            {teachers.map((teacher, index) => {
              const side = index % 2 === 0 ? 'left' : 'right'
              const style = {
                '--i': index,
                '--tilt': `${TILTS[index % TILTS.length]}deg`,
                '--drop': `${DROPS[index % DROPS.length]}px`,
              } as CSSProperties

              return (
                <li
                  key={`${teacher.name}-${index}`}
                  className={`wish wish--${side}`}
                  style={style}
                >
                  <span className="wish__string" aria-hidden="true" />
                  <span className="wish__knot" aria-hidden="true" />
                  <article
                    className="wish-card"
                    data-head={teacher.headTeacher ? 'true' : undefined}
                  >
                    <span className="wish-card__hole" aria-hidden="true" />
                    <header className="wish-card__head">
                      <span className="wish-card__subject">{teacher.subject}</span>
                      {teacher.headTeacher && (
                        <span className="wish-card__badge">班主任</span>
                      )}
                    </header>
                    <h3>{teacher.name}</h3>
                    <p className="wish-card__message">{teacher.message}</p>
                    <span className="wish-card__stamp" aria-hidden="true">
                      {teacher.subject.length > 2 ? teacher.subject.slice(0, 1) : teacher.subject}
                    </span>
                  </article>
                </li>
              )
            })}
          </ul>

        </div>

        <footer className="wishes-foot" data-reveal>
          <div className="wishes-foot__text">
            {copy.letterBody.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <span>
              {school.className} 全体教师 · {copy.letterDate}
            </span>
          </div>
          <Seal chars={copy.letterSeal} className="seal--wishes" />
        </footer>
      </div>
    </section>
  )
}
