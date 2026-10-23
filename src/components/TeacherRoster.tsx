import { useEffect, useRef, type CSSProperties } from 'react'
import { useClassData } from '../data/class-context'

export function TeacherRoster() {
  const { teachers, school } = useClassData()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const documentBottom = rect.bottom + window.scrollY
      const progress =
        documentBottom > 0
          ? Math.min(1, Math.max(0, window.scrollY / documentBottom))
          : 1
      const travel = Math.max(0, element.clientHeight - 78)
      element.style.setProperty('--marker-y', `${(progress * travel).toFixed(1)}px`)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const observer = new ResizeObserver(schedule)
    observer.observe(element)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
      element.style.removeProperty('--marker-y')
    }
  }, [])

  return (
    <aside ref={ref} className="teachers" aria-labelledby="teachers-title">
      <div className="teachers__heading">
        <span className="teachers__mark" aria-hidden="true">
          师
        </span>
        <div>
          <p className="eyebrow eyebrow--small">Our mentors</p>
          <h2 id="teachers-title">恩师名录</h2>
        </div>
      </div>

      <ul className="teachers__list">
        {teachers.map((teacher, index) => (
          <li
            key={`${teacher.name}-${teacher.subject}-${index}`}
            className="teachers__item"
            style={{ '--i': index } as CSSProperties}
          >
            <span className="teachers__subject">
              {teacher.headTeacher ? '班主任 · ' : ''}
              {teacher.subject}
            </span>
            <span className="teachers__leader" aria-hidden="true" />
            <span className="teachers__name">{teacher.name}</span>
          </li>
        ))}
      </ul>

      <p className="teachers__note">
        三尺讲台，四季耕耘。
        <span>—— {school.className}全体同学 敬上</span>
      </p>
    </aside>
  )
}
