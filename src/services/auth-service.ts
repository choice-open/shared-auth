/**
 * 认证服务
 *
 * 封装所有认证相关的业务逻辑：
 * - 登录（OAuth、MagicLink、Email/Password）
 * - 注册
 * - 登出
 * - 账户删除
 *
 * 职责分离：
 * - 调用 API 层发送请求
 * - 调用 StoreActions 更新状态（不直接操作 authStore）
 * - 处理业务流程（如注册后 onboard）
 */

import type { SessionUser } from "../types"
import type { TokenStorage } from "../api"
import type { AuthApi } from "../api/auth-api"
import type { StoreActions } from "../store/actions"

export interface AuthServiceConfig {
  authApi: AuthApi
  storeActions: StoreActions
  tokenStorage: TokenStorage
}

export interface BetterAuthClientMethods {
  deleteUser?: (
    options: { callbackURL?: string; password?: string },
    callbacks?: {
      onError?: (context: { error: Error }) => void
      onSuccess?: (context: { response: Response }) => void
    }
  ) => Promise<unknown>
  signIn: {
    email?: (
      credentials: { email: string; password: string },
      options?: {
        onError?: (context: { error: Error }) => void
        onSuccess?: (context: { response: Response }) => void
      }
    ) => Promise<unknown>
    magicLink?: (options: {
      callbackURL: string
      email: string
      name?: string
      newUserCallbackURL?: string
    }) => Promise<unknown>
    social: (options: {
      callbackURL: string
      errorCallbackURL?: string
      newUserCallbackURL?: string
      provider: string
    }) => Promise<unknown>
  }
  signOut: () => Promise<unknown>
  signUp?: {
    email?: (
      credentials: { callbackURL?: string; email: string; metadata?: Record<string, unknown>; name: string; password: string },
      options?: {
        onError?: (context: { error: Error }) => void
        onSuccess?: (context: { response: Response }) => void
      }
    ) => Promise<unknown>
  }
}

/**
 * 创建认证服务
 */
export function createAuthService(
  config: AuthServiceConfig,
  betterAuthClient: BetterAuthClientMethods
) {
  const { authApi, storeActions, tokenStorage } = config

  // ============================================================
  // Session 管理
  // ============================================================

  /**
   * 使用 Token 获取并设置 session
   * 成功后更新 authStore
   */
  async function fetchAndSetSession(token: string): Promise<SessionUser | null> {
    try {
      if (!token) {
        throw new Error("Token is required")
      }

      tokenStorage.save(token)

      // 复用 authApi 的 getSessionWithToken
      const userData = await authApi.getSessionWithToken(token)

      if (userData) {
        storeActions.setAuthenticated(userData)
        return userData
      } else {
        storeActions.clearAuth()
        return null
      }
    } catch {
      storeActions.clearAuth()
      return null
    }
  }

  // ============================================================
  // OAuth 登录
  // ============================================================

  /**
   * OAuth 登录
   * 跳转到第三方提供商进行认证
   */
  async function signInWithOAuth(
    provider: string,
    callbackURL: string,
    newUserCallbackURL?: string,
    errorCallbackURL?: string
  ): Promise<void> {
    if (storeActions.isLoading()) {
      return
    }

    try {
      storeActions.setLoading(true)
      storeActions.setError(null)

      await betterAuthClient.signIn.social({
        provider,
        callbackURL,
        newUserCallbackURL,
        errorCallbackURL,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed"
      storeActions.setError(message)
      storeActions.setLoading(false)
    }
  }

  // ============================================================
  // Magic Link 登录
  // ============================================================

  /**
   * Magic Link 登录
   * 发送魔法链接到用户邮箱
   */
  async function signInWithMagicLink(
    email: string,
    callbackURL: string,
    name?: string,
    newUserCallbackURL?: string
  ): Promise<boolean> {
    if (storeActions.isLoading()) {
      return false
    }

    if (!betterAuthClient.signIn.magicLink) {
      storeActions.setError("Magic link is not available. Please add magicLinkClient() plugin.")
      return false
    }

    try {
      storeActions.setLoading(true)
      storeActions.setError(null)

      await betterAuthClient.signIn.magicLink({
        email,
        name,
        callbackURL,
        newUserCallbackURL,
      })

      storeActions.setLoading(false)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send magic link"
      storeActions.setError(message)
      storeActions.setLoading(false)
      return false
    }
  }

  // ============================================================
  // Email/Password 登录
  // ============================================================

  /**
   * Email/Password 登录
   */
  async function signInWithEmail(
    email: string,
    password: string
  ): Promise<{ emailVerified?: boolean; success: boolean }> {
    if (storeActions.isLoading()) {
      return { success: false }
    }

    if (!betterAuthClient.signIn.email) {
      storeActions.setError("Email sign in is not available.")
      return { success: false }
    }

    try {
      storeActions.setLoading(true)
      storeActions.setError(null)

      let success = false
      let errorMessage: string | null = null

      await betterAuthClient.signIn.email(
        { email, password },
        {
          onSuccess: (context) => {
            const token = context.response.headers.get("set-auth-token")
            if (token) {
              tokenStorage.save(token)
            }
            success = true
          },
          onError: (context) => {
            const errorCode = (context.error as { code?: string }).code
            if (errorCode) {
              errorMessage = JSON.stringify({ code: errorCode, message: context.error.message })
            } else {
              errorMessage = context.error.message || "Login failed"
            }
          },
        }
      )

      if (errorMessage) {
        storeActions.setError(errorMessage)
        storeActions.setLoading(false)
        return { success: false }
      }

      // 登录成功后获取 session
      let emailVerified: boolean | undefined
      if (success) {
        const token = tokenStorage.get()
        if (token) {
          const session = await fetchAndSetSession(token)
          emailVerified = session?.emailVerified
        }
      }

      storeActions.setLoading(false)
      return { success, emailVerified }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed"
      storeActions.setError(message)
      storeActions.setLoading(false)
      return { success: false }
    }
  }

  // ============================================================
  // Email/Password 注册
  // ============================================================

  /**
   * Email/Password 注册
   *
   * 流程：
   * 1. 调用 signUp.email 创建用户
   * 2. 保存 token
   * 3. 调用 onboard 创建默认组织和团队
   * 4. 发送验证邮件（如果邮箱未验证）
   */
  async function signUpWithEmail(
    email: string,
    password: string,
    name: string,
    callbackURL?: string
  ): Promise<{ emailVerified?: boolean; success: boolean }> {
    if (storeActions.isLoading()) {
      return { success: false }
    }

    if (!betterAuthClient.signUp?.email) {
      storeActions.setError("Email sign up is not available.")
      return { success: false }
    }

    try {
      storeActions.setLoading(true)
      storeActions.setError(null)

      const finalCallbackURL =
        callbackURL ||
        `${window.location.origin}/auth/callback?type=signup&email=${encodeURIComponent(email)}`

      let success = false
      let errorMessage: string | null = null

      await betterAuthClient.signUp.email(
        {
          email,
          password,
          name,
          callbackURL: finalCallbackURL,
          metadata: {},
        },
        {
          onSuccess: (context) => {
            const token = context.response.headers.get("set-auth-token")
            if (token) {
              tokenStorage.save(token)
            }
            success = true
          },
          onError: (context) => {
            const errorCode = (context.error as { code?: string }).code
            if (errorCode) {
              errorMessage = JSON.stringify({ code: errorCode, message: context.error.message })
            } else {
              errorMessage = context.error.message || "Sign up failed"
            }
          },
        }
      )

      if (errorMessage) {
        storeActions.setError(errorMessage)
        storeActions.setLoading(false)
        return { success: false }
      }

      // 注册成功后的处理
      let emailVerified: boolean | undefined
      if (success) {
        const token = tokenStorage.get()
        if (token) {
          // 获取 session
          const session = await fetchAndSetSession(token)
          emailVerified = session?.emailVerified

          // 如果用户还没有默认组织，调用 onboard 创建
          if (!session?.inherentOrganizationId) {
            try {
              await authApi.onboard(token)
            } catch {
              // onboard 失败不影响注册结果
            }
          }

          // 如果邮箱未验证，发送验证邮件
          if (emailVerified !== true) {
            try {
              await authApi.resendVerificationEmail(email, finalCallbackURL)
            } catch {
              // 发送验证邮件失败不影响注册结果
            }
          }
        }
      }

      storeActions.setLoading(false)
      return { success, emailVerified }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed"
      storeActions.setError(message)
      storeActions.setLoading(false)
      return { success: false }
    }
  }

  // ============================================================
  // 登出
  // ============================================================

  /**
   * 登出
   */
  async function signOut(redirectTo?: string): Promise<void> {
    if (storeActions.isLoading()) {
      return
    }

    try {
      storeActions.setLoading(true)
      storeActions.setError(null)

      await betterAuthClient.signOut()

      storeActions.clearAuth()

      if (redirectTo) {
        window.location.href = redirectTo
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign out failed"
      storeActions.setError(message)
      storeActions.clearAuth()
    } finally {
      storeActions.setLoading(false)
    }
  }

  // ============================================================
  // 账户删除
  // ============================================================

  /**
   * 删除用户账号
   *
   * Better Auth 流程：
   * 1. 调用 deleteUser API
   * 2. 后端发送验证邮件
   * 3. 用户点击邮件中的链接确认删除
   */
  async function deleteUser(
    callbackURL: string,
    password?: string
  ): Promise<{ needsVerification: boolean; success: boolean }> {
    if (storeActions.isLoading()) {
      return { needsVerification: false, success: false }
    }

    if (!betterAuthClient.deleteUser) {
      storeActions.setError("Delete user is not available.")
      return { needsVerification: false, success: false }
    }

    try {
      storeActions.setLoading(true)
      storeActions.setError(null)

      let errorMessage: string | null = null

      await betterAuthClient.deleteUser(
        { callbackURL, password },
        {
          onSuccess: () => {
            // onSuccess 表示验证邮件已发送成功
          },
          onError: (context) => {
            const error = context.error as { code?: string; message?: string }
            errorMessage = error.message || "Delete user failed"
          },
        }
      )

      storeActions.setLoading(false)

      if (errorMessage) {
        storeActions.setError(errorMessage)
        return { needsVerification: false, success: false }
      }

      return { needsVerification: true, success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete user failed"
      storeActions.setError(message)
      storeActions.setLoading(false)
      return { needsVerification: false, success: false }
    }
  }

  // ============================================================
  // 返回公共方法
  // ============================================================

  return {
    // Session
    fetchAndSetSession,

    // 登录
    signInWithOAuth,
    signInWithMagicLink,
    signInWithEmail,

    // 注册
    signUpWithEmail,

    // 登出
    signOut,

    // 账户
    deleteUser,
  }
}

export type AuthService = ReturnType<typeof createAuthService>
