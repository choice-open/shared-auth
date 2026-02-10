/**
 * HTTP 错误映射工具
 *
 * 提供统一的 HTTP 状态码到错误类型的映射
 */

/** 通用 HTTP 错误类型 */
export type HttpErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "unknown"

/**
 * 将 HTTP 状态码映射为错误类型
 *
 * @param status - HTTP 状态码
 * @returns 对应的错误类型
 */
export function mapHttpStatusToError(status: number): HttpErrorType {
  switch (status) {
    case 400:
      return "bad_request"
    case 401:
      return "unauthorized"
    case 403:
      return "forbidden"
    case 404:
      return "not_found"
    case 429:
      return "rate_limited"
    default:
      return "unknown"
  }
}
