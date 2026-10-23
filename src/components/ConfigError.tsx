type ConfigErrorProps = {
  title: string
  issues: readonly string[]
}

export function ConfigError({ title, issues }: ConfigErrorProps) {
  return (
    <main className="config-error">
      <div className="config-error__panel">
        <p className="eyebrow">Configuration error</p>
        <h1>{title}</h1>
        <p className="config-error__hint">
          请修改项目根目录的 <code>class.toml</code>，保存后刷新页面。
        </p>
        <ul>
          {issues.map((issue, index) => (
            <li key={`${issue}-${index}`}>{issue}</li>
          ))}
        </ul>
        <a className="config-error__reload" href="/">
          重新加载
        </a>
      </div>
    </main>
  )
}
