/**
 * 认证工具函数
 */

/**
 * 验证邮箱格式
 *
 * @param email - 要验证的邮箱
 * @returns 如果是有效的邮箱格式返回 true，否则返回 false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Better Auth 已知错误代码
 */
export const AUTH_ERROR_CODES = [
  "PASSWORD_TOO_SHORT",
  "PASSWORD_TOO_LONG",
  "INVALID_EMAIL_OR_PASSWORD",
  "INVALID_EMAIL",
  "INVALID_PASSWORD",
  "USER_NOT_FOUND",
  "USER_ALREADY_EXISTS",
  "EMAIL_NOT_VERIFIED",
  "TOO_MANY_REQUESTS",
  "INVALID_TOKEN",
  "SESSION_EXPIRED",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "METADATA_IS_REQUIRED",
] as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]

/**
 * 解析的认证错误结构
 */
export interface ParsedAuthError {
  /** 错误代码（如果有） */
  code: AuthErrorCode | null
  /** 是否是已知的错误代码 */
  isKnownError: boolean,
  /** 原始错误消息 */
  message: string
}

/**
 * 解析 Better Auth 错误
 *
 * 支持的格式：
 * - JSON: {"code":"PASSWORD_TOO_SHORT","message":"..."}
 * - 纯文本错误消息
 *
 * 注意：此函数只解析错误，不翻译。翻译由项目自行处理。
 *
 * @param error - 错误字符串
 * @returns 解析后的错误结构
 */
export function parseAuthError(error: string | null): ParsedAuthError {
  if (!error) {
    return { code: null, message: "", isKnownError: false }
  }

  // 尝试解析 JSON 格式的错误
  try {
    const parsed = JSON.parse(error)
    if (parsed.code && typeof parsed.code === "string") {
      const code = parsed.code as AuthErrorCode
      const isKnown = AUTH_ERROR_CODES.includes(code)
      return {
        code: isKnown ? code : null,
        message: parsed.message || error,
        isKnownError: isKnown,
      }
    }
  } catch {
    // 不是 JSON 格式
  }

  // 检查错误消息是否包含已知的错误代码
  for (const code of AUTH_ERROR_CODES) {
    if (error.includes(code)) {
      return {
        code,
        message: error,
        isKnownError: true,
      }
    }
  }

  // 返回原始错误消息
  return {
    code: null,
    message: error,
    isKnownError: false,
  }
}

/**
 * 检查错误是否是 token 过期
 */
export function isTokenExpiredError(error: string | ParsedAuthError | null): boolean {
  if (!error) return false

  const parsed = typeof error === "string" ? parseAuthError(error) : error

  if (parsed.code === "INVALID_TOKEN" || parsed.code === "SESSION_EXPIRED") {
    return true
  }

  if (parsed.message.includes("expired")) {
    return true
  }

  return false
}

/**
 * 从用户名生成邮箱本地部分（注册时如果没有提供 name，使用 email 前缀）
 */
export function getNameFromEmail(email: string): string {
  return email.split("@")[0] || ""
}

/**
 * 构建带参数的 URL
 */
export function buildAuthUrl(
  basePath: string,
  params: Record<string, string | undefined | null>
): string {
  const url = new URL(basePath, window.location.origin)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value)
    }
  }

  return url.toString()
}

/**
 * 构建相对路径带参数
 */
export function buildAuthPath(
  path: string,
  params: Record<string, string | undefined | null>
): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value)
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `${path}?${queryString}` : path
}

/**
 * 清除 URL 中的认证相关参数
 */
export function clearAuthParams(): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  const paramsToRemove = ["token", "isNew", "type", "error"]

  let hasChanges = false
  for (const param of paramsToRemove) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param)
      hasChanges = true
    }
  }

  if (hasChanges) {
    window.history.replaceState({}, "", url.pathname + url.search)
  }
}

