/**
 * 认证 Computed（派生状态）
 *
 * 基于 authStore 派生的响应式状态
 * 这些都是只读的响应式值，会自动跟踪依赖并更新
 */

import { computed } from "@legendapp/state"
import type { Observable } from "@legendapp/state"
import type { AuthState } from "../types"

/**
 * 创建认证 computed
 */
export function createAuthComputed(authStore: Observable<AuthState>) {
  return {
    // ============================================================
    // 状态标志
    // ============================================================

    /**
     * 是否正在初始化（未加载完成）
     */
    isInitializing: computed(() => !authStore.isLoaded.get()),

    /**
     * 是否准备就绪（已加载且已认证）
     */
    isReady: computed(() => authStore.isLoaded.get() && authStore.isAuthenticated.get()),

    /**
     * 是否未认证（已加载但未认证）
     */
    isUnauthenticated: computed(() => authStore.isLoaded.get() && !authStore.isAuthenticated.get()),

    /**
     * 是否有错误
     */
    hasError: computed(() => authStore.error.get() !== null),

    // ============================================================
    // 用户信息
    // ============================================================

    /**
     * 当前用户 ID
     */
    userId: computed(() => authStore.user.get()?.id ?? null),

    /**
     * 当前用户邮箱
     */
    userEmail: computed(() => authStore.user.get()?.email ?? null),

    /**
     * 当前用户名称
     */
    userName: computed(() => authStore.user.get()?.name ?? null),

    /**
     * 当前用户头像
     */
    userImage: computed(() => authStore.user.get()?.image ?? null),

    /**
     * 邮箱是否已验证
     */
    emailVerified: computed(() => authStore.user.get()?.emailVerified ?? false),

    // ============================================================
    // 组织和团队
    // ============================================================

    /**
     * 当前活跃组织 ID
     */
    activeOrganizationId: computed(() => authStore.user.get()?.activeOrganizationId ?? null),

    /**
     * 当前活跃团队 ID
     */
    activeTeamId: computed(() => authStore.user.get()?.activeTeamId ?? null),

    /**
     * 伴生组织 ID（用户自己的组织）
     */
    inherentOrganizationId: computed(() => authStore.user.get()?.inherentOrganizationId ?? null),

    /**
     * 伴生团队 ID（用户自己的团队）
     */
    inherentTeamId: computed(() => authStore.user.get()?.inherentTeamId ?? null),

    /**
     * 是否有活跃组织
     */
    hasActiveOrganization: computed(() => !!authStore.user.get()?.activeOrganizationId),

    /**
     * 是否有活跃团队
     */
    hasActiveTeam: computed(() => !!authStore.user.get()?.activeTeamId),

    /**
     * 是否在伴生组织中（当前活跃组织是否是伴生组织）
     */
    isInInherentOrganization: computed(() => {
      const user = authStore.user.get()
      if (!user) return false
      return user.activeOrganizationId === user.inherentOrganizationId
    }),

    /**
     * 是否在伴生团队中（当前活跃团队是否是伴生团队）
     */
    isInInherentTeam: computed(() => {
      const user = authStore.user.get()
      if (!user) return false
      return user.activeTeamId === user.inherentTeamId
    }),
  }
}

export type AuthComputed = ReturnType<typeof createAuthComputed>
