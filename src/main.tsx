import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BootScreen } from './components/BootScreen'
import { ConfigError } from './components/ConfigError'
import { ClassTomlError, loadClassData, type ClassData } from './data/class-data'
import './styles/tokens.css'
import './styles/hero.css'
import './styles/sections.css'
import './styles/dialog.css'

document.documentElement.classList.add('js')

const root = createRoot(document.getElementById('root')!)
const configUrl = `${import.meta.env.BASE_URL}class.toml`

const applyDocumentMeta = (data: ClassData) => {
  document.title = data.meta.title

  const description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  )
  if (description) description.content = data.meta.description

  const ogTitle = document.querySelector<HTMLMetaElement>(
    'meta[property="og:title"]',
  )
  if (ogTitle) ogTitle.content = data.meta.title

  const ogDescription = document.querySelector<HTMLMetaElement>(
    'meta[property="og:description"]',
  )
  if (ogDescription) ogDescription.content = data.meta.description
}

const showError = (error: unknown) => {
  console.error(error)
  document.title = '配置有误 · 毕业纪念'
  const issues =
    error instanceof ClassTomlError
      ? error.issues
      : ['无法读取 class.toml，请确认文件存在且可访问。']
  root.render(
    <StrictMode>
      <ConfigError title="class.toml 配置有误" issues={issues} />
    </StrictMode>,
  )
}

const boot = async () => {
  try {
    const response = await fetch(configUrl, { cache: 'no-store' })
    if (!response.ok) {
      throw new ClassTomlError([
        `无法读取 class.toml（HTTP ${response.status}）。`,
        '请确认项目根目录存在 class.toml。',
      ])
    }

    const data = loadClassData(await response.text())
    applyDocumentMeta(data)
    root.render(
      <StrictMode>
        <App data={data} />
      </StrictMode>,
    )
  } catch (error) {
    showError(error)
  }
}

root.render(
  <StrictMode>
    <BootScreen />
  </StrictMode>,
)
void boot()
