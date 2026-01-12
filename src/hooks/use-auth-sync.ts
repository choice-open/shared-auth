/**
 * 认证状态同步 Hook
 *
 * 职责：
 * 1. 监听 better-auth 的 session 变化
 * 2. 同步认证状态到 authStore
 * 3. 处理新用户的 companion team 设置
 *
 * 注意：
 * - URL token 参数的处理由 useAuthInit 负责
 * - 主题/语言同步由项目自行处理
 */

import { useEffect, useMemo, useRef } from "react"
import type { AuthInstance } from "../core"
import { setupCompanionTeam } from "../services/companion-team"
import type { SessionUser } from "../types"
import { extractSessionUser } from "../utils/user-mapper"

/** useAuthSync 返回值类型 */
export interface UseAuthSyncResult {
  isAuthenticated: boolean,
  isLoaded: boolean,
  isLoading: boolean,
  user: SessionUser | null
}

/** useAuthSync 配置 */
export interface UseAuthSyncConfig {
  /**
   * 认证状态变化回调
   */
  onAuthChange?: (isAuthenticated: boolean) => void,
  /**
   * 是否跳过 companion team 设置
   * 某些页面（如删除用户回调）不需要设置 companion team
   */
  skipCompanionTeam?: boolean,
  /**
   * 跳过 companion team 的路径列表
   * 如：['/auth/callback', '/auth/delete-success']
   */
  skipCompanionTeamPaths?: string[]
}

/**
 * 认证状态同步 Hook
 *
 * 使用示例：
 * ```tsx
 * function App() {
 *   useAuthSync(auth, {
 *     skipCompanionTeamPaths: ['/auth/callback', '/auth/delete-success'],
 *     onAuthChange: (isAuthenticated) => {
 *       if (isAuthenticated) {
 *         syncTheme()
 *         syncLanguage()
 *       }
 *     }
 *   })
 *
 *   return <YourApp />
 * }
 * ```
 */
export function useAuthSync(auth: AuthInstance, config: UseAuthSyncConfig = {}): UseAuthSyncResult {
  const {
    skipCompanionTeam = false,
    skipCompanionTeamPaths = [],
    onAuthChange,
  } = config

  const teamSetupRef = useRef(false)
  const prevAuthRef = useRef<boolean | null>(null)

  // 获取 better-auth session
  const { data: sessionData, isPending } = auth.authClient.useSession()

  // 检测是否是新用户（从 URL 参数读取）
  const isNewUser = useMemo(() => {
    if (typeof window === "undefined") return false
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get("isNew") === "true"
  }, [])

  // 检查当前路径是否应该跳过 companion team
  const shouldSkipCompanionTeam = useMemo(() => {
    if (skipCompanionTeam) return true
    if (typeof window === "undefined") return false

    const pathname = window.location.pathname
    return skipCompanionTeamPaths.some((path) => pathname === path || pathname.startsWith(path))
  }, [skipCompanionTeam, skipCompanionTeamPaths])

  // 提取用户信息
  const user = useMemo(() => extractSessionUser(sessionData), [sessionData])
  const isAuthenticated = !!user?.id
  const isLoaded = !isPending

  // 同步认证状态到 authStore
  useEffect(() => {
    auth.storeActions.setUser(user)
    auth.authStore.isLoaded.set(isLoaded)
    auth.authStore.loading.set(!isLoaded)
  }, [user, isLoaded, auth])

  // Companion team 设置（只有邮箱验证后才执行）
  useEffect(() => {
    if (shouldSkipCompanionTeam) return

    // 必须邮箱已验证才执行 companion team 设置
    if (
      isLoaded &&
      isAuthenticated &&
      user?.id &&
      user.emailVerified === true &&
      !teamSetupRef.current
    ) {
      teamSetupRef.current = true
      const token = auth.tokenStorage.get()

      if (token && typeof token === "string" && token.trim().length > 0) {
        setupCompanionTeam(auth, token, {
          onComplete: () => {
            // 清除 isNew 参数
            if (isNewUser && typeof window !== "undefined") {
              const url = new URL(window.location.href)
              url.searchParams.delete("isNew")
              window.history.replaceState({}, "", url.pathname + url.search)
            }
          },
          onError: () => {
            teamSetupRef.current = false
          },
        })
      }
    }

    // 用户登出时重置
    if (!user && teamSetupRef.current) {
      teamSetupRef.current = false
    }
  }, [user, isAuthenticated, isLoaded, auth, shouldSkipCompanionTeam, isNewUser])

  // 认证状态变化回调
  useEffect(() => {
    if (!onAuthChange) return
    if (prevAuthRef.current === isAuthenticated) return

    prevAuthRef.current = isAuthenticated
    onAuthChange(isAuthenticated)
  }, [isAuthenticated, onAuthChange])

  return {
    user,
    isAuthenticated,
    isLoaded,
    isLoading: !isLoaded,
  }
}

