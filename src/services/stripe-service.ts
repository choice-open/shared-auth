/**
 * Stripe 服务
 *
 * 提供 Stripe 相关的业务逻辑：
 * - 订阅管理 (升级、取消、恢复)
 * - 产品查询
 * - 价格查询
 * - 计划查询
 * - 账单门户
 */

import type { ApiClient, ApiResponse } from "../api"
import type {
  CancelSubscriptionRequest,
  CreateBillingPortalRequest,
  GetStripePlanResult,
  GetStripePriceResult,
  GetStripeProductResult,
  ListActiveSubscriptionsRequest,
  ListActiveSubscriptionsResult,
  ListStripePlansRequest,
  ListStripePlansResult,
  ListStripePricesRequest,
  ListStripePricesResult,
  ListStripeProductsRequest,
  ListStripeProductsResult,
  RestoreSubscriptionRequest,
  StripeErrorType,
  StripePlan,
  StripePrice,
  StripeProduct,
  StripeRedirectResult,
  StripeResult,
  StripeSubscription,
  UpgradeSubscriptionRequest,
} from "../types"
import { buildQueryString } from "../utils/query-string"

// ===== Constants =====

const STRIPE_PATH = "/v1/auth/stripe"
const SUBSCRIPTION_PATH = "/v1/auth/subscription"

// ===== Helper Functions =====

/**
 * 将 HTTP 状态码映射为 Stripe 错误类型
 */
function mapStatusToError(status: number): StripeErrorType {
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

// ===== Response Types =====

interface ProductsResponse {
  products: StripeProduct[]
}

interface PricesResponse {
  prices: StripePrice[]
}

interface PlansResponse {
  plans: StripePlan[]
}

interface RedirectResponse {
  url?: string
}

interface SubscriptionsResponse {
  subscriptions: StripeSubscription[]
}

// ===== Service Interface =====

export interface StripeService {
  /** 取消订阅 */
  cancelSubscription: (request: CancelSubscriptionRequest) => Promise<StripeRedirectResult>
  /** 创建账单门户 */
  createBillingPortal: (request: CreateBillingPortalRequest) => Promise<StripeRedirectResult>
  /** 获取单个计划 */
  getPlan: (id: string, include?: string) => Promise<GetStripePlanResult>
  /** 获取单个价格 */
  getPrice: (id: string, include?: string) => Promise<GetStripePriceResult>
  /** 获取单个产品 */
  getProduct: (id: string, include?: string) => Promise<GetStripeProductResult>
  /** 列出当前用户的活跃订阅 */
  listActiveSubscriptions: (request?: ListActiveSubscriptionsRequest) => Promise<ListActiveSubscriptionsResult>
  /** 列出计划 */
  listPlans: (request?: ListStripePlansRequest) => Promise<ListStripePlansResult>
  /** 列出价格 */
  listPrices: (request?: ListStripePricesRequest) => Promise<ListStripePricesResult>
  /** 列出产品 */
  listProducts: (request?: ListStripeProductsRequest) => Promise<ListStripeProductsResult>
  /** 恢复订阅 */
  restoreSubscription: (request: RestoreSubscriptionRequest) => Promise<StripeResult>
  /** 升级订阅 */
  upgradeSubscription: (request: UpgradeSubscriptionRequest) => Promise<StripeRedirectResult>
}

// ===== Service Implementation =====

/**
 * 创建 Stripe 服务
 */
export function createStripeService(apiClient: ApiClient): StripeService {
  // ===== Products =====

  /**
   * 列出产品
   */
  async function listProducts(
    request?: ListStripeProductsRequest
  ): Promise<ListStripeProductsResult> {
    try {
      const query = buildQueryString({
        active: request?.active,
        livemode: request?.livemode,
        applicationId: request?.applicationId,
        type: request?.type,
        include: request?.include,
      })

      const response: ApiResponse<ProductsResponse> =
        await apiClient.get<ProductsResponse>(`${STRIPE_PATH}/products${query}`)

      if (response.ok) {
        return {
          success: true,
          products: response.data.products || [],
          error: undefined,
        }
      }

      return {
        success: false,
        products: [],
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, products: [], error: "unknown" }
    }
  }

  /**
   * 获取单个产品
   */
  async function getProduct(
    id: string,
    include?: string
  ): Promise<GetStripeProductResult> {
    try {
      const query = include ? `?include=${encodeURIComponent(include)}` : ""
      const response: ApiResponse<StripeProduct> = await apiClient.get<StripeProduct>(
        `${STRIPE_PATH}/products/${encodeURIComponent(id)}${query}`
      )

      if (response.ok) {
        return { success: true, product: response.data, error: undefined }
      }

      return {
        success: false,
        product: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, product: undefined, error: "unknown" }
    }
  }

  // ===== Prices =====

  /**
   * 列出价格
   */
  async function listPrices(
    request?: ListStripePricesRequest
  ): Promise<ListStripePricesResult> {
    try {
      const query = buildQueryString({
        active: request?.active,
        livemode: request?.livemode,
        include: request?.include,
      })

      const response: ApiResponse<PricesResponse> =
        await apiClient.get<PricesResponse>(`${STRIPE_PATH}/prices${query}`)

      if (response.ok) {
        return {
          success: true,
          prices: response.data.prices || [],
          error: undefined,
        }
      }

      return {
        success: false,
        prices: [],
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, prices: [], error: "unknown" }
    }
  }

  /**
   * 获取单个价格
   */
  async function getPrice(
    id: string,
    include?: string
  ): Promise<GetStripePriceResult> {
    try {
      const query = include ? `?include=${encodeURIComponent(include)}` : ""
      const response: ApiResponse<StripePrice> = await apiClient.get<StripePrice>(
        `${STRIPE_PATH}/prices/${encodeURIComponent(id)}${query}`
      )

      if (response.ok) {
        return { success: true, price: response.data, error: undefined }
      }

      return {
        success: false,
        price: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, price: undefined, error: "unknown" }
    }
  }

  // ===== Plans =====

  /**
   * 列出计划
   */
  async function listPlans(
    request?: ListStripePlansRequest
  ): Promise<ListStripePlansResult> {
    try {
      const query = buildQueryString({
        active: request?.active,
        livemode: request?.livemode,
        applicationId: request?.applicationId,
        isOneoff: request?.isOneoff,
        include: request?.include,
      })

      const response: ApiResponse<PlansResponse> =
        await apiClient.get<PlansResponse>(`${STRIPE_PATH}/plans${query}`)

      if (response.ok) {
        return {
          success: true,
          plans: response.data.plans || [],
          error: undefined,
        }
      }

      return {
        success: false,
        plans: [],
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, plans: [], error: "unknown" }
    }
  }

  /**
   * 获取单个计划
   */
  async function getPlan(
    id: string,
    include?: string
  ): Promise<GetStripePlanResult> {
    try {
      const query = include ? `?include=${encodeURIComponent(include)}` : ""
      const response: ApiResponse<StripePlan> = await apiClient.get<StripePlan>(
        `${STRIPE_PATH}/plans/${encodeURIComponent(id)}${query}`
      )

      if (response.ok) {
        return { success: true, plan: response.data, error: undefined }
      }

      return {
        success: false,
        plan: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, plan: undefined, error: "unknown" }
    }
  }

  // ===== Subscription Management =====

  /**
   * 列出当前用户的活跃订阅
   */
  async function listActiveSubscriptions(
    request?: ListActiveSubscriptionsRequest
  ): Promise<ListActiveSubscriptionsResult> {
    try {
      const query = buildQueryString({
        customerType: request?.customerType,
        referenceId: request?.referenceId,
      })

      const response: ApiResponse<StripeSubscription[]> =
        await apiClient.get<StripeSubscription[]>(
          `${SUBSCRIPTION_PATH}/list${query}`
        )

      if (response.ok) {
        return {
          success: true,
          subscriptions: response.data,
          error: undefined,
        }
      }

      return {
        success: false,
        subscriptions: [],
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, subscriptions: [], error: "unknown" }
    }
  }

  /**
   * 升级订阅
   */
  async function upgradeSubscription(
    request: UpgradeSubscriptionRequest
  ): Promise<StripeRedirectResult> {
    try {
      const response: ApiResponse<RedirectResponse> =
        await apiClient.post<RedirectResponse>(`${SUBSCRIPTION_PATH}/upgrade`, request)

      if (response.ok) {
        return {
          success: true,
          url: response.data.url,
          error: undefined,
        }
      }

      return {
        success: false,
        url: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, url: undefined, error: "unknown" }
    }
  }

  /**
   * 取消订阅
   */
  async function cancelSubscription(
    request: CancelSubscriptionRequest
  ): Promise<StripeRedirectResult> {
    try {
      const response: ApiResponse<RedirectResponse> =
        await apiClient.post<RedirectResponse>(`${SUBSCRIPTION_PATH}/cancel`, request)

      if (response.ok) {
        return {
          success: true,
          url: response.data.url,
          error: undefined,
        }
      }

      return {
        success: false,
        url: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, url: undefined, error: "unknown" }
    }
  }

  /**
   * 恢复订阅
   */
  async function restoreSubscription(
    request: RestoreSubscriptionRequest
  ): Promise<StripeResult> {
    try {
      const response = await apiClient.post(`${SUBSCRIPTION_PATH}/restore`, request)

      if (response.ok) {
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
   * 创建账单门户
   */
  async function createBillingPortal(
    request: CreateBillingPortalRequest
  ): Promise<StripeRedirectResult> {
    try {
      const response: ApiResponse<RedirectResponse> =
        await apiClient.post<RedirectResponse>(
          `${SUBSCRIPTION_PATH}/billing-portal`,
          request
        )

      if (response.ok) {
        return {
          success: true,
          url: response.data.url,
          error: undefined,
        }
      }

      return {
        success: false,
        url: undefined,
        error: mapStatusToError(response.status),
      }
    } catch {
      return { success: false, url: undefined, error: "unknown" }
    }
  }

  return {
    cancelSubscription,
    createBillingPortal,
    getPlan,
    getPrice,
    getProduct,
    listActiveSubscriptions,
    listPlans,
    listPrices,
    listProducts,
    restoreSubscription,
    upgradeSubscription,
  }
}
