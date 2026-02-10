/**
 * 邀请码服务
 *
 * 提供邀请码相关的业务逻辑：
 * - 提交邀请码
 * - 查询邀请记录
 * - 删除邀请记录
 * - 检查用户是否需要填写邀请码
 * - 提取用户邀请码字段
 */

import type { ApiClient, ApiResponse } from "../api"
import type { SessionUser } from "../types"
import type {
  ListReferralsResponse,
  ListReferralsResult,
  NeedsReferralOptions,
  ReferralErrorType,
  ReferralResponse,
  ReferralResult,
  RemoveReferralErrorType,
  RemoveReferralResult,
} from "../types/referral"

// ===== Constants =====

const BASE_PATH = "/v1/auth/referral"

// ===== Helper Functions =====

/**
 * 将 HTTP 状态码映射为 Referral 错误类型
 */
function mapStatusToReferralError(status: number): ReferralErrorType {
  switch (status) {
    case 400:
      return "already_referred"
    case 404:
      return "not_found"
    default:
      return "unknown"
  }
}

/**
 * 将 HTTP 状态码映射为 RemoveReferral 错误类型
 */
function mapStatusToRemoveReferralError(
  status: number
): RemoveReferralErrorType {
  switch (status) {
    case 403:
      return "forbidden"
    case 404:
      return "not_found"
    default:
      return "unknown"
  }
}

// ===== Service Interface =====

export interface ReferralService {
  /** 查询当前用户的邀请记录 */
  listReferrals: () => Promise<ListReferralsResult>
  /** 删除邀请记录（需要 admin 权限） */
  removeReferral: (referreeId: string) => Promise<RemoveReferralResult>
  /** 提交邀请码 */
  submitReferralCode: (referralCode: string) => Promise<ReferralResult>
}

// ===== Service Implementation =====

/**
 * 创建邀请码服务
 */
export function createReferralService(apiClient: ApiClient): ReferralService {
  /**
   * 提交邀请码
   */
  async function submitReferralCode(
    referralCode: string
  ): Promise<ReferralResult> {
    try {
      const response: ApiResponse<ReferralResponse> =
        await apiClient.post<ReferralResponse>(BASE_PATH, { referralCode })

      if (response.ok) {
        return { success: true, error: undefined }
      }

      return {
        success: false,
        error: mapStatusToReferralError(response.status),
      }
    } catch {
      return { success: false, error: "unknown" }
    }
  }

  /**
   * 查询当前用户的邀请记录
   */
  async function listReferrals(): Promise<ListReferralsResult> {
    try {
      const response: ApiResponse<ListReferralsResponse> =
        await apiClient.get<ListReferralsResponse>(BASE_PATH)

      if (response.ok) {
        return {
          success: true,
          data: response.data.referrals || [],
          error: undefined,
        }
      }

      return {
        success: false,
        data: [],
        error: mapStatusToReferralError(response.status),
      }
    } catch {
      return { success: false, data: [], error: "unknown" }
    }
  }

  /**
   * 删除邀请记录（需要 admin 权限）
   */
  async function removeReferral(
    referreeId: string
  ): Promise<RemoveReferralResult> {
    try {
      const response = await apiClient.post("/v1/auth/delete-referral", {
        referreeId,
      })

      if (response.ok) {
        return { success: true, error: undefined }
      }

      return {
        success: false,
        error: mapStatusToRemoveReferralError(response.status),
      }
    } catch {
      return { success: false, error: "unknown" }
    }
  }

  return {
    listReferrals,
    removeReferral,
    submitReferralCode,
  }
}

// ===== Utilities =====

/**
 * 检查用户是否需要完成邀请码步骤
 *
 * 仅检查用户状态，不包含 feature flag 判断（由应用层控制）
 */
export function needsReferral(
  user: SessionUser | null,
  options?: NeedsReferralOptions
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

// ===== Re-export Types =====

export type {
  ListReferralsResponse,
  ListReferralsResult,
  NeedsReferralOptions,
  ReferralErrorType,
  ReferralRecord,
  ReferralResponse,
  ReferralResult,
  RemoveReferralErrorType,
  RemoveReferralResult,
} from "../types/referral"
