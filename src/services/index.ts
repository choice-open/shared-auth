/**
 * 服务导出
 */

export { setupCompanionTeam } from "./companion-team"
export {
  createAuthService,
  type AuthService,
  type AuthServiceConfig,
  type BetterAuthClientMethods,
} from "./auth-service"
export {
  createCallbackService,
  type CallbackService,
} from "./callback-service"
export {
  createReferralService,
  needsReferral,
  getReferralFields,
  type ReferralService,
  type ReferralResponse,
  type ReferralRecord,
  type ListReferralsResponse,
  type ReferralErrorType,
  type ReferralResult,
  type RemoveReferralErrorType,
  type RemoveReferralResult,
  type NeedsReferralOptions,
} from "./referral-service"
