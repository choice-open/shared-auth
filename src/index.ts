/**
 * @choiceform/shared-auth
 * 共享认证包
 *
 * 架构设计：
 * - Store Layer: 响应式状态管理（authStore + storeActions）
 * - Service Layer: 业务逻辑（authService + callbackService）
 * - API Layer: HTTP 请求（apiClient + authApi/organizationApi/teamApi）
 * - Hooks Layer: React 专用 hooks
 */

// ============================================================
// 核心 - 主入口
// ============================================================

export { createAuth, type AuthInstance } from "./core"
export { initAuth } from "./init"
export { defaultAuthConfig } from "./config"

// ============================================================
// 类型
// ============================================================

export type {
  // 用户和会话
  SessionUser,
  SessionUserMetadata,
  Session,
  AuthState,
  AuthConfig,
  BetterAuthPlugin,
  DefaultAuthConfig,
  UpdateUserRequest,
  MagicLinkRequest,
  SignInWithMagicLink,
  CompanionTeamOptions,
  AuthClientMethods,
  AuthClientSignIn,
  // 账户
  Account,
  // 用户会话
  UserSession,
  RevokeSessionRequest,
  // 组织
  Organization,
  OrganizationMetadata,
  FullOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  DeleteOrganizationRequest,
  SetActiveOrganizationRequest,
  CheckSlugRequest,
  MemberRole,
  Member,
  MemberUser,
  UserMetadata,
  MemberWithUser,
  RemoveMemberRequest,
  UpdateMemberRoleRequest,
  InvitationStatus,
  Invitation,
  InvitationDetail,
  InviteMemberRequest,
  CancelInvitationRequest,
  AcceptInvitationRequest,
  RejectInvitationRequest,
  InvitationResponse,
  // 团队
  Team,
  TeamMetadata,
  CreateTeamRequest,
  UpdateTeamRequest,
  DeleteTeamRequest,
  SetActiveTeamRequest,
  TeamMember,
  AddTeamMemberRequest,
  RemoveTeamMemberRequest,
  ListTeamMembersRequest,
  // 回调
  CallbackType,
  CallbackResult,
  CallbackConfig,
} from "./types"

// ============================================================
// Store Layer - 状态管理
// ============================================================

export { createAuthStore, createTokenStorage } from "./store/state"
export { createStoreActions, type StoreActions } from "./store/actions"
export { createAuthComputed } from "./store/computed"
export {
  getCurrentUser,
  getCurrentUserId,
  isAuthenticated,
  isLoading,
  isLoaded,
  waitForAuth,
  getAuthToken,
  getAuthTokenSync,
  getAuthHeaders,
  getAuthHeadersSync,
  handle401Response,
  createUserManager,
} from "./store/utils"

// ============================================================
// Service Layer - 业务逻辑
// ============================================================

export {
  // 认证服务
  createAuthService,
  type AuthService,
  type AuthServiceConfig,
  type BetterAuthClientMethods,
  // 伴生团队
  setupCompanionTeam,
  // 回调服务
  createCallbackService,
  type CallbackService,
  // 邀请码服务
  createReferralService,
  needsReferral,
  getReferralFields,
  type ReferralService,
  type ReferralResponse,
  type ReferralRecord,
  type ListReferralsResponse,
  type ReferralErrorType,
  type ReferralResult,
  type NeedsReferralOptions,
} from "./services"

// ============================================================
// API Layer - HTTP 请求
// ============================================================

export {
  createApiClient,
  createAuthApi,
  createOrganizationApi,
  createTeamApi,
  parseErrorResponse,
} from "./api"

export type {
  ApiClient,
  ApiClientConfig,
  ApiResponse,
  TokenStorage,
  UnauthorizedHandler,
  AuthApi,
  OrganizationApi,
  TeamApi,
} from "./api"

// ============================================================
// Hooks Layer - React 专用
// ============================================================

export {
  // 初始化
  useAuthInit,
  initializeAuth,
  // 认证状态同步
  useAuthSync,
  type UseAuthSyncConfig,
  type UseAuthSyncResult,
  // 路由保护
  useProtectedRoute,
  type UseProtectedRouteConfig,
  type UseProtectedRouteResult,
  type ProtectionStatus,
  // 邮箱验证
  useEmailVerification,
  type UseEmailVerificationConfig,
  type UseEmailVerificationResult,
} from "./hooks"

// ============================================================
// 工具函数
// ============================================================

export {
  // 环境
  getEnvVar,
  getAuthBaseUrl,
  // 用户映射
  extractSessionUser,
  // 验证
  isValidEmail,
  // 错误处理
  parseAuthError,
  isTokenExpiredError,
  AUTH_ERROR_CODES,
  type AuthErrorCode,
  type ParsedAuthError,
  // URL 工具
  getNameFromEmail,
  buildAuthUrl,
  buildAuthPath,
  clearAuthParams,
} from "./utils"

// ============================================================
// Better Auth Client（高级用法）
// ============================================================

export { createAuthClientFromConfig } from "./lib/auth-client"
