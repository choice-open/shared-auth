/**
 * Stripe 类型定义
 *
 * 提供 Stripe 相关的类型定义：
 * - 订阅管理
 * - 产品和价格
 * - 计划
 * - 账单门户
 */

// ===== 基础类型 =====

/** 客户类型 */
export type StripeCustomerType = "user" | "organization"

/** 计划计费间隔 */
export type StripePlanInterval = "day" | "week" | "month" | "year"

// ===== Stripe Product =====

/** Stripe 产品 */
export interface StripeProduct {
  /** 是否激活 */
  active: boolean
  /** 创建时间 */
  createdAt: string
  /** 描述 */
  description: string | null
  /** 唯一标识符 */
  id: string
  /** 图片 URL 列表 */
  images: string[]
  /** 是否为生产模式 */
  livemode: boolean
  /** 元数据 */
  metadata: Record<string, string> | null
  /** 产品名称 */
  name: string
  /** 关联的计划列表 (可选包含) */
  plans?: StripePlan[]
  /** 关联的价格列表 (可选包含) */
  prices?: StripePrice[]
  /** Stripe 产品 ID */
  stripeId: string
  /** 更新时间 */
  updatedAt: string
}

/** 列出产品请求 */
export interface ListStripeProductsRequest {
  /** 是否激活 */
  active?: string | null
  /** 应用 ID */
  applicationId?: string | null
  /** 包含关联数据 (prices, plans) */
  include?: string | null
  /** 是否为生产模式 */
  livemode?: string | null
  /** 产品类型 */
  type?: string | null
}

// ===== Stripe Price =====

/** Stripe 价格 */
export interface StripePrice {
  /** 是否激活 */
  active: boolean
  /** 创建时间 */
  createdAt: string
  /** 货币 */
  currency: string
  /** 唯一标识符 */
  id: string
  /** 是否为生产模式 */
  livemode: boolean
  /** 元数据 */
  metadata: Record<string, string> | null
  /** 关联的产品 (可选包含) */
  product?: StripeProduct
  /** 产品 ID */
  productId: string
  /** Stripe 价格 ID */
  stripeId: string
  /** Stripe 产品 ID */
  stripeProductId: string
  /** 价格类型 */
  type: string
  /** 单价 (分) */
  unitAmount: number | null
  /** 更新时间 */
  updatedAt: string
}

/** 列出价格请求 */
export interface ListStripePricesRequest {
  /** 是否激活 */
  active?: string | null
  /** 包含关联数据 (product) */
  include?: string | null
  /** 是否为生产模式 */
  livemode?: string | null
}

// ===== Stripe Plan =====

/** Stripe 计划 */
export interface StripePlan {
  /** 是否激活 */
  active: boolean
  /** 金额 (分) */
  amount: number | null
  /** 创建时间 */
  createdAt: string
  /** 货币 */
  currency: string
  /** 唯一标识符 */
  id: string
  /** 计费间隔 */
  interval: StripePlanInterval
  /** 计费间隔数量 */
  intervalCount: number
  /** 是否为生产模式 */
  livemode: boolean
  /** 元数据 */
  metadata: Record<string, string> | null
  /** 计划名称 */
  name: string
  /** 关联的产品 (可选包含) */
  product?: StripeProduct
  /** 产品 ID */
  productId: string
  /** Stripe 计划 ID */
  stripeId: string
  /** Stripe 产品 ID */
  stripeProductId: string
  /** 试用天数 */
  trialPeriodDays: number | null
  /** 更新时间 */
  updatedAt: string
}

/** 列出计划请求 */
export interface ListStripePlansRequest {
  /** 是否激活 */
  active?: string | null
  /** 应用 ID */
  applicationId?: string | null
  /** 包含关联数据 (product) */
  include?: string | null
  /** 是否为一次性付款 */
  isOneoff?: boolean | null
  /** 是否为生产模式 */
  livemode?: string | null
}

// ===== Subscription =====

/** 活跃订阅信息 */
export interface StripeSubscription {
  /** 取消周期结束时是否取消 */
  cancelAtPeriodEnd: boolean
  /** 创建时间 */
  createdAt: string
  /** 当前计费周期结束时间 */
  currentPeriodEnd: string | null
  /** 当前计费周期开始时间 */
  currentPeriodStart: string | null
  /** 唯一标识符 */
  id: string
  /** 计划名称 */
  plan: string
  /** 引用 ID */
  referenceId: string | null
  /** 座位数 */
  seats: number | null
  /** 订阅状态 */
  status: string
  /** Stripe 客户 ID */
  stripeCustomerId: string | null
  /** Stripe 订阅 ID */
  stripeSubscriptionId: string | null
  /** 更新时间 */
  updatedAt: string
}

/** 列出活跃订阅请求 */
export interface ListActiveSubscriptionsRequest {
  /** 客户类型 */
  customerType?: StripeCustomerType | null
  /** 引用 ID */
  referenceId?: string | null
}

/** 升级订阅请求 */
export interface UpgradeSubscriptionRequest {
  /** 是否年付 */
  annual?: boolean | null
  /** 取消 URL */
  cancelUrl: string
  /** 客户类型 */
  customerType?: StripeCustomerType | null
  /** 禁用重定向 */
  disableRedirect: boolean
  /** 语言 */
  locale?: string | null
  /** 元数据 */
  metadata?: string | null
  /** 计划名称 */
  plan: string
  /** 引用 ID */
  referenceId?: string | null
  /** 返回 URL */
  returnUrl?: string | null
  /** 座位数 */
  seats?: number | null
  /** 成功 URL */
  successUrl: string
  /** 订阅 ID */
  subscriptionId?: string | null
}

/** 取消订阅请求 */
export interface CancelSubscriptionRequest {
  /** 客户类型 */
  customerType?: StripeCustomerType | null
  /** 禁用重定向 */
  disableRedirect: boolean
  /** 引用 ID */
  referenceId?: string | null
  /** 返回 URL */
  returnUrl: string
  /** 订阅 ID */
  subscriptionId?: string | null
}

/** 恢复订阅请求 */
export interface RestoreSubscriptionRequest {
  /** 客户类型 */
  customerType?: StripeCustomerType | null
  /** 引用 ID */
  referenceId?: string | null
  /** 订阅 ID */
  subscriptionId?: string | null
}

/** 创建账单门户请求 */
export interface CreateBillingPortalRequest {
  /** 客户类型 */
  customerType?: StripeCustomerType | null
  /** 禁用重定向 */
  disableRedirect: boolean
  /** 语言 */
  locale?: string | null
  /** 引用 ID */
  referenceId?: string | null
  /** 返回 URL */
  returnUrl: string
}

/** 订阅操作响应 (包含重定向 URL) */
export interface SubscriptionActionResponse {
  /** 重定向 URL */
  url?: string
}

// ===== 错误类型 =====

/** Stripe 操作错误类型 */
export type StripeErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "unknown"

// ===== 结果类型 =====

/** 基础操作结果 */
export interface StripeResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 是否成功 */
  success: boolean
}

/** 带重定向 URL 的操作结果 */
export interface StripeRedirectResult extends StripeResult {
  /** 重定向 URL */
  url: string | undefined
}

/** 列出产品结果 */
export interface ListStripeProductsResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 产品列表 */
  products: StripeProduct[]
  /** 是否成功 */
  success: boolean
}

/** 获取产品结果 */
export interface GetStripeProductResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 产品数据 */
  product: StripeProduct | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出价格结果 */
export interface ListStripePricesResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 价格列表 */
  prices: StripePrice[]
  /** 是否成功 */
  success: boolean
}

/** 获取价格结果 */
export interface GetStripePriceResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 价格数据 */
  price: StripePrice | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出计划结果 */
export interface ListStripePlansResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 计划列表 */
  plans: StripePlan[]
  /** 是否成功 */
  success: boolean
}

/** 获取计划结果 */
export interface GetStripePlanResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 计划数据 */
  plan: StripePlan | undefined
  /** 是否成功 */
  success: boolean
}

/** 列出活跃订阅结果 */
export interface ListActiveSubscriptionsResult {
  /** 错误类型 */
  error: StripeErrorType | undefined
  /** 是否成功 */
  success: boolean
  /** 订阅列表 */
  subscriptions: StripeSubscription[]
}
