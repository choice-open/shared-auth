/**
 * 组织相关类型定义
 */

// ============================================================
// 组织
// ============================================================

/** 组织 metadata */
export interface OrganizationMetadata {
  [key: string]: unknown
  color?: string
  description?: string
}

export interface Organization {
  createdAt: string
  id?: string
  /** 继承自用户 ID（伴生组织时存在） */
  inherentFrom?: string
  logo?: string
  metadata: OrganizationMetadata
  name: string
  slug?: string
}

export interface CreateOrganizationRequest {
  keepCurrentActiveOrganization?: boolean
  logo?: string
  metadata?: OrganizationMetadata
  name: string
  slug: string
  userId?: string
}

export interface UpdateOrganizationRequest {
  data: Partial<Pick<Organization, "name" | "slug" | "logo" | "metadata">>
  organizationId?: string
}

export interface DeleteOrganizationRequest {
  organizationId: string
}

export interface SetActiveOrganizationRequest {
  organizationId?: string | null
  organizationSlug?: string
}

export interface CheckSlugRequest {
  slug: string
}

// ============================================================
// 成员
// ============================================================

export type MemberRole = "owner" | "admin" | "member" | "guest"

export interface Member {
  createdAt: string
  id?: string
  organizationId: string
  role: MemberRole
  userId: string
}

/** 用户 metadata（嵌入在成员中） */
export interface UserMetadata {
  [key: string]: unknown
  color?: string
  description?: string
}

/** 成员关联的用户信息 */
export interface MemberUser {
  createdAt: string
  email: string
  emailVerified: boolean
  id: string
  image?: string
  metadata?: UserMetadata
  name: string
  updatedAt: string
}

/** 包含用户信息的成员 */
export interface MemberWithUser extends Member {
  user: MemberUser
}

/** 完整组织信息（含成员和邀请列表） */
export interface FullOrganization extends Organization {
  invitations?: Invitation[]
  members: MemberWithUser[]
  teams?: Team[]
}

export interface RemoveMemberRequest {
  memberIdOrEmail: string
  organizationId?: string
}

export interface UpdateMemberRoleRequest {
  memberId: string
  organizationId?: string
  role: MemberRole
}

// ============================================================
// 邀请
// ============================================================

export type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled"

export interface Invitation {
  email: string
  expiresAt: string
  id?: string
  inviterId: string
  /** 邀请链接基础 URL */
  linkBaseUrl: string
  organizationId: string
  role?: MemberRole
  status: InvitationStatus
  teamId?: string
}

export interface InvitationDetail extends Invitation {
  inviterEmail: string
  organizationName: string
  organizationSlug: string
}

export interface InviteMemberRequest {
  email: string
  /** 邀请链接基础 URL（必填） */
  linkBaseUrl: string
  organizationId?: string
  resend?: boolean
  role: MemberRole
  teamId?: string
}

export interface CancelInvitationRequest {
  invitationId: string
}

export interface AcceptInvitationRequest {
  invitationId: string
}

export interface RejectInvitationRequest {
  invitationId: string
}

export interface InvitationResponse {
  invitation: Invitation
  member: Member | null
}

// ============================================================
// 团队（从 team.ts 导入类型用于 FullOrganization）
// ============================================================

import type { Team } from "./team"
