import type { ReactNode } from 'react'
import { ClassDataContext } from '../data/class-context'
import type { ClassData } from '../data/class-data'

export function ClassDataProvider({
  data,
  children,
}: {
  data: ClassData
  children: ReactNode
}) {
  return (
    <ClassDataContext.Provider value={data}>{children}</ClassDataContext.Provider>
  )
}
