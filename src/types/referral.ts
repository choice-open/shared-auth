/**
 * Referral 类型定义
 *
 * 提供邀请码相关的类型定义：
 * - 邀请记录
 * - 请求/响应类型
 * - 错误类型
 * - 结果类型
 */

// ===== 基础类型 =====

/** 邀请记录 */
export interface ReferralRecord {
  /** 创建时间 */
  createdAt: string
  /** 唯一标识符 */
  id: string
  /** 被邀请人信息 */
  referree?: {
    email: string | undefined
    image: string | undefined
    name: string | undefined
  }
  /** 被邀请人 ID */
  referreeId: string
  /** 邀请人 ID */
  referrerId: string
  /** 状态 */
  status: string
}

// ===== 请求类型 =====

/** 提交邀请码请求 */
export interface SubmitReferralRequest {
  /** 邀请码 */
  referralCode: string
}

/** 删除邀请记录请求 */
export interface RemoveReferralRequest {
  /** 被邀请人 ID */
  referreeId: string
}

// ===== 响应类型 =====

/** POST /referral 响应 */
export interface ReferralResponse {
  referral: {
    createdAt: string
    id: string
    referreeId: string
    referrerId: string
    status: string
  }
}

/** GET /referral 响应 */
export interface ListReferralsResponse {
  referrals: ReferralRecord[]
}

// ===== 错误类型 =====

/** 提交邀请码错误类型 */
export type ReferralErrorType = "already_referred" | "not_found" | "unknown"

/** 删除邀请记录错误类型 */
export type RemoveReferralErrorType = "forbidden" | "not_found" | "unknown"

// ===== 结果类型 =====

/** 提交邀请码结果 */
export interface ReferralResult {
  /** 错误类型 */
  error: ReferralErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 删除邀请记录结果 */
export interface RemoveReferralResult {
  /** 错误类型 */
  error: RemoveReferralErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出邀请记录结果 */
export interface ListReferralsResult {
  /** 邀请记录列表 */
  data: ReferralRecord[]
  /** 错误类型 */
  error: ReferralErrorType | undefined
  /** 是否成功 */
  success: boolean
}

// ===== 工具类型 =====

/** 邀请码检查选项 */
export interface NeedsReferralOptions {
  /** 跳过检查的角色列表，默认 ["admin"] */
  skipRoles?: string[]
}
