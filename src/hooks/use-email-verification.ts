/**
 * 邮箱验证 Hook
 *
 * 职责：
 * 1. 重新发送验证邮件
 * 2. 检查邮箱是否已验证
 * 3. 更换邮箱（登出并跳转）
 * 4. 倒计时逻辑
 */

import { useCallback, useRef, useState } from "react"
import type { AuthInstance } from "../core"

/** useEmailVerification 配置 */
export interface UseEmailVerificationConfig {
  /** 邮箱地址 */
  email: string
  /** 语言 */
  lang?: string
  /** 倒计时时长（秒），默认 60 */
  countdownDuration?: number
  /** 重定向函数 */
  onRedirect?: (path: string) => void
  /** 发送成功回调 */
  onSendSuccess?: (email: string) => void
  /** 发送失败回调 */
  onSendError?: (error: Error) => void
  /** 已验证回调 */
  onAlreadyVerified?: () => void
}

/** useEmailVerification 返回值 */
export interface UseEmailVerificationResult {
  /** 是否正在发送 */
  isLoading: boolean
  /** 邮箱是否已验证 */
  isAlreadyVerified: boolean
  /** 是否在倒计时中 */
  isCountingDown: boolean
  /** 剩余倒计时秒数 */
  countdown: number
  /** 重新发送验证邮件 */
  resendVerification: () => Promise<void>
  /** 更换邮箱（登出并跳转） */
  changeEmail: () => Promise<void>
}

/**
 * 邮箱验证 Hook
 *
 * 使用示例：
 * ```tsx
 * function VerifyEmailPage({ email, lang }) {
 *   const navigate = useNavigate()
 *
 *   const {
 *     isLoading,
 *     isAlreadyVerified,
 *     isCountingDown,
 *     countdown,
 *     resendVerification,
 *     changeEmail
 *   } = useEmailVerification(auth, {
 *     email,
 *     lang,
 *     onRedirect: (path) => navigate(path),
 *     onSendSuccess: (email) => toast.success(`验证邮件已发送到 ${email}`),
 *     onSendError: () => toast.error('发送失败'),
 *     onAlreadyVerified: () => navigate('/community')
 *   })
 *
 *   return (
 *     <div>
 *       {isAlreadyVerified ? (
 *         <p>邮箱已验证，正在跳转...</p>
 *       ) : (
 *         <>
 *           <button onClick={resendVerification} disabled={isLoading || isCountingDown}>
 *             {isCountingDown ? `${countdown}s 后重试` : '重新发送'}
 *           </button>
 *           <button onClick={changeEmail}>使用其他邮箱</button>
 *         </>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useEmailVerification(
  auth: AuthInstance,
  config: UseEmailVerificationConfig
): UseEmailVerificationResult {
  const {
    email,
    lang = "us",
    countdownDuration = 60,
    onRedirect,
    onSendSuccess,
    onSendError,
    onAlreadyVerified,
  } = config

  const [isLoading, setIsLoading] = useState(false)
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false)
  const [countdown, setCountdown] = useState(countdownDuration)
  const [isCountingDown, setIsCountingDown] = useState(false)

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 开始倒计时
  const startCountdown = useCallback(() => {
    setCountdown(countdownDuration)
    setIsCountingDown(true)

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
          }
          setIsCountingDown(false)
          return countdownDuration
        }
        return prev - 1
      })
    }, 1000)
  }, [countdownDuration])

  // 重新发送验证邮件
  const resendVerification = useCallback(async () => {
    if (!email || isCountingDown || isLoading) return

    setIsLoading(true)

    try {
      // 先获取最新 session 状态，确认邮箱是否已验证
      const token = auth.tokenStorage.get()
      if (token) {
        try {
          const session = await auth.authService.fetchAndSetSession(token)
          if (session?.emailVerified === true) {
            // 邮箱已验证，不需要再发送
            setIsAlreadyVerified(true)
            onAlreadyVerified?.()
            return
          }
        } catch {
          // 获取 session 失败，继续发送验证邮件
        }
      }

      // 发送验证邮件
      await auth.authApi.resendVerificationEmail(email)
      onSendSuccess?.(email)
      startCountdown()
    } catch (error) {
      onSendError?.(error instanceof Error ? error : new Error("Failed to send verification email"))
    } finally {
      setIsLoading(false)
    }
  }, [
    email,
    isCountingDown,
    isLoading,
    auth,
    onSendSuccess,
    onSendError,
    onAlreadyVerified,
    startCountdown,
  ])

  // 更换邮箱（登出并跳转）
  const changeEmail = useCallback(async () => {
    try {
      // 完全清除登录状态（包括 Better Auth session）
      await auth.authClient.signOut().catch(() => {})
      auth.storeActions.clearAuth()

      // 跳转到登录页
      onRedirect?.(`/sign-in?lang=${lang}`)
    } catch {
      // 静默失败，仍然执行跳转
      onRedirect?.(`/sign-in?lang=${lang}`)
    }
  }, [auth, lang, onRedirect])

  return {
    isLoading,
    isAlreadyVerified,
    isCountingDown,
    countdown,
    resendVerification,
    changeEmail,
  }
}

