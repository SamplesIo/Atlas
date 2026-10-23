import { createContext, useContext } from 'react'
import type { ClassData } from './class-data'

export const ClassDataContext = createContext<ClassData | null>(null)

export function useClassData(): ClassData {
  const data = useContext(ClassDataContext)
  if (!data) {
    throw new Error('useClassData 必须在 ClassDataProvider 内使用。')
  }
  return data
}
