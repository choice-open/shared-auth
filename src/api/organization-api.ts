/**
 * 组织相关 API
 *
 * 封装所有组织管理的 API 调用
 * 基于 Core AI Auth API 文档
 */

import type {
  Organization,
  FullOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  DeleteOrganizationRequest,
  CheckSlugRequest,
  Member,
  RemoveMemberRequest,
  UpdateMemberRoleRequest,
  Invitation,
  InvitationDetail,
  InviteMemberRequest,
  CancelInvitationRequest,
  AcceptInvitationRequest,
  RejectInvitationRequest,
  InvitationResponse,
} from "../types/organization"
import { createErrorWithSchema } from "../utils/error-schema"
import type { ApiClient } from "./client"

/**
 * 创建组织 API
 *
 * @param apiClient - API 客户端实例
 * @param _baseURL - Auth API 基础 URL（保留参数，与其他 API 保持一致）
 */
export function createOrganizationApi(apiClient: ApiClient, _baseURL: string) {
  const basePath = "/v1/auth/organization"

  return {
    // ============================================================
    // 组织 CRUD
    // ============================================================

    /**
     * 创建组织
     */
    async create(request: CreateOrganizationRequest): Promise<Organization> {
      const response = await apiClient.post<Organization>(`${basePath}/create`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to create organization", response.status, response.data)
      }
      return response.data
    },

    /**
     * 更新组织
     */
    async update(request: UpdateOrganizationRequest): Promise<Organization> {
      const response = await apiClient.post<Organization>(`${basePath}/update`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to update organization", response.status, response.data)
      }
      return response.data
    },

    /**
     * 删除组织
     */
    async delete(request: DeleteOrganizationRequest): Promise<string> {
      const response = await apiClient.post<string>(`${basePath}/delete`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to delete organization", response.status, response.data)
      }
      return response.data
    },

    /**
     * 获取组织列表
     */
    async list(): Promise<Organization[]> {
      const response = await apiClient.get<Organization[]>(`${basePath}/list`)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to list organizations", response.status, response.data)
      }
      return response.data || []
    },

    /**
     * 获取当前活跃组织详情（包含成员列表和用户信息）
     */
    async getFullOrganization(): Promise<FullOrganization | null> {
      const response = await apiClient.get<FullOrganization>(`${basePath}/get-full-organization`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw createErrorWithSchema("Failed to get organization", response.status, response.data)
      }
      return response.data
    },

    /**
     * 检查 slug 可用性
     */
    async checkSlug(request: CheckSlugRequest): Promise<boolean> {
      const response = await apiClient.post<{ available: boolean }>(`${basePath}/check-slug`, request)
      if (!response.ok) {
        // 400 表示 slug 不可用
        if (response.status === 400) {
          return false
        }
        throw createErrorWithSchema("Failed to check slug", response.status, response.data)
      }
      return true
    },

    // ============================================================
    // 成员管理
    // ============================================================

    /**
     * 获取当前活跃成员信息
     */
    async getActiveMember(): Promise<Member | null> {
      const response = await apiClient.get<Member>(`${basePath}/get-active-member`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw createErrorWithSchema("Failed to get active member", response.status, response.data)
      }
      return response.data
    },

    /**
     * 获取当前用户在活跃组织中的角色
     */
    async getActiveMemberRole(): Promise<{ role: string } | null> {
      const response = await apiClient.get<{ role: string }>(`${basePath}/get-active-member-role`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw createErrorWithSchema("Failed to get active member role", response.status, response.data)
      }
      return response.data
    },

    /**
     * 移除成员
     */
    async removeMember(request: RemoveMemberRequest): Promise<Member> {
      const response = await apiClient.post<{ member: Member }>(`${basePath}/remove-member`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to remove member", response.status, response.data)
      }
      return response.data.member
    },

    /**
     * 更新成员角色
     */
    async updateMemberRole(request: UpdateMemberRoleRequest): Promise<Member> {
      const response = await apiClient.post<{ member: Member }>(`${basePath}/update-member-role`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to update member role", response.status, response.data)
      }
      return response.data.member
    },

    // ============================================================
    // 邀请管理
    // ============================================================

    /**
     * 邀请成员
     * @param request 邀请请求参数
     */
    async inviteMember(request: InviteMemberRequest): Promise<Invitation> {
      const response = await apiClient.post<Invitation>(
        `${basePath}/invite-member`,
        request
      )
      if (!response.ok) {
        throw createErrorWithSchema("Failed to invite member", response.status, response.data)
      }
      return response.data
    },

    /**
     * 获取邀请列表
     */
    async listInvitations(): Promise<Invitation[]> {
      const response = await apiClient.get<Invitation[]>(`${basePath}/list-invitations`)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to list invitations", response.status, response.data)
      }
      return response.data || []
    },

    /**
     * 获取邀请详情
     */
    async getInvitation(invitationId: string): Promise<InvitationDetail | null> {
      const response = await apiClient.get<InvitationDetail>(
        `${basePath}/get-invitation?id=${encodeURIComponent(invitationId)}`
      )
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw createErrorWithSchema("Failed to get invitation", response.status, response.data)
      }
      return response.data
    },

    /**
     * 取消邀请
     */
    async cancelInvitation(request: CancelInvitationRequest): Promise<void> {
      const response = await apiClient.post(`${basePath}/cancel-invitation`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to cancel invitation", response.status, response.data)
      }
    },

    /**
     * 接受邀请
     */
    async acceptInvitation(request: AcceptInvitationRequest): Promise<InvitationResponse> {
      const response = await apiClient.post<InvitationResponse>(`${basePath}/accept-invitation`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to accept invitation", response.status, response.data)
      }
      return response.data
    },

    /**
     * 拒绝邀请
     */
    async rejectInvitation(request: RejectInvitationRequest): Promise<InvitationResponse> {
      const response = await apiClient.post<InvitationResponse>(`${basePath}/reject-invitation`, request)
      if (!response.ok) {
        throw createErrorWithSchema("Failed to reject invitation", response.status, response.data)
      }
      return response.data
    },

    /**
     * 离开组织
     *
     * 当用户在非伴生组织中只剩最后一个团队时，离开该团队等于离开整个组织
     */
    async leave(organizationId: string): Promise<void> {
      const response = await apiClient.post(`${basePath}/leave`, { organizationId })
      if (!response.ok) {
        throw createErrorWithSchema("Failed to leave organization", response.status, response.data)
      }
    },
  }
}

export type OrganizationApi = ReturnType<typeof createOrganizationApi>

