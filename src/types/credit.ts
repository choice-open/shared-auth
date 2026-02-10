/**
 * Credit 类型定义
 *
 * 提供 Credit 相关的类型定义：
 * - Credit 基础类型
 * - Batch 类型
 * - Consumption 类型
 * - 请求/响应类型
 * - 错误类型
 * - 结果类型
 */

// ===== 基础类型 =====

/** Owner 类型 */
export type CreditOwnerType = "user" | "organization"

/** Credit 来源类型 */
export type CreditSource =
  | "freebie"
  | "internal"
  | "purchase"
  | "reward_referred"
  | "reward_launched"
  | "subscription"

/** 分页元数据 */
export interface CreditMeta {
  limit: number
  offset: number
  pages: number
  total: number
}

// ===== Credit Available =====

/** 可用 Credit 数据 */
export interface CreditAvailable {
  /** 可用金额 */
  amount: string
  /** 创建时间 */
  createdAt: string | null
  /** 过期时间 */
  expiresAt: string | null
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
}

/** 查询可用 Credit 请求 */
export interface GetCreditAvailableRequest {
  /** 起始时间 (可选) */
  from?: string
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
}

// ===== Credit Batch =====

/** Credit Batch 数据 */
export interface CreditBatch {
  /** 创建时间 */
  createdAt: string
  /** 创建者 */
  createdBy: string
  /** 过期时间 */
  expiresAt: string
  /** 唯一标识符 */
  id: string
  /** 初始金额 */
  initialAmount: string
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
  /** 剩余金额 */
  remainingAmount: string
  /** 来源类型 */
  source: CreditSource
  /** 来源 ID */
  sourceId: string | null
  /** 更新时间 */
  updatedAt: string
}

/** 列出 Credit Batches 请求 */
export interface ListCreditBatchesRequest {
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
  /** 来源类型 (可选) */
  source?: CreditSource
}

/** 创建 Credit Batch 请求 */
export interface CreateCreditBatchRequest {
  /** 创建者 */
  createdBy?: string
  /** 过期时间 */
  expiresAt: string
  /** 初始金额 */
  initialAmount: string
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
  /** 来源类型 */
  source: CreditSource
  /** 来源 ID */
  sourceId?: string | null
}

/** 更新 Credit Batch 请求 */
export interface UpdateCreditBatchRequest {
  /** Batch ID */
  id: string
  /** 剩余金额 */
  remainingAmount: string
}

// ===== Credit Consumption =====

/** Credit Consumption 元数据 */
export type CreditConsumptionMetadata =
  | string
  | number
  | boolean
  | null
  | Record<string, string>
  | string[]

/** Credit Consumption 数据 */
export interface CreditConsumption {
  /** 消费金额 */
  amount: string
  /** 关联的 Batch ID */
  batchId: string
  /** 记账者 */
  bookkeeper: string
  /** 创建时间 */
  createdAt: string
  /** 唯一标识符 */
  id: string
  /** 幂等键 */
  idempotencyKey: string
  /** 元数据 */
  metadata: CreditConsumptionMetadata
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
}

/** 列出 Credit Consumptions 请求 */
export interface ListCreditConsumptionsRequest {
  /** Batch ID (可选) */
  batchId?: string
  /** 记账者 (可选) */
  bookkeeper?: string
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
}

/** 创建 Credit Consumption 请求 */
export interface CreateCreditConsumptionRequest {
  /** 消费金额 */
  amount: string
  /** 记账者 */
  bookkeeper: string
  /** 幂等键 */
  idempotencyKey: string
  /** 元数据 (可选) */
  metadata?: CreditConsumptionMetadata
  /** 所有者 ID */
  ownerId: string
  /** 所有者类型 */
  ownerType: CreditOwnerType
}

// ===== 响应类型 =====

/** 通用 API 响应包装 */
export interface CreditApiResponse<T> {
  data: T
  meta: CreditMeta | null
}

// ===== 错误类型 =====

/** Credit 操作错误类型 */
export type CreditErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "insufficient_credits"
  | "unknown"

// ===== 结果类型 =====

/** 获取可用 Credit 结果 */
export interface GetCreditAvailableResult {
  /** 可用 Credit 数据 */
  data: CreditAvailable | undefined
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出 Credit Batches 结果 */
export interface ListCreditBatchesResult {
  /** Batches 列表 */
  data: CreditBatch[]
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 分页元数据 */
  meta: CreditMeta | null
  /** 是否成功 */
  success: boolean
}

/** 获取单个 Credit Batch 结果 */
export interface GetCreditBatchResult {
  /** Batch 数据 */
  data: CreditBatch | undefined
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 创建 Credit Batch 结果 */
export interface CreateCreditBatchResult {
  /** 创建的 Batch 数据 */
  data: CreditBatch | undefined
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 更新 Credit Batch 结果 */
export interface UpdateCreditBatchResult {
  /** 更新后的 Batch 数据 */
  data: CreditBatch | undefined
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出 Credit Consumptions 结果 */
export interface ListCreditConsumptionsResult {
  /** Consumptions 列表 */
  data: CreditConsumption[]
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 分页元数据 */
  meta: CreditMeta | null
  /** 是否成功 */
  success: boolean
}

/** 创建 Credit Consumption 结果 */
export interface CreateCreditConsumptionResult {
  /** 创建的 Consumption 记录列表 (可能从多个 batch 扣除) */
  data: CreditConsumption[]
  /** 错误类型 */
  error: CreditErrorType | undefined
  /** 是否成功 */
  success: boolean
}
