/**
 * 认证系统核心
 *
 * 架构设计：
 * - Store Layer: 响应式状态管理（authStore + storeActions）
 * - Service Layer: 业务逻辑（authService）
 * - API Layer: HTTP 请求（apiClient + authApi/organizationApi/teamApi）
 *
 * 使用方式：
 * ```typescript
 * // 初始化
 * const auth = createAuth({ baseURL: 'https://api.example.com' })
 *
 * // 响应式读取状态
 * const user = use$(auth.authStore.user)
 *
 * // 业务操作
 * await auth.authService.signInWithEmail(email, password)
 *
 * // 状态更新
 * auth.storeActions.setUser(user)
 * ```
 */

import { createAuthClientFromConfig } from "./lib/auth-client"
import { createAuthStore } from "./store/state"
import { createStoreActions } from "./store/actions"
import { createAuthComputed } from "./store/computed"
import { waitForAuth as waitForAuthUtil, createUserManager } from "./store/utils"
import { createApiClient, createAuthApi, createOrganizationApi, createTeamApi } from "./api"
import { createAuthService } from "./services/auth-service"
import { createReferralService } from "./services/referral-service"
import { createApiKeyService } from "./services/api-key-service"
import { createCreditService } from "./services/credit-service"
import { createStripeService } from "./services/stripe-service"
import type {
  AuthConfig,
  DeleteUser,
  Organization,
  SetActiveOrganizationRequest,
  SetActiveTeamRequest,
  SignInWithEmail,
  SignInWithMagicLink,
  SignUpWithEmail,
} from "./types"

export function createAuth(config: AuthConfig) {
  // ============================================================
  // 1. Better Auth 客户端
  // ============================================================
  const authClient = createAuthClientFromConfig(config)

  const signIn = authClient.signIn as typeof authClient.signIn & {
    email?: SignInWithEmail
    magicLink?: SignInWithMagicLink
  }

  const signUp = authClient.signUp as typeof authClient.signUp & {
    email?: SignUpWithEmail
  }

  const deleteUser = (authClient as { deleteUser?: DeleteUser }).deleteUser

  // ============================================================
  // 2. Store Layer - 响应式状态
  // ============================================================
  const { authStore, tokenStorage } = createAuthStore({
    tokenStorageKey: config.tokenStorageKey || "auth-token",
  })

  const storeActions = createStoreActions(authStore, tokenStorage)
  const authComputed = createAuthComputed(authStore)

  // ============================================================
  // 3. API Layer
  // ============================================================
  const apiClient = createApiClient({
    authStore,
    tokenStorage,
    unauthorizedHandler: storeActions,
    baseURL: config.baseURL,
  })

  const authApi = createAuthApi(apiClient)
  const organizationApi = createOrganizationApi(apiClient, config.baseURL)
  const teamApi = createTeamApi(apiClient)

  // ============================================================
  // 4. Service Layer - 业务逻辑
  // ============================================================
  const authService = createAuthService(
    {
      authApi,
      storeActions,
      tokenStorage,
    },
    {
      deleteUser,
      signIn: {
        email: signIn.email,
        magicLink: signIn.magicLink,
        social: signIn.social,
      },
      signOut: authClient.signOut,
      signUp: signUp ? { email: signUp.email } : undefined,
    }
  )

  const referralService = createReferralService(apiClient)
  const apiKeyService = createApiKeyService(apiClient)
  const creditService = createCreditService(apiClient)
  const stripeService = createStripeService(apiClient)

  // ============================================================
  // 5. Active 状态管理
  // ============================================================
  const basePath = "/v1/auth/organization"

  async function setActiveOrganization(
    request: SetActiveOrganizationRequest
  ): Promise<Organization> {
    const response = await apiClient.post<Organization>(`${basePath}/set-active`, request)
    if (!response.ok) {
      throw new Error(`Failed to set active organization: ${response.status}`)
    }

    storeActions.setActiveOrganizationId(response.data.id)
    return response.data
  }

  async function setActiveTeam(request: SetActiveTeamRequest): Promise<void> {
    const response = await apiClient.post(`${basePath}/set-active-team`, request)
    if (!response.ok) {
      throw new Error(`Failed to set active team: ${response.status}`)
    }

    storeActions.setActiveTeamId(request.teamId)
  }

  async function setActiveOrganizationAndTeam(
    organizationId: string,
    teamId: string
  ): Promise<Organization> {
    const organization = await setActiveOrganization({ organizationId })
    await setActiveTeam({ teamId })
    return organization
  }

  // ============================================================
  // 6. 返回 Auth 实例
  // ============================================================
  return {
    // API Layer
    apiClient,
    authApi,
    organizationApi,
    teamApi,

    // Store Layer
    authStore,
    authComputed,
    tokenStorage,
    storeActions,

    // Service Layer
    authService,
    referralService,
    apiKeyService,
    creditService,
    stripeService,

    // Active 状态管理
    setActiveOrganization,
    setActiveTeam,
    setActiveOrganizationAndTeam,

    // Better Auth Client（高级用法）
    authClient,

    // 快捷方法
    getCurrentUser: storeActions.getUser,
    getCurrentUserId: storeActions.getUserId,
    isAuthenticated: storeActions.isAuthenticated,
    isLoading: storeActions.isLoading,
    isLoaded: storeActions.isLoaded,
    getAuthToken: () => tokenStorage.get(),
    getAuthHeaders: (): Record<string, string> => {
      const token = tokenStorage.get()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    waitForAuth: () => waitForAuthUtil(authStore),
    userManager: createUserManager(authStore),
  }
}

export type AuthInstance = ReturnType<typeof createAuth>
