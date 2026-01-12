/**
 * 基础 HTTP 客户端
 *
 * 职责：
 * - 封装 fetch API，提供统一的 HTTP 请求方法
 * - 自动添加认证 Header（Authorization: Bearer xxx）
 * - 处理 401 未授权响应（自动清除认证状态）
 * - 解析 JSON 响应
 *
 * 使用：
 * - 所有 API 请求都应通过 apiClient 发送
 * - 不应直接使用原生 fetch
 */

import type { Observable } from "@legendapp/state"
import type { AuthState } from "../types"

export interface TokenStorage {
  clear(): void
  get(): string | null
  save(token: string | null): void
}

export interface UnauthorizedHandler {
  handleUnauthorized(): void
}

export interface ApiClientConfig {
  authStore: Observable<AuthState>
  baseURL?: string
  tokenStorage: TokenStorage
  unauthorizedHandler: UnauthorizedHandler
}

export interface ApiResponse<T = unknown> {
  data: T
  ok: boolean
  status: number
}

function getAuthHeaders(tokenStorage: TokenStorage): Record<string, string> {
  const token = tokenStorage.get()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(
  response: Response,
  unauthorizedHandler: UnauthorizedHandler
): Promise<ApiResponse<T>> {
  if (response.status === 401) {
    unauthorizedHandler.handleUnauthorized()
  }

  let data: T | null = null
  if (response.headers.get("content-type")?.includes("application/json")) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  return { data: data as T, ok: response.ok, status: response.status }
}

export async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const text = await response.text()
    if (text) {
      try {
        const json = JSON.parse(text) as Record<string, unknown>
        if (typeof json.error === "object" && json.error !== null) {
          const msg = (json.error as Record<string, unknown>).message
          if (typeof msg === "string") return msg
        }
        if (typeof json.message === "string") return json.message
      } catch {
        return text.length < 200 ? text : `${text.substring(0, 200)}...`
      }
    }
  } catch {
    // ignore
  }
  return `HTTP ${response.status}: ${response.statusText}`
}

export function createApiClient(config: ApiClientConfig) {
  const { tokenStorage, unauthorizedHandler, baseURL = "" } = config

  const buildUrl = (path: string) => (path.startsWith("http") ? path : `${baseURL}${path}`)

  return {
    async get<T = unknown>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
      const response = await fetch(buildUrl(path), {
        ...options,
        method: "GET",
        headers: { ...getAuthHeaders(tokenStorage), ...options?.headers },
      })
      return handleResponse<T>(response, unauthorizedHandler)
    },

    async post<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
      const response = await fetch(buildUrl(path), {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(tokenStorage),
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      return handleResponse<T>(response, unauthorizedHandler)
    },

    async put<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
      const response = await fetch(buildUrl(path), {
        ...options,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(tokenStorage),
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      return handleResponse<T>(response, unauthorizedHandler)
    },

    async delete<T = unknown>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
      const response = await fetch(buildUrl(path), {
        ...options,
        method: "DELETE",
        headers: { ...getAuthHeaders(tokenStorage), ...options?.headers },
      })
      return handleResponse<T>(response, unauthorizedHandler)
    },

    async fetch(path: string, options?: RequestInit): Promise<Response> {
      const response = await fetch(buildUrl(path), {
        ...options,
        headers: { ...getAuthHeaders(tokenStorage), ...options?.headers },
      })
      if (response.status === 401) {
        unauthorizedHandler.handleUnauthorized()
      }
      return response
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
