/**
 * 路由保护 Hook
 *
 * 职责：
 * 1. 等待认证初始化完成
 * 2. 根据认证状态进行路由保护
 * 3. 强制邮箱验证检查
 * 4. 支持公开路由例外
 */

import { useEffect, useMemo } from "react"
import { use$ } from "@legendapp/state/react"
import type { AuthInstance } from "../core"

/** 保护状态 */
export type ProtectionStatus =
  | "loading"        // 正在加载
  | "unauthenticated" // 未认证
  | "unverified"     // 邮箱未验证
  | "authorized"     // 已授权
  | "public"         // 公开路由

/** useProtectedRoute 配置 */
export interface UseProtectedRouteConfig {
  /** 语言参数 */
  lang?: string,
  /** 重定向函数（由项目提供） */
  onRedirect?: (path: string) => void,
  /** 当前路径（如果不传则从 window.location 获取） */
  pathname?: string
  /** 公开路由前缀列表（不需要认证的路径） */
  publicRoutePrefixes?: string[],
  /** 是否要求邮箱已验证（默认 true） */
  requireEmailVerified?: boolean
}

/** useProtectedRoute 返回值 */
export interface UseProtectedRouteResult {
  /** 是否正在加载 */
  isLoading: boolean,
  /** 重定向路径（如果需要重定向） */
  redirectPath: string | null,
  /** 是否应该渲染子组件 */
  shouldRender: boolean,
  /** 保护状态 */
  status: ProtectionStatus
}

/**
 * 路由保护 Hook
 *
 * 使用示例：
 * ```tsx
 * function ProtectedRoute({ children }) {
 *   const navigate = useNavigate()
 *   const location = useLocation()
 *
 *   const { status, shouldRender, isLoading, redirectPath } = useProtectedRoute(auth, {
 *     pathname: location.pathname,
 *     publicRoutePrefixes: ['/resources', '/public'],
 *     onRedirect: (path) => navigate(path, { replace: true })
 *   })
 *
 *   useEffect(() => {
 *     if (redirectPath) {
 *       navigate(redirectPath, { replace: true })
 *     }
 *   }, [redirectPath, navigate])
 *
 *   if (!shouldRender) {
 *     return <Loading />
 *   }
 *
 *   return <>{children}</>
 * }
 * ```
 */
export function useProtectedRoute(
  auth: AuthInstance,
  config: UseProtectedRouteConfig = {}
): UseProtectedRouteResult {
  const {
    requireEmailVerified = true,
    publicRoutePrefixes = [],
    pathname: propPathname,
    lang = "us",
    onRedirect,
  } = config

  // 从 authStore 获取状态
  const isLoaded = use$(auth.authStore.isLoaded)
  const isAuthenticated = use$(auth.authStore.isAuthenticated)
  const user = use$(auth.authStore.user)

  // 获取当前路径
  const pathname = useMemo(() => {
    if (propPathname) return propPathname
    if (typeof window === "undefined") return "/"
    return window.location.pathname
  }, [propPathname])

  // 检查是否是公开路由
  const isPublicRoute = useMemo(() => {
    return publicRoutePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix)
    )
  }, [pathname, publicRoutePrefixes])

  // 计算保护状态
  const status = useMemo<ProtectionStatus>(() => {
    // 公开路由
    if (isPublicRoute) return "public"

    // 未加载完成
    if (!isLoaded) return "loading"

    // 未认证
    if (!isAuthenticated) return "unauthenticated"

    // 邮箱未验证
    if (requireEmailVerified && user && user.emailVerified !== true) {
      return "unverified"
    }

    // 已授权
    return "authorized"
  }, [isPublicRoute, isLoaded, isAuthenticated, user, requireEmailVerified])

  // 计算重定向路径
  const redirectPath = useMemo<string | null>(() => {
    switch (status) {
      case "unauthenticated":
        return `/sign-in?lang=${lang}`
      case "unverified":
        return `/verify-email?lang=${lang}&email=${encodeURIComponent(user?.email || "")}`
      default:
        return null
    }
  }, [status, lang, user?.email])

  // 执行重定向
  useEffect(() => {
    if (redirectPath && onRedirect) {
      onRedirect(redirectPath)
    }
  }, [redirectPath, onRedirect])

  // 是否应该渲染子组件
  const shouldRender = status === "authorized" || status === "public"

  return {
    status,
    shouldRender,
    isLoading: status === "loading",
    redirectPath,
  }
}

