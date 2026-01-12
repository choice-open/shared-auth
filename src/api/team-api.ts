/**
 * 团队相关 API
 *
 * 封装所有团队管理的 API 调用
 * 基于 Core AI Auth API 文档
 */

import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  DeleteTeamRequest,
  RemoveTeamMemberRequest,
  Team,
  TeamMember,
  UpdateTeamRequest,
} from "../types/team"
import type { ApiClient } from "./client"

/**
 * 创建团队 API
 *
 * @param apiClient - API 客户端实例
 */
export function createTeamApi(apiClient: ApiClient) {
  const basePath = "/v1/auth/organization"

  return {
    // ============================================================
    // 团队 CRUD
    // ============================================================

    /**
     * 创建团队
     */
    async create(request: CreateTeamRequest): Promise<Team> {
      const response = await apiClient.post<Team>(`${basePath}/create-team`, {
        ...request,
        metadata: request.metadata ?? {},
      })
      if (!response.ok) {
        throw new Error(`Failed to create team: ${response.status}`)
      }
      return response.data
    },

    /**
     * 获取团队列表
     */
    async list(): Promise<Team[]> {
      const response = await apiClient.get<Team[]>(`${basePath}/list-teams`)
      if (!response.ok) {
        throw new Error(`Failed to list teams: ${response.status}`)
      }
      return response.data || []
    },

    /**
     * 更新团队
     */
    async update(request: UpdateTeamRequest): Promise<Team> {
      const response = await apiClient.post<Team>(`${basePath}/update-team`, request)
      if (!response.ok) {
        throw new Error(`Failed to update team: ${response.status}`)
      }
      return response.data
    },

    /**
     * 删除团队
     */
    async delete(request: DeleteTeamRequest): Promise<void> {
      const response = await apiClient.post(`${basePath}/remove-team`, request)
      if (!response.ok) {
        throw new Error(`Failed to delete team: ${response.status}`)
      }
    },

    /**
     * 获取用户所属的团队列表
     */
    async listUserTeams(): Promise<Team[]> {
      const response = await apiClient.get<Team[]>(`${basePath}/list-user-teams`)
      if (!response.ok) {
        throw new Error(`Failed to list user teams: ${response.status}`)
      }
      return response.data || []
    },

    // ============================================================
    // 团队成员管理
    // ============================================================

    /**
     * 获取团队成员列表
     */
    async listMembers(teamId: string): Promise<TeamMember[]> {
      const response = await apiClient.get<TeamMember[]>(
        `${basePath}/list-team-members?teamId=${encodeURIComponent(teamId)}`
      )
      if (!response.ok) {
        throw new Error(`Failed to list team members: ${response.status}`)
      }
      return response.data || []
    },

    /**
     * 添加团队成员
     */
    async addMember(request: AddTeamMemberRequest): Promise<TeamMember> {
      const response = await apiClient.post<TeamMember>(`${basePath}/add-team-member`, request)
      if (!response.ok) {
        throw new Error(`Failed to add team member: ${response.status}`)
      }
      return response.data
    },

    /**
     * 移除团队成员（需要管理员权限）
     */
    async removeMember(request: RemoveTeamMemberRequest): Promise<void> {
      const response = await apiClient.post(`${basePath}/remove-team-member`, request)
      if (!response.ok) {
        throw new Error(`Failed to remove team member: ${response.status}`)
      }
    },

    /**
     * 离开团队（普通成员可自行调用）
     */
    async leaveTeam(teamId: string): Promise<void> {
      const response = await apiClient.post("/v1/auth/leave-team", { teamId })
      if (!response.ok) {
        throw new Error(`Failed to leave team: ${response.status}`)
      }
    },
  }
}

export type TeamApi = ReturnType<typeof createTeamApi>

