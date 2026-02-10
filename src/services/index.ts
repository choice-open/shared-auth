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
} from "./referral-service"
export {
  createApiKeyService,
  type ApiKeyService,
} from "./api-key-service"
export {
  createCreditService,
  type CreditService,
} from "./credit-service"
export {
  createStripeService,
  type StripeService,
} from "./stripe-service"

// Re-export types from referral-service for backward compatibility
export type {
  ListReferralsResponse,
  ListReferralsResult,
  NeedsReferralOptions,
  ReferralErrorType,
  ReferralRecord,
  ReferralResponse,
  ReferralResult,
  RemoveReferralErrorType,
  RemoveReferralResult,
} from "./referral-service"
