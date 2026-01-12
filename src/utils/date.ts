/**
 * 日期工具函数
 */

/**
 * 将日期转换为 ISO 字符串
 * @param date - 日期字符串或 Date 对象
 * @returns ISO 格式的日期字符串，如果输入为空则返回 undefined
 */
export function toISOString(date: string | Date | undefined): string | undefined {
  if (!date) return undefined
  return typeof date === "string" ? date : new Date(date).toISOString()
}

