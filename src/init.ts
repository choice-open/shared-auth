/**
 * 快速初始化
 *
 * 提供简化的认证初始化接口
 */

import { createAuth } from "./core"
import type { AuthConfig } from "./types"
import { magicLinkClient, organizationClient } from "better-auth/client/plugins"

/**
 * 快速初始化配置
 */
interface InitAuthConfig {
  /** Better Auth API 基础 URL */
  baseURL: string
  /** Better Auth 插件列表，如果不传则使用默认的 organizationClient */
  plugins?: AuthConfig["plugins"]
  /** 跳过错误时的 token 清除（开发环境用） */
  skipTokenCleanupOnError?: boolean
  /** Token 存储的 localStorage key */
  tokenStorageKey?: string
}

/**
 * 快速初始化认证系统（使用默认配置）
 *
 * 默认配置：
 * - 使用 organizationClient 插件（支持团队功能）
 * - 如果用户传入自定义 plugins，则使用用户配置（不会合并默认插件）
 */
export function initAuth(config: InitAuthConfig) {
  const { baseURL, tokenStorageKey, plugins, skipTokenCleanupOnError } = config

  // 默认插件：magicLinkClient + organizationClient
  const finalPlugins = plugins ?? [
    magicLinkClient(),
    organizationClient({ teams: { enabled: true } }),
  ]

  return createAuth({
    baseURL,
    plugins: finalPlugins,
    tokenStorageKey: tokenStorageKey || "auth-token",
    skipTokenCleanupOnError,
  })
}
