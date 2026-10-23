import type { Student } from '../data/provinces'
import { comparePinyin } from './pinyin'

export type UniversityGroup = {
  readonly university: string
  readonly students: readonly Student[]
}

/**
 * Same-school classmates are kept together. Within a school, names are
 * pinyin-sorted; the schools themselves are pinyin-sorted by university name.
 */
export const groupByUniversity = (
  students: readonly Student[],
): readonly UniversityGroup[] => {
  const groups = new Map<string, Student[]>()

  students.forEach((student) => {
    const group = groups.get(student.university)
    if (group) group.push(student)
    else groups.set(student.university, [student])
  })

  return [...groups]
    .map(([university, members]) => ({
      university,
      students: [...members].sort((a, b) => comparePinyin(a.name, b.name)),
    }))
    .sort((a, b) => comparePinyin(a.university, b.university))
}
