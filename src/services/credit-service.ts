/**
 * Credit 服务
 *
 * 提供 Credit 相关的业务逻辑：
 * - 查询可用 Credits
 * - Credit Batch 管理 (创建、列出、获取、更新)
 * - Credit Consumption 管理 (创建、列出)
 *
 * 注意: Credit API 使用 /v1/credit 前缀，不经过 Better Auth basePath
 */

import type { ApiClient, ApiResponse } from "../api"
import type {
  CreditAvailable,
  CreditBatch,
  CreditConsumption,
  CreditErrorType,
  CreditMeta,
  CreditOwnerType,
  CreateCreditBatchRequest,
  CreateCreditBatchResult,
  CreateCreditConsumptionRequest,
  CreateCreditConsumptionResult,
  GetCreditAvailableRequest,
  GetCreditAvailableResult,
  GetCreditBatchResult,
  ListCreditBatchesRequest,
  ListCreditBatchesResult,
  ListCreditConsumptionsRequest,
  ListCreditConsumptionsResult,
  UpdateCreditBatchRequest,
  UpdateCreditBatchResult,
} from "../types"
import { buildQueryString } from "../utils/query-string"

// ===== Constants =====

const BASE_PATH = "/v1/credit"

// ===== Helper Functions =====

/**
 * 将 HTTP 状态码映射为 Credit 错误类型
 */
function mapStatusToError(status: number): CreditErrorType {
  switch (status) {
    case 400:
      return "bad_request"
    case 401:
      return "unauthorized"
    case 402:
      return "insufficient_credits"
    case 403:
      return "forbidden"
    case 404:
      return "not_found"
    default:
      return "unknown"
  }
}

// ===== Response Types =====

interface AvailableResponse {
  data: {
    amount: string
    created_at: string | null
    expires_at: string | null
    owner_id: string
    owner_type: CreditOwnerType
  }
  meta: CreditMeta | null
}

interface BatchListResponse {
  data: CreditBatch[]
  meta: CreditMeta | null
}

interface BatchResponse {
  data: CreditBatch
  meta: CreditMeta | null
}

interface ConsumptionListResponse {
  data: CreditConsumption[]
  meta: CreditMeta | null
}

// ===== Service Interface =====

export interface CreditService {
  /** 创建 Credit Batch */
  createBatch: (
    request: CreateCreditBatchRequest
  ) => Promise<CreateCreditBatchResult>
  /** 创建 Credit Consumption (从所有有效 batch 按 FIFO 扣除) */
  createConsumption: (
    request: CreateCreditConsumptionRequest
  ) => Promise<CreateCreditConsumptionResult>
  /** 查询可用 Credits (聚合) */
  getAvailable: (
    request: GetCreditAvailableRequest
  ) => Promise<GetCreditAvailableResult>
  /** 获取单个 Credit Batch */
  getBatch: (id: string) => Promise<GetCreditBatchResult>
  /** 列出 Credit Batches */
  listBatches: (
    request: ListCreditBatchesRequest
  ) => Promise<ListCreditBatchesResult>
  /** 列出 Credit Consumptions */
  listConsumptions: (
    request: ListCreditConsumptionsRequest
  ) => Promise<ListCreditConsumptionsResult>
  /** 更新 Credit Batch */
  updateBatch: (
    request: UpdateCreditBatchRequest
  ) => Promise<UpdateCreditBatchResult>
}

// ===== Service Implementation =====

/**
 * 创建 Credit 服务
 */
export function createCreditService(apiClient: ApiClient): CreditService {
  /**
   * 查询可用 Credits (聚合)
   */
  async function getAvailable(
    request: GetCreditAvailableRequest
  ): Promise<GetCreditAvailableResult> {
    try {
      const query = buildQueryString({
        owner_id: request.ownerId,
        owner_type: request.ownerType,
        from: request.from,
      })

      const response: ApiResponse<AvailableResponse> =
        await apiClient.get<AvailableResponse>(
          `${BASE_PATH}/available${query}`
        )

      if (response.ok) {
        const { data } = response.data
        const available: CreditAvailable = {
          amount: data.amount,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          ownerId: data.owner_id,
          ownerType: data.owner_type,
        }
        return { success: true, data: available, error: undefined }
      }

      return {
        success: false,
        data: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: undefined, error: "unknown" }
    }
  }

  /**
   * 列出 Credit Batches
   */
  async function listBatches(
    request: ListCreditBatchesRequest
  ): Promise<ListCreditBatchesResult> {
    try {
      const query = buildQueryString({
        ownerId: request.ownerId,
        ownerType: request.ownerType,
        source: request.source,
      })

      const response: ApiResponse<BatchListResponse> =
        await apiClient.get<BatchListResponse>(`${BASE_PATH}/batches${query}`)

      if (response.ok) {
        return {
          success: true,
          data: response.data.data || [],
          meta: response.data.meta,
          error: undefined,
        }
      }

      return {
        success: false,
        data: [],
        meta: null,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: [], meta: null, error: "unknown" }
    }
  }

  /**
   * 获取单个 Credit Batch
   */
  async function getBatch(id: string): Promise<GetCreditBatchResult> {
    try {
      const response: ApiResponse<BatchResponse> =
        await apiClient.get<BatchResponse>(
          `${BASE_PATH}/batches/${encodeURIComponent(id)}`
        )

      if (response.ok) {
        return { success: true, data: response.data.data, error: undefined }
      }

      return {
        success: false,
        data: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: undefined, error: "unknown" }
    }
  }

  /**
   * 创建 Credit Batch
   */
  async function createBatch(
    request: CreateCreditBatchRequest
  ): Promise<CreateCreditBatchResult> {
    try {
      const response: ApiResponse<BatchResponse> =
        await apiClient.post<BatchResponse>(`${BASE_PATH}/batches`, request)

      if (response.ok) {
        return { success: true, data: response.data.data, error: undefined }
      }

      return {
        success: false,
        data: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: undefined, error: "unknown" }
    }
  }

  /**
   * 更新 Credit Batch
   */
  async function updateBatch(
    request: UpdateCreditBatchRequest
  ): Promise<UpdateCreditBatchResult> {
    try {
      // API 使用 PATCH 方法
      const response = await apiClient.fetch(
        `${BASE_PATH}/batches/${encodeURIComponent(request.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remainingAmount: request.remainingAmount }),
        }
      )

      if (response.ok) {
        const json = (await response.json()) as BatchResponse
        return { success: true, data: json.data, error: undefined }
      }

      return {
        success: false,
        data: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: undefined, error: "unknown" }
    }
  }

  /**
   * 列出 Credit Consumptions
   */
  async function listConsumptions(
    request: ListCreditConsumptionsRequest
  ): Promise<ListCreditConsumptionsResult> {
    try {
      const query = buildQueryString({
        ownerId: request.ownerId,
        ownerType: request.ownerType,
        batchId: request.batchId,
        bookkeeper: request.bookkeeper,
      })

      const response: ApiResponse<ConsumptionListResponse> =
        await apiClient.get<ConsumptionListResponse>(
          `${BASE_PATH}/consumptions${query}`
        )

      if (response.ok) {
        return {
          success: true,
          data: response.data.data || [],
          meta: response.data.meta,
          error: undefined,
        }
      }

      return {
        success: false,
        data: [],
        meta: null,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: [], meta: null, error: "unknown" }
    }
  }

  /**
   * 创建 Credit Consumption
   * 按 FIFO 顺序从所有有效 batches 扣除，可能返回多条记录
   */
  async function createConsumption(
    request: CreateCreditConsumptionRequest
  ): Promise<CreateCreditConsumptionResult> {
    try {
      const response: ApiResponse<ConsumptionListResponse> =
        await apiClient.post<ConsumptionListResponse>(
          `${BASE_PATH}/consumptions`,
          request
        )

      if (response.ok) {
        return {
          success: true,
          data: response.data.data || [],
          error: undefined,
        }
      }

      return {
        success: false,
        data: [],
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, data: [], error: "unknown" }
    }
  }

  return {
    createBatch,
    createConsumption,
    getAvailable,
    getBatch,
    listBatches,
    listConsumptions,
    updateBatch,
  }
}
