import { pinyin } from 'pinyin-pro'

const pinyinInitial = (value: string): string =>
  pinyin(value, {
    pattern: 'first',
    toneType: 'none',
    type: 'array',
  })[0]?.toLowerCase() ?? ''

const pinyinFull = (value: string): string =>
  pinyin(value, { toneType: 'none' }).toLowerCase()

/**
 * Single phonetic comparator for every Chinese value the UI orders.
 * pinyin-pro computes the keys; no hand-maintained initials or TOML order.
 */
export const comparePinyin = (a: string, b: string): number =>
  pinyinInitial(a).localeCompare(pinyinInitial(b)) ||
  pinyinFull(a).localeCompare(pinyinFull(b)) ||
  a.localeCompare(b)
