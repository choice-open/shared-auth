import { useEffect } from "react"
import type { AuthInstance } from "../core"

/**
 * 初始化认证状态（非 hook 版本）
 * 可在 React Router 的 clientLoader 中调用
 *
 * 职责：
 * 1. 处理 URL 中的 token（OAuth 回调）并保存
 * 2. 其他情况交给 Better Auth 的 useSession() 处理
 *
 * @returns 是否已认证
 */
export async function initializeAuth(auth: AuthInstance): Promise<boolean> {
  const { authService, tokenStorage, authStore, storeActions } = auth

  // 如果已经初始化，直接返回
  if (authStore.isLoaded.get()) {
    return authStore.isAuthenticated.get()
  }

  // 检查 URL 中的 token（OAuth 回调）
  const urlParams = new URLSearchParams(window.location.search)
  let tokenFromUrl = urlParams.get("token")

  if (tokenFromUrl) {
    if (decodeURIComponent(tokenFromUrl) === tokenFromUrl) {
      tokenFromUrl = encodeURIComponent(tokenFromUrl)
    }

    // 立即清理 URL 中的 token 参数（避免暴露）
    urlParams.delete("token")
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname
    window.history.replaceState({}, "", newUrl)

    // URL token 必须验证并保存（OAuth 回调）
    try {
      await authService.fetchAndSetSession(tokenFromUrl)
      return authStore.isAuthenticated.get()
    } catch {
      // Token 无效，清理并标记为已加载
      tokenStorage.clear()
      storeActions.initialize(null, true)
      return false
    }
  }

  // 没有 URL token 时，不主动请求 session
  // 让 Better Auth 的 useSession() 来处理 localStorage token
  // 这里只标记初始化流程已完成（但 session 状态由 useSession 管理）
  return authStore.isAuthenticated.get()
}

/**
 * 认证初始化 hook
 * 在应用启动时检查 URL 中的 token 或 localStorage 中的 token
 */
export function useAuthInit(auth: AuthInstance) {
  useEffect(() => {
    initializeAuth(auth).catch((error) => {
      console.error("Failed to initialize auth:", error)
      // 即使认证初始化失败，也标记为已加载
      auth.storeActions.initialize(null, true)
    })
  }, [auth])
}
