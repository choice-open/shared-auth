/**
 * 用户和会话类型定义
 */

/** 用户 metadata */
export interface SessionUserMetadata {
  [key: string]: unknown
  color?: string
  description?: string
}

/** 会话用户信息 */
export interface SessionUser {
  activeOrganizationId?: string
  activeTeamId?: string
  banExpires?: string
  banReason?: string
  banned?: boolean
  createdAt: string
  email: string
  emailVerified: boolean
  id: string
  image?: string
  /** 伴生组织 ID（固定不变，onboard 后存在） */
  inherentOrganizationId?: string
  /** 伴生团队 ID（固定不变，onboard 后存在） */
  inherentTeamId?: string
  lastLoginAt?: string
  /** 最后登录方式（credential、github 等） */
  lastLoginMethod?: string
  metadata: SessionUserMetadata
  name: string
  role?: string
  updatedAt: string
}

/** Better Auth Session */
export interface Session {
  activeOrganizationId?: string
  activeTeamId?: string
  createdAt: string
  expiresAt: string
  id: string
  ipAddress?: string
  token: string
  updatedAt: string
  user: SessionUser
  userAgent?: string
  userId: string
}
