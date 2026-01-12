/**
 * 认证状态 Store
 *
 * 职责：
 * - 创建 Legend State observable store
 * - 管理 Token 的持久化存储（localStorage）
 * - 提供认证状态的响应式数据源
 *
 * 注意：
 * - 不应直接在组件中操作 authStore.xxx.set()
 * - 应通过 storeActions 进行状态更新
 * - authStore 仅用于响应式读取（use$）
 */

import { observable } from "@legendapp/state"
import type { AuthState } from "../types"
import type { TokenStorage } from "../api"

/**
 * 创建 Token 存储工具
 */
export function createTokenStorage(tokenStorageKey: string): TokenStorage {
  const getStoredToken = (): string | null => {
    try {
      return localStorage.getItem(tokenStorageKey)
    } catch {
      return null
    }
  }

  return {
    get: getStoredToken,

    save(token: string | null) {
      try {
        if (token) {
          localStorage.setItem(tokenStorageKey, token)
        } else {
          localStorage.removeItem(tokenStorageKey)
        }
      } catch (error) {
        console.error("Failed to save token to localStorage:", error)
      }
    },

    clear() {
      this.save(null)
    },
  }
}

/**
 * 创建认证状态 Store
 */
export function createAuthStore(config: { tokenStorageKey: string }) {
  const { tokenStorageKey } = config

  // 创建 token 存储工具
  const tokenStorage = createTokenStorage(tokenStorageKey)

  // 创建 observable store
  const authStore = observable<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoaded: false,
    loading: false, // 初始为 false，只在执行异步操作时设为 true
    error: null,
    token: tokenStorage.get(),
  })

  // 同步 token 到 store
  const originalSave = tokenStorage.save.bind(tokenStorage)
  tokenStorage.save = (token: string | null) => {
    originalSave(token)
    authStore.token.set(token)
  }

  return {
    authStore,
    tokenStorage,
  }
}
