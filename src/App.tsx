import { useCallback, useState } from 'react'
import type { ClassData } from './data/class-data'
import { ClassDataProvider } from './components/ClassDataProvider'
import type { Destination } from './data/provinces'
import { DestinationIndex } from './components/DestinationIndex'
import { Hero } from './components/Hero'
import { InkDepth } from './components/InkDepth'
import { TeacherWishes } from './components/TeacherWishes'
import { ProvinceDialog } from './components/ProvinceDialog'
import { SiteFooter } from './components/SiteFooter'
import { StatsBand } from './components/StatsBand'
import { useReveal } from './hooks/useReveal'

type AppProps = {
  data: ClassData
}

export default function App({ data }: AppProps) {
  const [selected, setSelected] = useState<Destination | null>(null)
  const openDialog = useCallback(
    (destination: Destination) => setSelected(destination),
    [],
  )
  const closeDialog = useCallback(() => setSelected(null), [])

  useReveal()

  return (
    <ClassDataProvider data={data}>
      <div className="site">
        <InkDepth />
        <a className="skip-link" href="#roster">
          跳至星散录
        </a>
        <div className="site-grain" aria-hidden="true" />

        <main>
          <Hero onOpen={openDialog} />
          <StatsBand />
          <DestinationIndex />
          <TeacherWishes />
        </main>

        <SiteFooter />
        <ProvinceDialog destination={selected} onClose={closeDialog} />
      </div>
    </ClassDataProvider>
  )
}
