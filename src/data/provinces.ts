export const REGIONS = ['华北', '东北', '华东', '华中', '华南', '西南', '西北'] as const

export type Region = (typeof REGIONS)[number]

export const PROVINCE_REGION = {
  北京: '华北', 天津: '华北', 河北: '华北', 山西: '华北', 内蒙古: '华北',
  辽宁: '东北', 吉林: '东北', 黑龙江: '东北',
  上海: '华东', 江苏: '华东', 浙江: '华东', 安徽: '华东', 福建: '华东',
  江西: '华东', 山东: '华东', 台湾: '华东',
  河南: '华中', 湖北: '华中', 湖南: '华中',
  广东: '华南', 广西: '华南', 海南: '华南', 香港: '华南', 澳门: '华南',
  重庆: '西南', 四川: '西南', 贵州: '西南', 云南: '西南', 西藏: '西南',
  陕西: '西北', 甘肃: '西北', 青海: '西北', 宁夏: '西北', 新疆: '西北',
} as const satisfies Record<string, Region>

export type Province = keyof typeof PROVINCE_REGION

export const PROVINCES = Object.freeze(
  Object.keys(PROVINCE_REGION) as Province[],
)

export type Student = {
  readonly name: string
  readonly university: string
}

export type Destination = {
  readonly province: Province
  readonly region: Region
  readonly students: readonly Student[]
}

export type Teacher = {
  readonly subject: string
  readonly name: string
  readonly message: string
  readonly headTeacher: boolean
}

const PROVINCE_SUFFIX = /(壮族自治区|回族自治区|维吾尔自治区|特别行政区|自治区|省|市)$/u

export function toProvince(value: string): Province | undefined {
  const trimmed = value.trim()
  if (trimmed in PROVINCE_REGION) return trimmed as Province

  const stripped = trimmed.replace(PROVINCE_SUFFIX, '')
  return stripped in PROVINCE_REGION ? (stripped as Province) : undefined
}
