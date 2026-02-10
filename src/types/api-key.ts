/**
 * API Key 类型定义
 *
 * 提供 API Key 相关的类型定义：
 * - API Key 基础类型
 * - 请求/响应类型
 * - 错误类型
 * - 结果类型
 */

// ===== API Key 基础类型 =====

/** API Key 对象 */
export interface ApiKey {
  /** 唯一标识符 */
  id: string
  /** 创建时间 */
  createdAt: string
  /** 是否启用 */
  enabled: boolean
  /** 过期时间 */
  expiresAt?: string | null
  /** 最后请求时间 */
  lastRequest?: string | null
  /** 最后刷新时间 */
  lastRefillAt?: string | null
  /** 元数据 */
  metadata?: Record<string, unknown> | null
  /** API Key 名称 */
  name?: string | null
  /** 权限 (JSON 字符串) */
  permissions?: string | null
  /** API Key 前缀 */
  prefix?: string | null
  /** 速率限制是否启用 */
  rateLimitEnabled: boolean
  /** 速率限制最大请求数 */
  rateLimitMax?: number | null
  /** 速率限制时间窗口 (毫秒) */
  rateLimitTimeWindow?: number | null
  /** 刷新数量 */
  refillAmount?: number | null
  /** 刷新间隔 (毫秒) */
  refillInterval?: number | null
  /** 剩余请求数 */
  remaining?: number | null
  /** 当前时间窗口内的请求计数 */
  requestCount: number
  /** API Key 起始字符 (用于显示) */
  start?: string | null
  /** 更新时间 */
  updatedAt: string
  /** 所属用户 ID */
  userId: string
}

/** 创建 API Key 时返回的完整响应 (包含 key) */
export interface ApiKeyWithSecret extends ApiKey {
  /** 完整的 API Key (仅创建时返回) */
  key: string
}

// ===== 请求类型 =====

/** 创建 API Key 请求 */
export interface CreateApiKeyRequest {
  /** 过期时间 (必填，可为 null) */
  expiresIn: string | null
  /** 元数据 */
  metadata?: string | null
  /** API Key 名称 */
  name?: string | null
  /** 权限 */
  permissions?: string | null
  /** API Key 前缀 */
  prefix?: string | null
  /** 速率限制是否启用 */
  rateLimitEnabled?: boolean | null
  /** 速率限制最大请求数 */
  rateLimitMax?: number | null
  /** 速率限制时间窗口 (毫秒) */
  rateLimitTimeWindow?: number | null
  /** 刷新数量 */
  refillAmount?: number | null
  /** 刷新间隔 (毫秒) */
  refillInterval?: number | null
  /** 剩余请求数 (必填，可为 null) */
  remaining: number | null
  /** 所属用户 ID (server-only) */
  userId?: string | null
}

/** 更新 API Key 请求 */
export interface UpdateApiKeyRequest {
  /** 是否启用 */
  enabled?: boolean | null
  /** 过期时间 (必填) */
  expiresIn: string
  /** API Key ID (必填) */
  keyId: string
  /** 元数据 */
  metadata?: string | null
  /** API Key 名称 */
  name?: string | null
  /** 权限 (必填) */
  permissions: string
  /** 速率限制是否启用 */
  rateLimitEnabled?: boolean | null
  /** 速率限制最大请求数 */
  rateLimitMax?: number | null
  /** 速率限制时间窗口 (毫秒) */
  rateLimitTimeWindow?: number | null
  /** 刷新数量 */
  refillAmount?: number | null
  /** 刷新间隔 (毫秒) */
  refillInterval?: number | null
  /** 剩余请求数 */
  remaining?: number | null
  /** 所属用户 ID (server-only) */
  userId?: string | null
}

/** 删除 API Key 请求 */
export interface DeleteApiKeyRequest {
  /** API Key ID */
  keyId: string
}

/** 获取 API Key 请求 */
export interface GetApiKeyRequest {
  /** API Key ID */
  id: string
}

// ===== 响应类型 =====

/** 删除 API Key 响应 */
export interface DeleteApiKeyResponse {
  /** 是否删除成功 */
  success: boolean
}

// ===== 错误类型 =====

/** API Key 操作错误类型 */
export type ApiKeyErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "unknown"

// ===== 结果类型 =====

/** API Key 操作结果 */
export interface ApiKeyResult {
  /** 错误类型 */
  error: ApiKeyErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 创建 API Key 结果 */
export interface CreateApiKeyResult {
  /** 创建的 API Key (成功时返回) */
  apiKey: ApiKeyWithSecret | undefined
  /** 错误类型 */
  error: ApiKeyErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 获取 API Key 结果 */
export interface GetApiKeyResult {
  /** API Key (成功时返回) */
  apiKey: ApiKey | undefined
  /** 错误类型 */
  error: ApiKeyErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 更新 API Key 结果 */
export interface UpdateApiKeyResult {
  /** 更新后的 API Key (成功时返回) */
  apiKey: ApiKey | undefined
  /** 错误类型 */
  error: ApiKeyErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出 API Keys 结果 */
export interface ListApiKeysResult {
  /** API Keys 列表 (成功时返回) */
  apiKeys: ApiKey[]
  /** 错误类型 */
  error: ApiKeyErrorType | undefined
  /** 是否成功 */
  success: boolean
}
