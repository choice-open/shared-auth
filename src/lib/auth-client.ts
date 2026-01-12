import {
  inferAdditionalFields,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { AuthConfig } from "../config"

/**
 * 创建 Better Auth 客户端
 *
 * 配置说明：
 * - 使用 Bearer Token 认证模式
 * - Token 从 localStorage 中动态读取
 * - 支持服务器端 Bearer Plugin 的 session 管理
 * - basePath 设置为 /v1/auth（与后端 better-auth 配置一致）
 *
 * @param config - 认证配置对象
 * @returns Better Auth 客户端实例
 */
export function createAuthClientFromConfig(config: AuthConfig) {
  const { baseURL, plugins = [], tokenStorageKey = "oneauth_token" } = config

  return createAuthClient({
    baseURL,
    basePath: "/v1/auth",
    plugins: [
      ...plugins,
      inferAdditionalFields({
        user: {
          inherentOrganizationId: {
            type: "string",
            description: "Inherent organization ID",
            input: false,
            required: false,
          },
          inherentTeamId: {
            type: "string",
            description: "Inherent team ID",
            input: false,
            required: false,
          },
          metadata: {
            type: "json",
            input: true,
            returned: true,
            required: true,
          },
        },
      }),
      magicLinkClient(),
      organizationClient({
        schema: {
          invitation: {
            additionalFields: {
              linkBaseUrl: {
                type: "string",
                description: "Invitation link base URL",
                required: true,
                returned: true,
              },
            },
          },
          organization: {
            additionalFields: {
              inherentFrom: {
                type: "string",
                description: "Inherited from user ID",
                input: false,
                returned: true,
              },
              metadata: {
                type: "json",
                input: true,
                returned: true,
                required: true,
              },
            },
          },
          team: {
            additionalFields: {
              inherentFrom: {
                type: "string",
                description: "Inherited from user ID",
                input: false,
                returned: true,
              },
              metadata: {
                type: "json",
                input: true,
                returned: true,
                required: true,
              },
            },
          },
        },
        teams: { enabled: true },
      }),
    ],
    fetchOptions: {
      auth: {
        type: "Bearer",
        token: () => {
          if (typeof window === "undefined") {
            return undefined
          }
          return localStorage.getItem(tokenStorageKey) ?? undefined
        },
      },
      credentials: "include",
    },
  })
}
