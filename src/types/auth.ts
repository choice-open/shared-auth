/**
 * 认证状态和配置类型
 */

import type { SessionUser } from "./user"

/** 更新用户请求 */
export interface UpdateUserRequest {
  color?: string
  image?: string
  name?: string
}

/**
 * 用户账户信息
 *
 * 表示用户通过某种方式登录的账户
 * 一个用户可以有多个账户（如同时有邮箱密码和 GitHub 登录）
 */
export interface Account {
  /** 在提供商处的账户 ID */
  accountId: string,
  /** 创建时间 */
  createdAt: string,
  /** 账户 ID */
  id: string,
  /** 账户提供商 ID（credential、github 等） */
  providerId: string,
  /** 更新时间 */
  updatedAt: string,
  /** 关联的用户 ID */
  userId: string
}

/**
 * 用户会话信息
 *
 * 表示用户的一个登录会话
 */
export interface UserSession {
  /** 当前激活的组织 ID */
  activeOrganizationId: string | null,
  /** 当前激活的团队 ID */
  activeTeamId: string | null,
  /** 创建时间 */
  createdAt: string,
  /** 过期时间 */
  expiresAt: string,
  /** 会话 ID */
  id: string,
  /** 被冒充的用户 ID（如果有） */
  impersonatedBy: string | null,
  /** IP 地址 */
  ipAddress: string | null,
  /** 会话 token */
  token: string,
  /** 更新时间 */
  updatedAt: string,
  /** User Agent */
  userAgent: string | null,
  /** 关联的用户 ID */
  userId: string
}

/** 撤销会话请求参数 */
export interface RevokeSessionRequest {
  /** 要撤销的会话 token */
  token: string
}

/** OAuth 账户用户信息 */
export interface OAuthAccountUser {
  email: string
  emailVerified: boolean
  id: number | string
  image: string | null
  name: string
}

/** OAuth 账户信息响应 */
export interface OAuthAccountInfo {
  data: Record<string, unknown>
  user: OAuthAccountUser
}

/** Magic Link 登录请求 */
export interface MagicLinkRequest {
  callbackURL?: string
  email: string
  errorCallbackURL?: string
  name?: string
  newUserCallbackURL?: string
}

/** Magic Link 登录方法签名 */
export type SignInWithMagicLink = (options: {
  callbackURL: string
  email: string
  name?: string
  newUserCallbackURL?: string
}) => Promise<unknown>

/** Email/Password 登录方法签名 */
export type SignInWithEmail = (
  credentials: {
    email: string
    password: string
  },
  options?: {
    onError?: (context: { error: Error }) => void,
    onSuccess?: (context: { response: Response }) => void
  }
) => Promise<unknown>

/** Email/Password 注册方法签名 */
export type SignUpWithEmail = (
  credentials: {
    email: string
    name: string
    password: string
  },
  options?: {
    onError?: (context: { error: Error }) => void,
    onSuccess?: (context: { response: Response }) => void
  }
) => Promise<unknown>

/** 伴生团队设置选项 */
export interface CompanionTeamOptions {
  isNewUser?: boolean
  onComplete?: () => void
  onError?: (error: Error) => void
}

/** Better Auth signIn 方法接口 */
export interface AuthClientSignIn {
  email?: SignInWithEmail
  magicLink?: SignInWithMagicLink
  social: (options: {
    callbackURL: string
    errorCallbackURL?: string
    newUserCallbackURL?: string
    provider: string
  }) => Promise<unknown>
}

/** Better Auth signUp 方法接口 */
export interface AuthClientSignUp {
  email?: SignUpWithEmail
}

/** Delete User 方法签名 */
export type DeleteUser = (
  options: {
    callbackURL?: string
    password?: string
  },
  callbacks?: {
    onError?: (context: { error: Error }) => void
    onSuccess?: (context: { response: Response }) => void
  }
) => Promise<unknown>

/** Request Password Reset 方法签名 */
export type RequestPasswordReset = (
  options: {
    email: string
    redirectTo?: string
  },
  callbacks?: {
    onError?: (context: { error: Error }) => void
    onSuccess?: (context: { response: Response }) => void
  }
) => Promise<unknown>

/** Reset Password 方法签名 */
export type ResetPassword = (
  options: {
    newPassword: string
    token?: string
  },
  callbacks?: {
    onError?: (context: { error: Error }) => void
    onSuccess?: (context: { response: Response }) => void
  }
) => Promise<unknown>

/** Better Auth 客户端接口 */
export interface AuthClientMethods {
  deleteUser?: DeleteUser
  requestPasswordReset?: RequestPasswordReset
  resetPassword?: ResetPassword
  signIn: AuthClientSignIn
  signOut: () => Promise<unknown>
  signUp?: AuthClientSignUp
}

/** 认证状态（Legend State store） */
export interface AuthState {
  error: string | null
  isAuthenticated: boolean
  isLoaded: boolean
  loading: boolean
  token: string | null
  user: SessionUser | null
}

/** Better Auth 插件类型 */
export type BetterAuthPlugin = ReturnType<
  typeof import("better-auth/client/plugins").adminClient
>

/** 认证配置 */
export interface AuthConfig {
  /** OneAuth API 基础 URL */
  baseURL: string
  /** 获取 session 的端点路径 @default '/v1/auth/get-session' */
  getSessionEndpoint?: string
  /** Better Auth 插件列表 */
  plugins?: BetterAuthPlugin[]
  /** 跳过错误时的 token 清除 @default false */
  skipTokenCleanupOnError?: boolean
  /** Token 存储 key @default 'auth-token' */
  tokenStorageKey?: string
}

/** 默认配置类型 */
export type DefaultAuthConfig = Required<
  Pick<AuthConfig, "baseURL" | "getSessionEndpoint" | "tokenStorageKey">
> & {
  plugins: BetterAuthPlugin[]
  skipTokenCleanupOnError: false
}
