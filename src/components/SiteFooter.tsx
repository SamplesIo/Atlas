import { useClassData } from '../data/class-context'

export function SiteFooter() {
  const { school, copy, totals } = useClassData()

  return (
    <footer className="site-footer">
      <div className="frame site-footer__inner">
        <p className="site-footer__brand">
          {school.name} <span>·</span> {school.className}
        </p>
        <p className="site-footer__motto">{copy.footerMotto}</p>
        <a className="site-footer__top" href="#top">
          回到卷首
          <span aria-hidden="true">↑</span>
        </a>
      </div>

      <div className="frame site-footer__meta">
        <span>
          {totals.students} 位同窗 · {totals.provinces} 个省市 · {totals.universities}{' '}
          所高校 · {totals.teachers} 位恩师
        </span>
      </div>
    </footer>
  )
}
