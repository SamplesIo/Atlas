import { parse } from 'smol-toml'
import {
  PROVINCE_REGION,
  PROVINCES,
  REGIONS,
  toProvince,
  type Destination,
  type Province,
  type Region,
  type Student,
  type Teacher,
} from './provinces'

export type SchoolIdentity = {
  readonly name: string
  readonly nameEn: string
  readonly className: string
  readonly classCode: string
  readonly seal: string
  readonly heroTitle: string
  readonly englishEyebrow: string
  readonly archiveNumber: string
}

export type SiteCopy = {
  readonly heroPhrase: string
  readonly motto: string
  readonly mottoEn: string
  readonly statsTitle: string
  readonly statsNote: string
  readonly rosterNote: string
  readonly letterTitle: string
  readonly letterAside: string
  readonly letterKicker: string
  readonly letterBody: readonly string[]
  readonly letterDate: string
  readonly letterStamp: string
  readonly letterSeal: string
  readonly footerMotto: string
}

export type ClassTotals = {
  readonly students: number
  readonly provinces: number
  readonly universities: number
  readonly teachers: number
}

export type ClassData = {
  readonly school: SchoolIdentity
  readonly copy: SiteCopy
  readonly teachers: readonly Teacher[]
  readonly headTeacher: Teacher
  readonly destinations: readonly Destination[]
  readonly destinationsSorted: readonly Destination[]
  readonly destinationByProvince: ReadonlyMap<Province, Destination>
  readonly destinationsByRegion: Record<Region, readonly Destination[]>
  readonly totals: ClassTotals
  readonly meta: {
    readonly title: string
    readonly description: string
  }
}

export class ClassTomlError extends Error {
  readonly issues: readonly string[]

  constructor(issues: readonly string[]) {
    super(issues.join('\n'))
    this.name = 'ClassTomlError'
    this.issues = issues
  }
}

type UnknownRecord = Record<string, unknown>

const normalizeNewlines = (value: string): string => value.replace(/\r\n?/g, '\n')

const readRecord = (value: unknown, path: string): UnknownRecord => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ClassTomlError([`${path} 必须是一个 TOML 表。`])
  }
  return value as UnknownRecord
}

const readString = (record: UnknownRecord, key: string, path: string): string => {
  const value = record[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ClassTomlError([`${path}.${key} 必须是非空字符串。`])
  }
  return normalizeNewlines(value.trim())
}

const readOptionalString = (
  record: UnknownRecord,
  key: string,
  fallback: string,
): string => {
  const value = record[key]
  if (value === undefined) return fallback
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ClassTomlError([`${key} 必须是非空字符串。`])
  }
  return normalizeNewlines(value.trim())
}

const readArray = (
  value: unknown,
  path: string,
  minimum = 1,
): readonly unknown[] => {
  if (!Array.isArray(value) || value.length < minimum) {
    throw new ClassTomlError([
      `${path} 至少需要 ${minimum} 项。`,
    ])
  }
  return value
}

const readStringArray = (
  record: UnknownRecord,
  key: string,
  path: string,
): readonly string[] => {
  const value = readArray(record[key], `${path}.${key}`)
  return value.map((item, index) => {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new ClassTomlError([`${path}.${key}[${index}] 必须是非空字符串。`])
    }
    return normalizeNewlines(item.trim())
  })
}

const SEAL_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'] as const

const sealFromCode = (classCode: string): string =>
  [...classCode]
    .map((character) => {
      const digit = Number(character)
      return Number.isInteger(digit) ? SEAL_DIGITS[digit] : character
    })
    .slice(0, 4)
    .join('') || classCode

const interpolate = (
  template: string,
  values: { school: string; class: string; classCode: string },
): string =>
  template.replace(/\{(school|class|classCode)\}/g, (_, key: keyof typeof values) => values[key])

const byRegion = <T>(valueOf: (region: Region) => T): Record<Region, T> =>
  Object.fromEntries(
    REGIONS.map((region) => [region, valueOf(region)]),
  ) as Record<Region, T>

const groupByRegion = (
  destinations: readonly Destination[],
): Record<Region, readonly Destination[]> =>
  byRegion((region) =>
    destinations.filter((destination) => destination.region === region),
  )

const sortDestinations = (destinations: readonly Destination[]): readonly Destination[] => {
  const regionOrder = new Map(REGIONS.map((region, index) => [region, index]))
  return [...destinations].sort(
    (a, b) =>
      regionOrder.get(a.region)! - regionOrder.get(b.region)! ||
      b.students.length - a.students.length ||
      a.province.localeCompare(b.province, 'zh-Hans-CN'),
  )
}

export function loadClassData(source: string): ClassData {
  let raw: unknown
  try {
    raw = parse(source)
  } catch (error) {
    throw new ClassTomlError([
      'class.toml 存在 TOML 语法错误，请检查引号与段落格式。',
      error instanceof Error ? error.message : String(error),
    ])
  }

  const root = readRecord(raw, 'class.toml')
  const schoolTable = readRecord(root.school, '[school]')
  const name = readString(schoolTable, 'name', '[school]')
  const nameEn = readString(schoolTable, 'name_en', '[school]')
  const className = readString(schoolTable, 'class_name', '[school]')
  const classCode = readString(schoolTable, 'class_code', '[school]')
  const seal = readOptionalString(schoolTable, 'seal', sealFromCode(classCode))

  const copyTable = readRecord(root.copy, '[copy]')
  const templateValues = { school: name, class: className, classCode }
  const text = (key: string): string =>
    interpolate(readString(copyTable, key, '[copy]'), templateValues)
  const letterBody = readStringArray(copyTable, 'letter_body', '[copy]').map(
    (paragraph) => interpolate(paragraph, templateValues),
  )

  const copy: SiteCopy = {
    heroPhrase: text('hero_phrase'),
    motto: text('motto'),
    mottoEn: text('motto_en'),
    statsTitle: text('stats_title'),
    statsNote: text('stats_note'),
    rosterNote: text('roster_note'),
    letterTitle: text('letter_title'),
    letterAside: text('letter_aside'),
    letterKicker: text('letter_kicker'),
    letterBody,
    letterDate: text('letter_date'),
    letterStamp: text('letter_stamp'),
    letterSeal: text('letter_seal'),
    footerMotto: text('footer_motto'),
  }

  const teacherEntries = readArray(root.teachers, 'teachers')
  const teachers: readonly Teacher[] = teacherEntries.map((entry, index) => {
    const path = `teachers[${index}]`
    const table = readRecord(entry, path)
    const subject = readString(table, 'subject', path)
    const teacherName = readString(table, 'name', path)
    const message = readString(table, 'message', path)
    const headTeacher = table.head_teacher === true
    if (table.head_teacher !== undefined && typeof table.head_teacher !== 'boolean') {
      throw new ClassTomlError([`${path}.head_teacher 必须是 true 或 false。`])
    }
    return { subject, name: teacherName, message, headTeacher }
  })

  const headTeachers = teachers.filter((teacher) => teacher.headTeacher)
  if (headTeachers.length !== 1) {
    throw new ClassTomlError([
      'teachers 中必须有且只有一位班主任（head_teacher = true）。',
      `当前找到 ${headTeachers.length} 位。`,
    ])
  }
  const headTeacher = headTeachers[0]

  const studentEntries = readArray(root.students, 'students')
  const studentsByProvince = new Map<Province, Student[]>()

  studentEntries.forEach((entry, index) => {
    const path = `students[${index}]`
    const table = readRecord(entry, path)
    const provinceText = readString(table, 'province', path)
    const province = toProvince(provinceText)
    if (!province) {
      throw new ClassTomlError([
        `${path}.province = "${provinceText}" 不是有效省份。`,
        `可用省份：${PROVINCES.join('、')}`,
      ])
    }

    const student: Student = {
      name: readString(table, 'name', path),
      university: readString(table, 'university', path),
    }

    const group = studentsByProvince.get(province)
    if (group) group.push(student)
    else studentsByProvince.set(province, [student])
  })

  const destinations: readonly Destination[] = [...studentsByProvince].map(
    ([province, students]) => ({
      province,
      region: PROVINCE_REGION[province],
      students,
    }),
  )

  const destinationsSorted = sortDestinations(destinations)
  const destinationByProvince = new Map(
    destinations.map((destination) => [destination.province, destination]),
  )
  const totals: ClassTotals = {
    students: destinations.reduce((sum, item) => sum + item.students.length, 0),
    provinces: destinations.length,
    universities: new Set(
      destinations.flatMap((item) =>
        item.students.map((student) => student.university),
      ),
    ).size,
    teachers: teachers.length,
  }

  const school: SchoolIdentity = {
    name,
    nameEn,
    className,
    classCode,
    seal,
    heroTitle: `${name} ${className}`,
    englishEyebrow: `${nameEn} · CLASS ${classCode}`,
    archiveNumber: `No. ${classCode}`,
  }

  return {
    school,
    copy,
    teachers,
    headTeacher,
    destinations,
    destinationsSorted,
    destinationByProvince,
    destinationsByRegion: groupByRegion(destinationsSorted),
    totals,
    meta: {
      title: `${school.heroTitle} · ${copy.heroPhrase}`,
      description: `${school.heroTitle}${copy.heroPhrase}：${totals.students} 位同学，${totals.provinces} 个省市，${totals.universities} 所高校的毕业纪念。`,
    },
  }
}
