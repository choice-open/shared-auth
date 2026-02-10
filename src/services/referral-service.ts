/**
 * 邀请码服务
 *
 * 提供邀请码相关的业务逻辑：
 * - 提交邀请码
 * - 查询邀请记录
 * - 检查用户是否需要填写邀请码
 * - 提取用户邀请码字段
 */

import type { ApiClient, ApiResponse } from "../api"
import type { SessionUser } from "../types"

// ===== Types =====

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

/** 邀请码 API 错误类型 */
export type ReferralErrorType = "already_referred" | "not_found" | "unknown"

/** 删除邀请码 API 错误类型 */
export type RemoveReferralErrorType = "not_found" | "forbidden" | "unknown"

/** 提交邀请码的结果 */
export interface ReferralResult {
  error: ReferralErrorType | undefined
  success: boolean
}

/** 删除邀请码的结果 */
export interface RemoveReferralResult {
  error: RemoveReferralErrorType | undefined
  success: boolean
}

/** 邀请记录 */
export interface ReferralRecord {
  createdAt: string
  id: string
  referree?: {
    email: string | undefined
    image: string | undefined
    name: string | undefined
  }
  referreeId: string
  referrerId: string
  status: string
}

/** GET /referral 响应 */
export interface ListReferralsResponse {
  referrals: ReferralRecord[]
}

/** 邀请码检查选项 */
export interface NeedsReferralOptions {
  /** 跳过检查的角色列表，默认 ["admin"] */
  skipRoles?: string[]
}

// ===== Service =====

export interface ReferralService {
  /** 查询当前用户的邀请记录 */
  listReferrals: () => Promise<ReferralRecord[]>
  /** 删除邀请记录 */
  removeReferral: (referralId: string) => Promise<RemoveReferralResult>
  /** 提交邀请码 */
  submitReferralCode: (referralCode: string) => Promise<ReferralResult>
}

/**
 * 创建邀请码服务
 */
export function createReferralService(apiClient: ApiClient): ReferralService {
  async function submitReferralCode(referralCode: string): Promise<ReferralResult> {
    const response: ApiResponse<ReferralResponse> = await apiClient.post<ReferralResponse>(
      "/v1/auth/referral",
      { referralCode },
    )

    if (response.ok) {
      return { success: true, error: undefined }
    }

    let error: ReferralErrorType = "unknown"
    if (response.status === 400) {
      error = "already_referred"
    } else if (response.status === 404) {
      error = "not_found"
    }

    return { success: false, error }
  }

  async function listReferrals(): Promise<ReferralRecord[]> {
    try {
      const response: ApiResponse<ListReferralsResponse> =
        await apiClient.get<ListReferralsResponse>("/v1/auth/referral")
      if (response.ok) {
        return response.data.referrals
      }
      return []
    } catch {
      return []
    }
  }

  async function removeReferral(referralId: string): Promise<RemoveReferralResult> {
    const response = await apiClient.delete(`/v1/auth/referral/${referralId}`)

    if (response.ok) {
      return { success: true, error: undefined }
    }

    let error: RemoveReferralErrorType = "unknown"
    if (response.status === 404) {
      error = "not_found"
    } else if (response.status === 403) {
      error = "forbidden"
    }

    return { success: false, error }
  }

  return { listReferrals, removeReferral, submitReferralCode }
}

// ===== Utilities =====

/**
 * 检查用户是否需要完成邀请码步骤
 *
 * 仅检查用户状态，不包含 feature flag 判断（由应用层控制）
 */
export function needsReferral(
  user: SessionUser | null,
  options?: NeedsReferralOptions,
): boolean {
  if (!user) return false
  if (user.emailVerified !== true) return false

  const skipRoles = options?.skipRoles ?? ["admin"]
  if (user.role && skipRoles.includes(user.role)) return false

  const { referredBy } = user
  return !referredBy || referredBy.trim() === ""
}

/**
 * 提取用户的邀请码相关字段
 */
export function getReferralFields(user: SessionUser | null) {
  return {
    referralCode: user?.referralCode,
    referredBy: user?.referredBy,
  }
}
