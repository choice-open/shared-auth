/**
 * API Key 服务
 *
 * 提供 API Key 相关的业务逻辑：
 * - 创建 API Key
 * - 获取 API Key
 * - 更新 API Key
 * - 删除 API Key
 * - 列出所有 API Keys
 */

import type { ApiClient, ApiResponse } from "../api"
import type {
  ApiKey,
  ApiKeyWithSecret,
  ApiKeyErrorType,
  CreateApiKeyRequest,
  CreateApiKeyResult,
  DeleteApiKeyRequest,
  DeleteApiKeyResponse,
  GetApiKeyResult,
  ListApiKeysResult,
  UpdateApiKeyRequest,
  UpdateApiKeyResult,
  ApiKeyResult,
} from "../types"

// ===== Constants =====

const BASE_PATH = "/v1/auth/api-key"

// ===== Helper Functions =====

/**
 * 根据 HTTP 状态码映射错误类型
 */
function mapStatusToError(status: number): ApiKeyErrorType {
  switch (status) {
    case 400:
      return "bad_request"
    case 401:
      return "unauthorized"
    case 403:
      return "forbidden"
    case 404:
      return "not_found"
    case 429:
      return "rate_limited"
    default:
      return "unknown"
  }
}

// ===== Service Interface =====

export interface ApiKeyService {
  /** 创建新的 API Key */
  createApiKey: (request: CreateApiKeyRequest) => Promise<CreateApiKeyResult>
  /** 删除 API Key */
  deleteApiKey: (keyId: string) => Promise<ApiKeyResult>
  /** 根据 ID 获取 API Key */
  getApiKey: (id: string) => Promise<GetApiKeyResult>
  /** 列出当前用户的所有 API Keys */
  listApiKeys: () => Promise<ListApiKeysResult>
  /** 更新 API Key */
  updateApiKey: (request: UpdateApiKeyRequest) => Promise<UpdateApiKeyResult>
}

// ===== Service Implementation =====

/**
 * 创建 API Key 服务
 */
export function createApiKeyService(apiClient: ApiClient): ApiKeyService {
  /**
   * 创建新的 API Key
   */
  async function createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResult> {
    try {
      const response: ApiResponse<ApiKeyWithSecret> = await apiClient.post<ApiKeyWithSecret>(
        `${BASE_PATH}/create`,
        request,
      )

      if (response.ok) {
        return { success: true, apiKey: response.data, error: undefined }
      }

      return {
        success: false,
        apiKey: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, apiKey: undefined, error: "unknown" }
    }
  }

  /**
   * 根据 ID 获取 API Key
   */
  async function getApiKey(id: string): Promise<GetApiKeyResult> {
    try {
      const response: ApiResponse<ApiKey> = await apiClient.get<ApiKey>(
        `${BASE_PATH}/get?id=${encodeURIComponent(id)}`,
      )

      if (response.ok) {
        return { success: true, apiKey: response.data, error: undefined }
      }

      return {
        success: false,
        apiKey: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, apiKey: undefined, error: "unknown" }
    }
  }

  /**
   * 更新 API Key
   */
  async function updateApiKey(request: UpdateApiKeyRequest): Promise<UpdateApiKeyResult> {
    try {
      const response: ApiResponse<ApiKey> = await apiClient.post<ApiKey>(
        `${BASE_PATH}/update`,
        request,
      )

      if (response.ok) {
        return { success: true, apiKey: response.data, error: undefined }
      }

      return {
        success: false,
        apiKey: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, apiKey: undefined, error: "unknown" }
    }
  }

  /**
   * 删除 API Key
   */
  async function deleteApiKey(keyId: string): Promise<ApiKeyResult> {
    try {
      const request: DeleteApiKeyRequest = { keyId }
      const response: ApiResponse<DeleteApiKeyResponse> = await apiClient.post<DeleteApiKeyResponse>(
        `${BASE_PATH}/delete`,
        request,
      )

      if (response.ok && response.data.success) {
        return { success: true, error: undefined }
      }

      return {
        success: false,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, error: "unknown" }
    }
  }

  /**
   * 列出当前用户的所有 API Keys
   */
  async function listApiKeys(): Promise<ListApiKeysResult> {
    try {
      const response: ApiResponse<ApiKey[]> = await apiClient.get<ApiKey[]>(
        `${BASE_PATH}/list`,
      )

      if (response.ok) {
        return { success: true, apiKeys: response.data || [], error: undefined }
      }

      return {
        success: false,
        apiKeys: [],
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, apiKeys: [], error: "unknown" }
    }
  }

  return {
    createApiKey,
    deleteApiKey,
    getApiKey,
    listApiKeys,
    updateApiKey,
  }
}
