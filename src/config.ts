/**
 * 认证配置
 */

import type { AuthConfig, DefaultAuthConfig, BetterAuthPlugin } from "./types"

export type { AuthConfig, BetterAuthPlugin }

/**
 * 默认配置
 */
export const defaultAuthConfig: DefaultAuthConfig = {
  baseURL: "https://oneauth.choiceform.io",
  getSessionEndpoint: "/v1/auth/get-session",
  plugins: [],
  skipTokenCleanupOnError: false,
  tokenStorageKey: "oneauth_token",
}
