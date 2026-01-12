/**
 * 认证回调服务
 *
 * 处理各种认证回调流程：
 * - OAuth 回调（社交登录）
 * - 邮箱验证回调
 * - 删除用户回调
 * - 密码重置回调
 * - 团队邀请回调
 * - 更改邮箱回调
 */

import type { AuthInstance } from "../core"
import { CallbackConfig, CallbackResult, CallbackType } from "../types"



const defaultConfig: Required<CallbackConfig> = {
  lang: "us",
  defaultRedirect: "/",
  signInPath: "/sign-in",
  linkExpiredPath: "/auth/link-expired",
  deleteSuccessPath: "/auth/delete-success",
  resetPasswordPath: "/reset-password",
}

/**
 * 创建回调服务
 */
export function createCallbackService(auth: AuthInstance, config: CallbackConfig = {}) {
  const cfg = { ...defaultConfig, ...config }

  /**
   * 处理 OAuth 回调
   *
   * 当 OAuth 登录成功后，会带着 token 跳转回来
   * 需要保存 token 并获取 session
   */
  async function handleOAuthCallback(
    token: string,
    isNewUser: boolean = false
  ): Promise<CallbackResult> {
    if (!token) {
      return {
        success: false,
        error: "Token is required",
        redirectTo: `${cfg.signInPath}?lang=${cfg.lang}`,
      }
    }

    try {
      // 保存 token 并获取 session
      const session = await auth.authService.fetchAndSetSession(token)

      if (!session) {
        return {
          success: false,
          error: "Failed to get session",
          redirectTo: `${cfg.signInPath}?lang=${cfg.lang}`,
        }
      }

      // 新用户且没有默认组织，执行 onboard
      if (isNewUser && !session.inherentOrganizationId) {
        try {
          await auth.authApi.onboard(token)
          // 重新获取 session 以获取新的组织信息
          await auth.authService.fetchAndSetSession(token)
        } catch {
          // onboard 失败不影响登录结果
        }
      }

      return {
        success: true,
        redirectTo: cfg.defaultRedirect,
        data: { session, isNewUser },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "OAuth callback failed",
        redirectTo: `${cfg.signInPath}?lang=${cfg.lang}`,
      }
    }
  }

  /**
   * 处理邮箱验证回调
   *
   * 用户点击验证邮件中的链接后调用
   */
  async function handleEmailVerificationCallback(token: string): Promise<CallbackResult> {
    if (!token) {
      return {
        success: false,
        error: "Token is required",
        redirectTo: `${cfg.linkExpiredPath}?type=signup&lang=${cfg.lang}`,
      }
    }

    return new Promise((resolve) => {
      auth.authClient.verifyEmail(
        { query: { token } },
        {
          onSuccess: (ctx) => {
            if (ctx.data?.status !== true) {
              resolve({
                success: false,
                error: "Verification failed",
                redirectTo: `${cfg.linkExpiredPath}?type=signup&lang=${cfg.lang}`,
              })
              return
            }

            // 更新本地状态
            const user = auth.authStore.user.get()
            if (user) {
              auth.storeActions.updateUser({ emailVerified: true })
            }

            resolve({
              success: true,
              redirectTo: cfg.defaultRedirect,
            })
          },
          onError: (ctx) => {
            const errorCode = (ctx.error as { code?: string }).code
            const isExpired =
              errorCode === "INVALID_TOKEN" || ctx.error.message?.includes("expired")

            if (isExpired) {
              // 链接过期，清理本地状态
              auth.authClient.signOut().catch(() => {})
              auth.storeActions.clearAuth()
            }

            resolve({
              success: false,
              error: ctx.error.message,
              errorCode,
              redirectTo: `${cfg.linkExpiredPath}?type=signup&lang=${cfg.lang}`,
            })
          },
        }
      )
    })
  }

  /**
   * 处理删除用户回调
   *
   * 用户点击删除确认邮件中的链接后调用
   * 注意：需要用户已登录才能执行删除
   */
  async function handleDeleteUserCallback(
    token: string,
    userEmail?: string
  ): Promise<CallbackResult> {
    if (!token) {
      return {
        success: false,
        error: "Token is required",
        redirectTo: `${cfg.linkExpiredPath}?type=delete-user&lang=${cfg.lang}`,
      }
    }

    // 检查是否已登录
    const isAuthenticated = auth.authStore.isAuthenticated.get()
    if (!isAuthenticated) {
      return {
        success: false,
        needsLogin: true,
        error: "Please login to confirm account deletion",
        data: { token },
      }
    }

    return new Promise((resolve) => {
      auth.authClient.deleteUser(
        { token },
        {
          onSuccess: () => {
            const email = userEmail || auth.authStore.user.get()?.email
            const emailParam = email ? `&email=${encodeURIComponent(email)}` : ""

            resolve({
              success: true,
              redirectTo: `${cfg.deleteSuccessPath}?lang=${cfg.lang}${emailParam}`,
            })
          },
          onError: (ctx) => {
            const errorCode = (ctx.error as { code?: string }).code
            const isExpired =
              errorCode === "INVALID_TOKEN" || ctx.error.message?.includes("expired")

            resolve({
              success: false,
              error: ctx.error.message,
              errorCode,
              redirectTo: isExpired
                ? `${cfg.linkExpiredPath}?type=delete-user&lang=${cfg.lang}`
                : `${cfg.signInPath}?lang=${cfg.lang}`,
            })
          },
        }
      )
    })
  }

  /**
   * 处理密码重置回调
   *
   * 用户点击密码重置邮件中的链接后调用
   * 不执行实际操作，只验证 token 有效性并返回重定向 URL
   */
  function handlePasswordResetCallback(token: string | null): CallbackResult {
    if (token) {
      return {
        success: true,
        redirectTo: `${cfg.resetPasswordPath}?token=${token}&lang=${cfg.lang}`,
      }
    }

    return {
      success: true,
      redirectTo: `${cfg.resetPasswordPath}?lang=${cfg.lang}`,
    }
  }

  /**
   * 处理团队邀请回调
   *
   * 流程：
   * - 已登录：直接接受邀请，成功后跳转到 workspace
   * - 未登录：存储 invitationId，跳转到登录页
   */
  async function handleInviteCallback(invitationId: string | null): Promise<CallbackResult> {
    if (!invitationId) {
      return {
        success: false,
        error: "Invitation ID is required",
        redirectTo: cfg.defaultRedirect,
      }
    }

    // 等待认证状态加载完成
    await auth.waitForAuth()

    const token = auth.tokenStorage.get()

    // 未登录：跳转到登录页，invitationId 通过 URL 传递
    if (!token) {
      return {
        success: true,
        redirectTo: `${cfg.signInPath}?lang=${cfg.lang}&invitationId=${invitationId}`,
      }
    }

    // 已登录：直接接受邀请
    try {
      const result = await auth.organizationApi.acceptInvitation({ invitationId })

      // 如果邀请包含 teamId，跳转到对应团队
      if (result?.invitation?.teamId) {
        // 设置 active organization 和 team
        if (result.invitation.organizationId) {
          await auth.setActiveOrganizationAndTeam(
            result.invitation.organizationId,
            result.invitation.teamId,
          )
        } else {
          await auth.setActiveTeam({ teamId: result.invitation.teamId })
        }

        // 获取团队名称用于通知
        let teamName = ""
        try {
          const teams = await auth.teamApi.listUserTeams()
          const joinedTeam = teams.find((t) => t.id === result.invitation?.teamId)
          teamName = joinedTeam?.name || ""
        } catch {
          // 获取失败不影响主流程
        }

        const teamNameParam = teamName ? `&teamName=${encodeURIComponent(teamName)}` : ""
        return {
          success: true,
          redirectTo: `/workspace/team/${result.invitation.teamId}?notification=inviteAccepted${teamNameParam}&lang=${cfg.lang}`,
        }
      }

      return {
        success: true,
        redirectTo: `${cfg.defaultRedirect}?notification=inviteAccepted&lang=${cfg.lang}`,
      }
    } catch {
      return {
        success: false,
        error: "Failed to accept invitation",
        redirectTo: `${cfg.defaultRedirect}?notification=inviteFailed&lang=${cfg.lang}`,
      }
    }
  }

  /**
   * 处理确认更改邮箱回调（第一步：验证当前邮箱）
   *
   * 用户点击当前邮箱中的验证链接后调用
   * 验证成功后，better-auth 会自动发送验证邮件到新邮箱
   *
   * 注意：此步骤不需要登录，token 本身就是验证身份的方式
   * token 中已包含 updateTo 字段（新邮箱），newEmail 参数是可选的
   *
   * 关键：callbackURL 参数会告诉 better-auth 在验证成功后
   * 向新邮箱发送的验证链接应该指向哪里
   */
  async function handleConfirmChangeEmailCallback(
    token: string,
    newEmail?: string
  ): Promise<CallbackResult> {
    if (!token) {
      return {
        success: false,
        error: "Token is required",
        redirectTo: `${cfg.linkExpiredPath}?type=confirm-change-email&lang=${cfg.lang}`,
      }
    }

    // newEmail 是可选的，token 中已包含新邮箱信息
    // 尝试从 token 解析新邮箱（用于显示）
    let displayEmail = newEmail || ""
    if (!displayEmail) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        displayEmail = payload.updateTo || ""
      } catch {
        // 解析失败，继续执行
      }
    }

    // 不需要检查登录状态，token 本身就是验证方式

    // 构建新邮箱验证的 callbackURL
    // 当 verifyEmail 成功后，better-auth 会发送验证邮件到新邮箱
    // 新邮箱中的链接会指向这个 callbackURL
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const callbackURL = `${origin}/auth/callback?type=verify-change-email&lang=${cfg.lang}`

    return new Promise((resolve) => {
      auth.authClient
        .verifyEmail(
          { query: { token, callbackURL } },
          {
            onSuccess: (ctx) => {
              if (ctx.data?.status !== true) {
                resolve({
                  success: false,
                  error: "Verification failed",
                  redirectTo: `${cfg.linkExpiredPath}?type=confirm-change-email&lang=${cfg.lang}`,
                })
                return
              }

              // 验证成功，better-auth 已发送验证邮件到新邮箱
              // 跳转到 verify-email 页面
              resolve({
                success: true,
                redirectTo: `/verify-email?email=${encodeURIComponent(displayEmail)}&type=change-email&lang=${cfg.lang}`,
              })
            },
            onError: (ctx) => {
              const errorCode = (ctx.error as { code?: string }).code
              const isExpired =
                errorCode === "INVALID_TOKEN" || ctx.error.message?.includes("expired")

              resolve({
                success: false,
                error: ctx.error.message,
                errorCode,
                redirectTo: isExpired
                  ? `${cfg.linkExpiredPath}?type=confirm-change-email&lang=${cfg.lang}`
                  : `${cfg.signInPath}?lang=${cfg.lang}`,
              })
            },
          }
        )
        .catch(() => {
          // CORS 错误等网络问题时，后端可能已经成功处理
          // 假设成功，跳转到 verify-email 页面
          resolve({
            success: true,
            redirectTo: `/verify-email?email=${encodeURIComponent(displayEmail)}&type=change-email&lang=${cfg.lang}`,
          })
        })
    })
  }

  /**
   * 处理验证新邮箱回调（第二步：验证新邮箱）
   *
   * 用户点击新邮箱中的验证链接后调用
   * 验证成功后，邮箱更改完成
   *
   * 注意：此步骤不需要登录，token 本身就是验证身份的方式
   *
   * 成功后：
   * - 有 authToken（已登录）→ 跳转到首页，显示通知
   * - 没有 authToken（未登录）→ 跳转到登录页，显示通知，预填充新邮箱
   */
  async function handleVerifyChangeEmailCallback(token: string): Promise<CallbackResult> {
    if (!token) {
      return {
        success: false,
        error: "Token is required",
        redirectTo: `${cfg.linkExpiredPath}?type=verify-change-email&lang=${cfg.lang}`,
      }
    }

    // 尝试从 token 中解析新邮箱地址
    let newEmail = ""
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      newEmail = payload.updateTo || payload.email || ""
    } catch {
      // 解析失败，继续执行
    }

    // 构建成功后的跳转 URL
    const buildSuccessRedirect = () => {
      const authToken = auth.tokenStorage.get()
      const emailParam = newEmail ? `&email=${encodeURIComponent(newEmail)}` : ""

      if (authToken) {
        // 已登录，跳转到首页
        return `${cfg.defaultRedirect}?notification=emailChanged${emailParam}&lang=${cfg.lang}`
      } else {
        // 未登录，跳转到登录页，预填充新邮箱
        return `${cfg.signInPath}?notification=emailChanged${emailParam}&lang=${cfg.lang}`
      }
    }

    return new Promise((resolve) => {
      auth.authClient
        .verifyEmail(
          { query: { token } },
          {
            onSuccess: async (ctx) => {
              if (ctx.data?.status !== true) {
                resolve({
                  success: false,
                  error: "Verification failed",
                  redirectTo: `${cfg.linkExpiredPath}?type=verify-change-email&lang=${cfg.lang}`,
                })
                return
              }

              // 邮箱更改成功，刷新用户信息
              const authToken = auth.tokenStorage.get()
              if (authToken) {
                auth.authService.fetchAndSetSession(authToken).catch(() => {})

                // 自动取消关联 GitHub 账户（如果有）
                try {
                  const accounts = await auth.authApi.listAccounts(authToken)
                  const githubAccount = accounts.find((a) => a.providerId === "github")
                  if (githubAccount) {
                    await auth.authApi.unlinkAccount("github", githubAccount.accountId, authToken)
                  }
                } catch {
                  // 取消关联失败不影响邮箱更改成功
                }
              }

              resolve({
                success: true,
                redirectTo: buildSuccessRedirect(),
              })
            },
            onError: (ctx) => {
              const errorCode = (ctx.error as { code?: string }).code
              const isExpired =
                errorCode === "INVALID_TOKEN" || ctx.error.message?.includes("expired")

              resolve({
                success: false,
                error: ctx.error.message,
                errorCode,
                redirectTo: isExpired
                  ? `${cfg.linkExpiredPath}?type=verify-change-email&lang=${cfg.lang}`
                  : `${cfg.signInPath}?lang=${cfg.lang}`,
              })
            },
          }
        )
        .catch(() => {
          // CORS 错误等网络问题时，后端可能已经成功处理
          // 假设成功
          resolve({
            success: true,
            redirectTo: buildSuccessRedirect(),
          })
        })
    })
  }

  /**
   * 统一处理各种回调
   */
  async function handleCallback(
    type: CallbackType,
    token: string | null,
    options: {
      invitationId?: string
      isNewUser?: boolean
      newEmail?: string
      userEmail?: string
    } = {}
  ): Promise<CallbackResult> {
    const { isNewUser = false, userEmail, invitationId, newEmail } = options

    // 无类型参数
    if (!type) {
      return { success: true, redirectTo: cfg.defaultRedirect }
    }

    switch (type) {
      case "signup":
        return handleEmailVerificationCallback(token || "")

      case "delete-user":
        return handleDeleteUserCallback(token || "", userEmail)

      case "reset-password":
        return handlePasswordResetCallback(token)

      case "invite":
        return handleInviteCallback(invitationId || null)

      case "confirm-change-email":
        return handleConfirmChangeEmailCallback(token || "", newEmail || "")

      case "verify-change-email":
        return handleVerifyChangeEmailCallback(token || "")

      default:
        return { success: true, redirectTo: cfg.defaultRedirect }
    }
  }

  return {
    handleOAuthCallback,
    handleEmailVerificationCallback,
    handleDeleteUserCallback,
    handlePasswordResetCallback,
    handleInviteCallback,
    handleConfirmChangeEmailCallback,
    handleVerifyChangeEmailCallback,
    handleCallback,
  }
}

export type CallbackService = ReturnType<typeof createCallbackService>
