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