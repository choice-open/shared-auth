/**
 * 类型定义导出
 */

export type { SessionUser, SessionUserMetadata, Session } from "./user"
export type {
  Account,
  AuthClientMethods,
  AuthClientSignIn,
  AuthClientSignUp,
  AuthConfig,
  AuthState,
  BetterAuthPlugin,
  CompanionTeamOptions,
  DefaultAuthConfig,
  DeleteUser,
  MagicLinkRequest,
  OAuthAccountInfo,
  OAuthAccountUser,
  RequestPasswordReset,
  ResetPassword,
  RevokeSessionRequest,
  SignInWithEmail,
  SignInWithMagicLink,
  SignUpWithEmail,
  UpdateUserRequest,
  UserSession,
} from "./auth"

// 组织相关类型
export type {
  // 组织
  Organization,
  OrganizationMetadata,
  FullOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  DeleteOrganizationRequest,
  SetActiveOrganizationRequest,
  CheckSlugRequest,
  // 成员
  MemberRole,
  Member,
  MemberUser,
  UserMetadata,
  MemberWithUser,
  RemoveMemberRequest,
  UpdateMemberRoleRequest,
  // 邀请
  InvitationStatus,
  Invitation,
  InvitationDetail,
  InviteMemberRequest,
  CancelInvitationRequest,
  AcceptInvitationRequest,
  RejectInvitationRequest,
  InvitationResponse,
} from "./organization"

// 团队相关类型
export type {
  // 团队
  Team,
  TeamMetadata,
  CreateTeamRequest,
  UpdateTeamRequest,
  DeleteTeamRequest,
  SetActiveTeamRequest,
  // 团队成员
  TeamMember,
  AddTeamMemberRequest,
  RemoveTeamMemberRequest,
  ListTeamMembersRequest,
} from "./team"

// 回调相关类型
export type {
  CallbackType,
  CallbackResult,
  CallbackConfig,
} from "./callback"

// API Key 相关类型
export type {
  ApiKey,
  ApiKeyWithSecret,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  DeleteApiKeyRequest,
  GetApiKeyRequest,
  DeleteApiKeyResponse,
  ApiKeyErrorType,
  ApiKeyResult,
  CreateApiKeyResult,
  GetApiKeyResult,
  UpdateApiKeyResult,
  ListApiKeysResult,
} from "./api-key"

// Credit 相关类型
export type {
  // 基础类型
  CreditOwnerType,
  CreditSource,
  CreditMeta,
  // Credit Available
  CreditAvailable,
  GetCreditAvailableRequest,
  // Credit Batch
  CreditBatch,
  ListCreditBatchesRequest,
  CreateCreditBatchRequest,
  UpdateCreditBatchRequest,
  // Credit Consumption
  CreditConsumptionMetadata,
  CreditConsumption,
  ListCreditConsumptionsRequest,
  CreateCreditConsumptionRequest,
  // 响应类型
  CreditApiResponse,
  // 错误类型
  CreditErrorType,
  // 结果类型
  GetCreditAvailableResult,
  ListCreditBatchesResult,
  GetCreditBatchResult,
  CreateCreditBatchResult,
  UpdateCreditBatchResult,
  ListCreditConsumptionsResult,
  CreateCreditConsumptionResult,
} from "./credit"

// Stripe 相关类型
export type {
  // 基础类型
  StripeCustomerType,
  StripePlanInterval,
  // Product
  StripeProduct,
  ListStripeProductsRequest,
  // Price
  StripePrice,
  ListStripePricesRequest,
  // Plan
  StripePlan,
  ListStripePlansRequest,
  // Subscription
  UpgradeSubscriptionRequest,
  CancelSubscriptionRequest,
  RestoreSubscriptionRequest,
  CreateBillingPortalRequest,
  SubscriptionActionResponse,
  // 错误类型
  StripeErrorType,
  // 结果类型
  StripeResult,
  StripeRedirectResult,
  ListStripeProductsResult,
  GetStripeProductResult,
  ListStripePricesResult,
  GetStripePriceResult,
  ListStripePlansResult,
  GetStripePlanResult,
} from "./stripe"

// Referral 相关类型
export type {
  // 基础类型
  ReferralRecord,
  // 请求类型
  SubmitReferralRequest,
  RemoveReferralRequest,
  // 响应类型
  ReferralResponse,
  ListReferralsResponse,
  // 错误类型
  ReferralErrorType,
  RemoveReferralErrorType,
  // 结果类型
  ReferralResult,
  RemoveReferralResult,
  ListReferralsResult,
  // 工具类型
  NeedsReferralOptions,
} from "./referral"