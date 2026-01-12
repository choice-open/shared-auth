/**
 * 认证 API
 *
 * 所有认证相关的 HTTP 请求
 * 统一使用 apiClient 发送请求
 */

import type {
  Account,
  MagicLinkRequest,
  OAuthAccountInfo,
  RevokeSessionRequest,
  SessionUser,
  UpdateUserRequest,
  UserSession,
} from "../types"
import { extractSessionUser } from "../utils"
import type { ApiClient } from "./client"

/**
 * 创建认证 API
 *
 * @param apiClient - API 客户端实例
 */
export function createAuthApi(apiClient: ApiClient) {
  return {
    // ============================================================
    // Session 管理
    // ============================================================

    /**
     * 获取当前 session
     * 使用 tokenStorage 中的 token
     */
    async getSession(): Promise<SessionUser | null> {
      const response = await apiClient.get<unknown>("/v1/auth/get-session")
      if (!response.ok) return null

      try {
        return extractSessionUser(response.data)
      } catch {
        return null
      }
    },

    /**
     * 使用指定 token 获取 session
     * 用于 OAuth 回调等场景
     */
    async getSessionWithToken(token: string): Promise<SessionUser | null> {
      const response = await apiClient.get<unknown>("/v1/auth/get-session", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.status}`)
      }

      return extractSessionUser(response.data)
    },

    // ============================================================
    // 用户 Onboarding
    // ============================================================

    /**
     * 用户 Onboard
     * 创建默认的伴生组织和团队
     */
    async onboard(token: string): Promise<void> {
      const response = await apiClient.post("/v1/auth/onboard", undefined, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Failed to onboard: ${response.status}`)
      }
    },

    // ============================================================
    // 用户信息
    // ============================================================

    /**
     * 更新用户信息
     */
    async updateUser(data: UpdateUserRequest): Promise<SessionUser | null> {
      const response = await apiClient.post<{ status: boolean }>(
        "/v1/auth/update-user",
        data
      )
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`)
      }
      return this.getSession()
    },

    // ============================================================
    // Magic Link
    // ============================================================

    /**
     * 发送 Magic Link
     */
    async sendMagicLink(params: MagicLinkRequest): Promise<{ status: boolean }> {
      const response = await apiClient.post<{ status: boolean }>(
        "/v1/auth/sign-in/magic-link",
        params
      )

      if (!response.ok) {
        throw new Error(`Failed to send magic link: ${response.status}`)
      }

      return response.data
    },

    // ============================================================
    // 邮箱验证
    // ============================================================

    /**
     * 重新发送验证邮件
     */
    async resendVerificationEmail(
      email: string,
      callbackURL?: string
    ): Promise<{ status: boolean }> {
      const finalCallbackURL =
        callbackURL ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?type=signup&email=${encodeURIComponent(email)}`
          : `/auth/callback?type=signup&email=${encodeURIComponent(email)}`)

      const response = await apiClient.post<{ status: boolean }>(
        "/v1/auth/send-verification-email",
        { email, callbackURL: finalCallbackURL }
      )

      if (!response.ok) {
        throw new Error(`Failed to resend verification email: ${response.status}`)
      }

      return response.data
    },

    /**
     * 检查邮箱是否已被注册
     *
     * @returns true 表示邮箱已被注册，false 表示可用
     */
    async checkEmailExists(email: string): Promise<boolean> {
      try {
        const response = await apiClient.get<{ success: boolean }>(
          `/v1/auth/check-email?email=${encodeURIComponent(email)}`
        )

        if (!response.ok) {
          return false
        }

        // 后端返回 success: true 表示邮箱可用（未注册）
        return response.data.success === false
      } catch {
        return false
      }
    },

    // ============================================================
    // 密码管理
    // ============================================================

    /**
     * 为已登录用户绑定密码
     * 用于通过 OAuth 或 Magic Link 登录的用户设置密码
     */
    async linkCredential(newPassword: string, token?: string): Promise<void> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.post(
        "/v1/auth/link-credential",
        { newPassword },
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to link credential: ${response.status}`)
      }
    },

    /**
     * 更改密码
     */
    async changePassword(
      currentPassword: string,
      newPassword: string,
      token?: string
    ): Promise<{ success: boolean }> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.post<{ success: boolean }>(
        "/v1/auth/change-password",
        { currentPassword, newPassword },
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to change password: ${response.status}`)
      }

      return response.data
    },

    // ============================================================
    // 邮箱更改
    // ============================================================

    /**
     * 更改邮箱
     */
    async changeEmail(
      newEmail: string,
      callbackURL?: string,
      token?: string
    ): Promise<{ success: boolean }> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.post<{ code?: string; message?: string, success: boolean; }>(
        "/v1/auth/change-email",
        { newEmail, callbackURL },
        options
      )

      if (!response.ok) {
        // 提取服务器返回的错误代码
        const errorData = response.data as { code?: string; message?: string }
        if (errorData?.code) {
          throw new Error(JSON.stringify({ code: errorData.code, message: errorData.message }))
        }
        throw new Error(`Failed to change email: ${response.status}`)
      }

      return response.data
    },

    // ============================================================
    // 账户管理
    // ============================================================

    /**
     * 获取用户关联的所有账户
     *
     * 返回用户通过不同方式登录的账户列表
     * - credential: 邮箱密码登录
     * - github: GitHub OAuth 登录
     * - 其他 OAuth 提供商
     */
    async listAccounts(token?: string): Promise<Account[]> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.get<Account[]>(
        "/v1/auth/list-accounts",
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to list accounts: ${response.status}`)
      }

      return response.data
    },

    /**
     * 获取 OAuth 账户详细信息
     *
     * 通过 accountId 获取 OAuth 提供商的用户详细信息
     * 如 GitHub 用户的 email、name、avatar 等
     */
    async getOAuthAccountInfo(
      accountId: string,
      token?: string
    ): Promise<OAuthAccountInfo | null> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      try {
        const response = await apiClient.get<OAuthAccountInfo>(
          `/v1/auth/account-info?accountId=${encodeURIComponent(accountId)}`,
          options
        )

        if (!response.ok) {
          return null
        }

        return response.data
      } catch {
        return null
      }
    },

    /**
     * 取消关联 OAuth 账户
     *
     * 解除用户与 OAuth 提供商的关联
     */
    async unlinkAccount(
      providerId: string,
      accountId?: string,
      token?: string
    ): Promise<{ success: boolean }> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.post<{ success: boolean }>(
        "/v1/auth/unlink-account",
        { accountId, providerId },
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to unlink account: ${response.status}`)
      }

      return response.data
    },

    /**
     * 删除用户账户
     */
    async deleteUser(
      password?: string,
      callbackURL?: string,
      token?: string
    ): Promise<{ message: string; success: boolean }> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.post<{ message: string; success: boolean }>(
        "/v1/auth/delete-user",
        { password, callbackURL },
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`)
      }

      return response.data
    },

    // ============================================================
    // 会话管理
    // ============================================================

    /**
     * 获取当前用户的所有会话
     */
    async listSessions(token?: string): Promise<UserSession[]> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.get<UserSession[]>(
        "/v1/auth/list-sessions",
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to list sessions: ${response.status}`)
      }

      return response.data
    },

    /**
     * 撤销指定会话
     */
    async revokeSession(
      params: RevokeSessionRequest,
      token?: string
    ): Promise<{ success: boolean }> {
      const options = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined

      const response = await apiClient.post<{ success: boolean }>(
        "/v1/auth/revoke-session",
        params,
        options
      )

      if (!response.ok) {
        throw new Error(`Failed to revoke session: ${response.status}`)
      }

      return response.data
    },
  }
}

export type AuthApi = ReturnType<typeof createAuthApi>
