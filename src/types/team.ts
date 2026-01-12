/**
 * 团队相关类型定义
 */

// ============================================================
// 团队
// ============================================================

export interface TeamMetadata {
  [key: string]: unknown
  color?: string
  description?: string
  image?: string
}

export interface Team {
  createdAt: string
  id: string
  /** 继承自用户 ID（伴生团队时存在） */
  inherentFrom?: string
  metadata: TeamMetadata
  name: string
  organizationId: string
  updatedAt?: string
}

export interface CreateTeamRequest {
  metadata?: TeamMetadata
  name: string
  organizationId?: string
}

export interface UpdateTeamRequest {
  data: {
    metadata?: TeamMetadata
    name?: string
  }
  teamId: string
}

export interface DeleteTeamRequest {
  organizationId?: string
  teamId: string
}

export interface SetActiveTeamRequest {
  teamId: string | null
}

// ============================================================
// 团队成员
// ============================================================

export interface TeamMember {
  createdAt: string
  id: string
  teamId: string
  userId: string
}

export interface AddTeamMemberRequest {
  teamId: string
  userId: string
}

export interface RemoveTeamMemberRequest {
  teamId: string
  userId: string
}

export interface ListTeamMembersRequest {
  teamId: string
}
