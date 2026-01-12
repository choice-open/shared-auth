/**
 * Store 测试
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { createAuthStore, createTokenStorage } from "../store/state"
import { createStoreActions } from "../store/actions"
import { createAuthComputed } from "../store/computed"
import type { SessionUser } from "../types"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock })

describe("createTokenStorage", () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it("应该保存和获取 token", () => {
    const storage = createTokenStorage("test-token")

    storage.save("my-token")
    expect(localStorageMock.setItem).toHaveBeenCalledWith("test-token", "my-token")

    localStorageMock.getItem.mockReturnValue("my-token")
    expect(storage.get()).toBe("my-token")
  })

  it("应该清除 token", () => {
    const storage = createTokenStorage("test-token")

    storage.clear()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-token")
  })

  it("应该处理 null token", () => {
    const storage = createTokenStorage("test-token")

    storage.save(null)
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-token")
  })
})

describe("createAuthStore", () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it("应该创建初始状态", () => {
    const { authStore } = createAuthStore({ tokenStorageKey: "test-token" })

    expect(authStore.user.get()).toBeNull()
    expect(authStore.isAuthenticated.get()).toBe(false)
    expect(authStore.isLoaded.get()).toBe(false)
    expect(authStore.loading.get()).toBe(false)
    expect(authStore.error.get()).toBeNull()
  })

  it("应该从 localStorage 读取初始 token", () => {
    localStorageMock.getItem.mockReturnValue("stored-token")

    const { authStore } = createAuthStore({ tokenStorageKey: "test-token" })

    expect(authStore.token.get()).toBe("stored-token")
  })
})

describe("createStoreActions", () => {
  let authStore: ReturnType<typeof createAuthStore>["authStore"]
  let tokenStorage: ReturnType<typeof createAuthStore>["tokenStorage"]
  let storeActions: ReturnType<typeof createStoreActions>

  const mockUser: SessionUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    emailVerified: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    metadata: {},
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()

    const store = createAuthStore({ tokenStorageKey: "test-token" })
    authStore = store.authStore
    tokenStorage = store.tokenStorage
    storeActions = createStoreActions(authStore, tokenStorage)
  })

  it("应该设置用户", () => {
    storeActions.setUser(mockUser)

    expect(authStore.user.get()).toEqual(mockUser)
    expect(authStore.isAuthenticated.get()).toBe(true)
  })

  it("应该清除用户", () => {
    storeActions.setUser(mockUser)
    storeActions.setUser(null)

    expect(authStore.user.get()).toBeNull()
    expect(authStore.isAuthenticated.get()).toBe(false)
  })

  it("应该更新用户", () => {
    storeActions.setUser(mockUser)
    storeActions.updateUser({ name: "New Name" })

    expect(authStore.user.get()?.name).toBe("New Name")
    expect(authStore.user.get()?.email).toBe("test@example.com")
  })

  it("应该设置 loading 状态", () => {
    storeActions.setLoading(true)
    expect(authStore.loading.get()).toBe(true)

    storeActions.setLoading(false)
    expect(authStore.loading.get()).toBe(false)
  })

  it("应该设置错误", () => {
    storeActions.setError("Test error")
    expect(authStore.error.get()).toBe("Test error")

    storeActions.setError(null)
    expect(authStore.error.get()).toBeNull()
  })

  it("应该清除认证状态", () => {
    storeActions.setUser(mockUser)
    storeActions.setError("some error")
    storeActions.clearAuth()

    expect(authStore.user.get()).toBeNull()
    expect(authStore.isAuthenticated.get()).toBe(false)
    expect(authStore.isLoaded.get()).toBe(true)
    expect(authStore.loading.get()).toBe(false)
  })

  it("应该设置活跃组织 ID", () => {
    storeActions.setUser(mockUser)
    storeActions.setActiveOrganizationId("org-123")

    expect(authStore.user.get()?.activeOrganizationId).toBe("org-123")
  })

  it("应该设置活跃团队 ID", () => {
    storeActions.setUser(mockUser)
    storeActions.setActiveTeamId("team-123")

    expect(authStore.user.get()?.activeTeamId).toBe("team-123")
  })

  it("应该返回正确的状态", () => {
    expect(storeActions.isAuthenticated()).toBe(false)
    expect(storeActions.isLoading()).toBe(false)
    expect(storeActions.isLoaded()).toBe(false)
    expect(storeActions.getUser()).toBeNull()
    expect(storeActions.getUserId()).toBeNull()

    storeActions.setAuthenticated(mockUser)

    expect(storeActions.isAuthenticated()).toBe(true)
    expect(storeActions.getUser()).toEqual(mockUser)
    expect(storeActions.getUserId()).toBe("user-123")
  })
})

describe("createAuthComputed", () => {
  let authStore: ReturnType<typeof createAuthStore>["authStore"]

  const mockUser: SessionUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    emailVerified: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    activeOrganizationId: "org-123",
    activeTeamId: "team-123",
    inherentOrganizationId: "inherent-org",
    inherentTeamId: "inherent-team",
    metadata: {},
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()

    const store = createAuthStore({ tokenStorageKey: "test-token" })
    authStore = store.authStore
  })

  it("应该计算 isInitializing", () => {
    const computed = createAuthComputed(authStore)

    expect(computed.isInitializing.get()).toBe(true)

    authStore.isLoaded.set(true)
    expect(computed.isInitializing.get()).toBe(false)
  })

  it("应该计算 isReady", () => {
    const computed = createAuthComputed(authStore)

    expect(computed.isReady.get()).toBe(false)

    authStore.isLoaded.set(true)
    authStore.isAuthenticated.set(true)
    expect(computed.isReady.get()).toBe(true)
  })

  it("应该计算用户信息", () => {
    const computed = createAuthComputed(authStore)

    authStore.user.set(mockUser)

    expect(computed.userId.get()).toBe("user-123")
    expect(computed.userEmail.get()).toBe("test@example.com")
    expect(computed.userName.get()).toBe("Test User")
    expect(computed.emailVerified.get()).toBe(true)
  })

  it("应该计算组织和团队信息", () => {
    const computed = createAuthComputed(authStore)

    authStore.user.set(mockUser)

    expect(computed.activeOrganizationId.get()).toBe("org-123")
    expect(computed.activeTeamId.get()).toBe("team-123")
    expect(computed.inherentOrganizationId.get()).toBe("inherent-org")
    expect(computed.inherentTeamId.get()).toBe("inherent-team")
    expect(computed.hasActiveOrganization.get()).toBe(true)
    expect(computed.hasActiveTeam.get()).toBe(true)
  })

  it("应该计算是否在伴生组织/团队中", () => {
    const computed = createAuthComputed(authStore)

    authStore.user.set({
      ...mockUser,
      activeOrganizationId: "inherent-org",
      activeTeamId: "inherent-team",
    })

    expect(computed.isInInherentOrganization.get()).toBe(true)
    expect(computed.isInInherentTeam.get()).toBe(true)
  })
})

