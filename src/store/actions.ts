/**
 * 认证状态 Actions
 *
 * 只负责状态管理，不包含业务逻辑
 * 业务逻辑在 services/auth-service.ts 中
 */

import type { Observable } from "@legendapp/state"
import type { AuthState, SessionUser } from "../types"
import type { TokenStorage } from "../api"

/**
 * 创建状态管理 Actions
 *
 * 这些是纯粹的状态操作，不涉及 API 调用或业务逻辑
 */
export function createStoreActions(
  authStore: Observable<AuthState>,
  tokenStorage: TokenStorage
) {
  return {
    // ============================================================
    // 状态读取
    // ============================================================

    /**
     * 获取当前用户
     */
    getUser(): SessionUser | null {
      return authStore.user.get()
    },

    /**
     * 获取当前用户 ID
     */
    getUserId(): string | null {
      return authStore.user.get()?.id ?? null
    },

    /**
     * 检查是否已认证
     */
    isAuthenticated(): boolean {
      return authStore.isAuthenticated.get()
    },

    /**
     * 检查是否正在加载
     */
    isLoading(): boolean {
      return authStore.loading.get()
    },

    /**
     * 检查是否已加载完成
     */
    isLoaded(): boolean {
      return authStore.isLoaded.get()
    },

    // ============================================================
    // 状态更新
    // ============================================================

    /**
     * 设置用户
     */
    setUser(user: SessionUser | null) {
      authStore.user.set(user)
      authStore.isAuthenticated.set(user !== null)
    },

    /**
     * 更新用户（合并）
     */
    updateUser(updates: Partial<SessionUser>) {
      const currentUser = authStore.user.get()
      if (currentUser) {
        authStore.user.set({ ...currentUser, ...updates })
      }
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      authStore.loading.set(loading)
    },

    /**
     * 设置已加载状态
     */
    setLoaded(loaded: boolean) {
      authStore.isLoaded.set(loaded)
      if (loaded) {
        authStore.loading.set(false)
      }
    },

    /**
     * 设置错误
     */
    setError(error: string | null) {
      authStore.error.set(error)
    },

    /**
     * 设置认证成功状态
     */
    setAuthenticated(user: SessionUser) {
      authStore.user.set(user)
      authStore.isAuthenticated.set(true)
      authStore.isLoaded.set(true)
      authStore.loading.set(false)
      authStore.error.set(null)
    },

    /**
     * 清除认证状态
     */
    clearAuth() {
      authStore.user.set(null)
      authStore.isAuthenticated.set(false)
      authStore.isLoaded.set(true)
      authStore.loading.set(false)
      tokenStorage.clear()
    },

    /**
     * 处理未授权
     */
    handleUnauthorized() {
      this.clearAuth()
    },

    // ============================================================
    // Active 状态更新
    // ============================================================

    /**
     * 更新活跃组织 ID
     */
    setActiveOrganizationId(organizationId: string | null | undefined) {
      const currentUser = authStore.user.get()
      if (currentUser) {
        authStore.user.set({
          ...currentUser,
          activeOrganizationId: organizationId ?? undefined,
        })
      }
    },

    /**
     * 更新活跃团队 ID
     */
    setActiveTeamId(teamId: string | null | undefined) {
      const currentUser = authStore.user.get()
      if (currentUser) {
        authStore.user.set({
          ...currentUser,
          activeTeamId: teamId ?? undefined,
        })
      }
    },

    // ============================================================
    // 初始化
    // ============================================================

    /**
     * 初始化认证状态
     */
    initialize(user: SessionUser | null, isLoaded: boolean) {
      if (user) {
        this.setAuthenticated(user)
      } else {
        authStore.user.set(null)
        authStore.isAuthenticated.set(false)
      }
      authStore.isLoaded.set(isLoaded)
      authStore.loading.set(!isLoaded)
    },
  }
}

export type StoreActions = ReturnType<typeof createStoreActions>

// ============================================================
// 兼容性导出（保持向后兼容）
// ============================================================

/**
 * @deprecated 使用 createStoreActions 代替
 * 保留此函数以保持向后兼容性
 */
export { createStoreActions as createAuthActions }
export type { StoreActions as AuthActions }
