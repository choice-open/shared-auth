/**
 * 环境变量工具函数
 */

/**
 * 检查是否为开发环境
 */
export const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false

/**
 * 安全获取环境变量
 * @param key - 环境变量名
 * @returns 环境变量值，不存在则返回 undefined
 */
export function getEnvVar(key: string): string | undefined {
  return (import.meta as { env?: Record<string, string> }).env?.[key]
}

/**
 * 获取 OneAuth API 基础 URL
 * @param fallback - 默认值
 * @returns OneAuth API 基础 URL
 */
export function getAuthBaseUrl(fallback = "https://oneauth.choiceform.io"): string {
  return getEnvVar("VITE_ONEAUTH_BASE_URL") || fallback
}

