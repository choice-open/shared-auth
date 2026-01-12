/**
 * Hooks 导出
 */

export { useAuthInit, initializeAuth } from "./use-auth-init"
export { useAuthSync, type UseAuthSyncConfig, type UseAuthSyncResult } from "./use-auth-sync"
export {
  useProtectedRoute,
  type UseProtectedRouteConfig,
  type UseProtectedRouteResult,
  type ProtectionStatus,
} from "./use-protected-route"
export {
  useEmailVerification,
  type UseEmailVerificationConfig,
  type UseEmailVerificationResult,
} from "./use-email-verification"

