export function BootScreen() {
  return (
    <main className="boot-screen" aria-busy="true" aria-live="polite">
      <span className="boot-screen__mark" aria-hidden="true">
        卷
      </span>
      <p>正在展开卷轴…</p>
    </main>
  )
}
