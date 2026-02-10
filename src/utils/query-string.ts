/**
 * 查询字符串工具
 *
 * 提供统一的 URL 查询字符串构建功能
 */

/** 查询参数值类型 */
export type QueryParamValue = string | number | boolean | undefined | null

/**
 * 构建 URL 查询字符串
 *
 * @param params - 查询参数对象
 * @returns 格式化的查询字符串（包含 ? 前缀），如果没有参数则返回空字符串
 *
 * @example
 * ```typescript
 * buildQueryString({ name: "test", active: true, page: undefined })
 * // Returns: "?name=test&active=true"
 *
 * buildQueryString({})
 * // Returns: ""
 * ```
 */
export function buildQueryString(
  params: Record<string, QueryParamValue>
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null
  )

  if (entries.length === 0) {
    return ""
  }

  const queryString = entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&")

  return `?${queryString}`
}
