/**
 * 用户数据提取工具
 *
 * 从 better-auth API 响应中提取用户数据
 * 由于 auth server 也是基于 better-auth，数据结构是一致的，
 * 这里只做简单的数据提取和类型断言
 */

import type { SessionUser, SessionUserMetadata } from "../types"

/**
 * 从服务器响应中提取用户数据
 *
 * 支持的数据结构：
 * - 标准格式: { user: {...}, session: {...} }
 * - 嵌套格式: { session: { user: {...} } }
 * - 包装格式: { data: { user: {...} } }
 *
 * @param responseData - 服务器返回的响应数据
 * @returns SessionUser 对象，失败返回 null
 */
export function extractSessionUser(responseData: unknown): SessionUser | null {
  if (!responseData || typeof responseData !== "object") return null

  const data = responseData as Record<string, unknown>

  // 尝试从不同的数据结构中提取用户信息
  const rawUser =
    data.user || // 标准格式
    (data.session as Record<string, unknown>)?.user || // 嵌套格式
    (data.data as Record<string, unknown>)?.user // 包装格式

  if (!rawUser || typeof rawUser !== "object") return null

  const user = rawUser as Record<string, unknown>

  // 验证必需字段
  if (!user.id || !user.email) return null

  // 提取 session 相关数据
  const session = data.session as Record<string, unknown> | undefined

  // 直接返回，利用 better-auth 返回的数据结构
  return {
    activeOrganizationId: session?.activeOrganizationId as string | undefined,
    activeTeamId: session?.activeTeamId as string | undefined,
    banExpires: user.banExpires as string | undefined,
    banReason: user.banReason as string | undefined,
    banned: user.banned as boolean | undefined,
    createdAt: String(user.createdAt ?? ""),
    email: user.email as string,
    emailVerified: (user.emailVerified as boolean) ?? false,
    id: user.id as string,
    image: (user.image as string | null) ?? undefined,
    inherentOrganizationId: user.inherentOrganizationId as string | undefined,
    inherentTeamId: user.inherentTeamId as string | undefined,
    lastLoginAt: session?.createdAt ? String(session.createdAt) : undefined,
    lastLoginMethod: user.lastLoginMethod as string | undefined,
    metadata: (user.metadata as SessionUserMetadata) ?? {},
    name: (user.name as string) ?? "",
    role: user.role as string | undefined,
    updatedAt: String(user.updatedAt ?? ""),
  }
}
