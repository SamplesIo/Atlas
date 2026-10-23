import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { useClassData } from '../data/class-context'
import { ExportPoster } from './ExportPoster'

type ExportStatus = 'idle' | 'working' | 'done' | 'error'

const EXPORT_LABEL: Record<ExportStatus, string> = {
  idle: '导出图片',
  working: '正在绘制',
  done: '图片已保存',
  error: '重新导出',
}

const EXPORT_GLYPH: Record<ExportStatus, string> = {
  idle: '↓',
  working: '…',
  done: '✓',
  error: '↻',
}

const EXPORT_STATUS_TEXT: Record<ExportStatus, string> = {
  idle: '',
  working: '正在生成毕业去向图片。',
  done: '毕业去向图片已保存。',
  error: '导出失败，请再试一次。',
}

export function SiteFooter() {
  const { school, copy, totals } = useClassData()
  const posterRef = useRef<HTMLDivElement>(null)
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')

  const exportPoster = async () => {
    const poster = posterRef.current
    if (!poster || exportStatus === 'working') return

    setExportStatus('working')
    try {
      await document.fonts.ready
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

      const dataUrl = await toPng(poster, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f4eddf',
        width: poster.offsetWidth,
        height: poster.scrollHeight,
      })

      const filename = `${school.name}-${school.className}-毕业去向.png`
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      link.remove()

      setExportStatus('done')
      window.setTimeout(() => setExportStatus('idle'), 2600)
    } catch (error) {
      console.error('导出图片失败', error)
      setExportStatus('error')
      window.setTimeout(() => setExportStatus('idle'), 3600)
    }
  }

  return (
    <>
      <footer className="site-footer">
        <div className="frame site-footer__inner">
          <p className="site-footer__brand">
            {school.name} <span>·</span> {school.className}
          </p>
          <p className="site-footer__motto">{copy.footerMotto}</p>
          <div className="site-footer__actions">
            <button
              type="button"
              className="site-footer__action site-footer__export"
              onClick={exportPoster}
              disabled={exportStatus === 'working'}
              aria-busy={exportStatus === 'working'}
            >
              {EXPORT_LABEL[exportStatus]}
              <span aria-hidden="true">{EXPORT_GLYPH[exportStatus]}</span>
            </button>
            <a className="site-footer__action site-footer__top" href="#top">
              回到卷首
              <span aria-hidden="true">↑</span>
            </a>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {EXPORT_STATUS_TEXT[exportStatus]}
          </span>
        </div>

        <div className="frame site-footer__meta">
          <span>
            {totals.students} 位同窗 · {totals.provinces} 个省市 · {totals.universities}{' '}
            所高校 · {totals.teachers} 位恩师
          </span>
        </div>
      </footer>

      <ExportPoster posterRef={posterRef} />
    </>
  )
}
