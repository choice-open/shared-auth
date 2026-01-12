/**
 * User Mapper 测试
 */

import { describe, it, expect } from "vitest"
import { extractSessionUser } from "../utils/user-mapper"

describe("extractSessionUser", () => {
  it("应该从完整的 session 数据中提取用户", () => {
    const sessionData = {
      user: {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
        image: "https://example.com/avatar.png",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        inherentOrganizationId: "org-123",
        inherentTeamId: "team-123",
        metadata: { theme: "dark" },
      },
      session: {
        activeOrganizationId: "active-org",
        activeTeamId: "active-team",
      },
    }

    const user = extractSessionUser(sessionData)

    expect(user).not.toBeNull()
    expect(user?.id).toBe("user-123")
    expect(user?.email).toBe("test@example.com")
    expect(user?.name).toBe("Test User")
    expect(user?.emailVerified).toBe(true)
    expect(user?.image).toBe("https://example.com/avatar.png")
    expect(user?.activeOrganizationId).toBe("active-org")
    expect(user?.activeTeamId).toBe("active-team")
    expect(user?.inherentOrganizationId).toBe("org-123")
    expect(user?.inherentTeamId).toBe("team-123")
    expect(user?.metadata).toEqual({ theme: "dark" })
  })

  it("应该处理最小的用户数据", () => {
    const sessionData = {
      user: {
        id: "user-123",
        email: "test@example.com",
      },
    }

    const user = extractSessionUser(sessionData)

    expect(user).not.toBeNull()
    expect(user?.id).toBe("user-123")
    expect(user?.email).toBe("test@example.com")
    expect(user?.name).toBe("")
    expect(user?.emailVerified).toBe(false)
  })

  it("应该返回 null 当 user 不存在", () => {
    expect(extractSessionUser(null)).toBeNull()
    expect(extractSessionUser(undefined)).toBeNull()
    expect(extractSessionUser({})).toBeNull()
    expect(extractSessionUser({ user: null })).toBeNull()
  })

  it("应该返回 null 当缺少必需字段", () => {
    expect(extractSessionUser({ user: { id: "123" } })).toBeNull()
    expect(extractSessionUser({ user: { email: "test@example.com" } })).toBeNull()
  })

  it("应该处理字符串格式的日期", () => {
    const sessionData = {
      user: {
        id: "user-123",
        email: "test@example.com",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
    }

    const user = extractSessionUser(sessionData)

    expect(user?.createdAt).toBe("2024-01-01T00:00:00.000Z")
    expect(user?.updatedAt).toBe("2024-01-02T00:00:00.000Z")
  })
})

