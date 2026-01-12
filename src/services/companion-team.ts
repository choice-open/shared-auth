/**
 * Companion Team 服务
 *
 * 在用户登录成功后自动设置组织和团队上下文
 */

import type { AuthInstance } from "../core"
import type { CompanionTeamOptions } from "../types"

/**
 * 设置 Companion Team
 *
 * @param auth - Auth 实例
 * @param token - 认证 token
 * @param options - 选项
 */
export async function setupCompanionTeam(
  auth: AuthInstance,
  token: string,
  options: CompanionTeamOptions = {}
): Promise<void> {
  const { onComplete, onError } = options

  try {
    if (!token?.trim()) return

    // 从 storeActions 获取当前 session，避免重复请求
    const currentUser = auth.storeActions.getUser()
    if (!currentUser) return

    // 已有活动组织和团队，无需处理
    if (currentUser.activeOrganizationId && currentUser.activeTeamId) {
      onComplete?.()
      return
    }

    // 没有 inherent 字段，说明 onboard 还没执行成功
    // 注意：邮箱密码注册时已经调用过 onboard，这里只是兜底
    if (!currentUser.inherentOrganizationId || !currentUser.inherentTeamId) {
      try {
        await auth.authApi.onboard(token)
        // onboard 后需要刷新 session 获取新的 inherent 字段
        const session = await auth.authApi.getSessionWithToken(token)
        if (session) {
          updateAuthStore(auth, session)
        }
      } catch {
        // onboard 失败不阻塞流程
      }

      onComplete?.()
      return
    }

    // 设置活动组织和团队（使用统一方法，自动同步 authStore）
    if (!currentUser.activeOrganizationId && currentUser.inherentOrganizationId) {
      if (!currentUser.activeTeamId && currentUser.inherentTeamId) {
        // 同时设置组织和团队
        await auth.setActiveOrganizationAndTeam(
          currentUser.inherentOrganizationId,
          currentUser.inherentTeamId
        )
      } else {
        // 只设置组织
        await auth.setActiveOrganization({
          organizationId: currentUser.inherentOrganizationId,
        })
      }
    } else if (!currentUser.activeTeamId && currentUser.inherentTeamId) {
      // 只设置团队
      await auth.setActiveTeam({ teamId: currentUser.inherentTeamId })
    }

    onComplete?.()
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)))
  }
}

function updateAuthStore(
  auth: AuthInstance,
  session: {
    activeOrganizationId?: string
    activeTeamId?: string
    inherentOrganizationId?: string
    inherentTeamId?: string
  }
) {
  // 使用 storeActions 更新用户状态
  auth.storeActions.updateUser({
    activeOrganizationId: session.activeOrganizationId,
    activeTeamId: session.activeTeamId,
    inherentOrganizationId: session.inherentOrganizationId,
    inherentTeamId: session.inherentTeamId,
  })
}
