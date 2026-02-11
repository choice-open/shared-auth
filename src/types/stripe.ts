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

/** 阶梯定价计费方案 */
export type StripeBillingScheme = "per_unit" | "tiered"

/** 阶梯定价模式 */
export type StripeTiersMode = "graduated" | "volume"

/** 税务行为 */
export type StripeTaxBehavior = "exclusive" | "inclusive" | "unspecified"

/** 价格阶梯 */
export interface StripePriceTier {
  /** 扁平化金额 (分) */
  flat_amount: number | null
  /** 扁平化金额 (精确值) */
  flat_amount_decimal: string | null
  /** 单价 (分) */
  unit_amount: number | null
  /** 单价 (精确值，字符串表示) */
  unit_amount_decimal: string | null
  /** 阶梯上限数量，null 表示无上限 */
  up_to: number | null
}

/** 循环计费信息 */
export interface StripePriceRecurring {
  /** 计费间隔 */
  interval: StripePlanInterval
  /** 计费间隔数量 */
  interval_count: number
}

/** 数量转换 */
export interface StripePriceTransformQuantity {
  /** 除数 */
  divide_by: number
  /** 取整方式 */
  round: "down" | "up"
}

/** Stripe 价格 */
export interface StripePrice {
  /** 是否激活 */
  active: boolean
  /** 计费方案 */
  billingScheme: StripeBillingScheme
  /** 创建时间 */
  createdAt: string
  /** 货币 */
  currency: string
  /** 唯一标识符 */
  id: string
  /** 是否为生产模式 */
  livemode: boolean
  /** 查找键 */
  lookupKey: string | null
  /** 元数据 */
  metadata: Record<string, string> | null
  /** 价格别名 */
  nickname: string | null
  /** 关联的产品 (可选包含) */
  product?: StripeProduct
  /** 产品 ID */
  productId: string
  /** 循环计费信息 */
  recurring: StripePriceRecurring | null
  /** Stripe 价格 ID */
  stripeId: string
  /** Stripe 产品 ID */
  stripeProductId: string
  /** 税务行为 */
  taxBehavior: StripeTaxBehavior | null
  /** 阶梯定价列表 */
  tiers: StripePriceTier[] | null
  /** 阶梯定价模式 */
  tiersMode: StripeTiersMode | null
  /** 数量转换 */
  transformQuantity: StripePriceTransformQuantity | null
  /** 价格类型 */
  type: string
  /** 单价 (分) */
  unitAmount: number | null
  /** 单价 (精确值，字符串表示) */
  unitAmountDecimal: string | null
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

/** 计划使用类型 */
export type StripePlanUsageType = "licensed" | "metered"

/** 计划数量转换 */
export interface StripePlanTransformUsage {
  /** 除数 */
  divide_by: number
  /** 取整方式 */
  round: "down" | "up"
}

/** Stripe 计划 */
export interface StripePlan {
  /** 是否激活 */
  active: boolean
  /** 金额 (分) */
  amount: number | null
  /** 金额 (精确值，字符串表示) */
  amountDecimal: string | null
  /** 计费方案 */
  billingScheme: StripeBillingScheme | null
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
  /** 计量器 */
  meter: string | null
  /** 元数据 */
  metadata: Record<string, string> | null
  /** 计划名称 */
  name: string
  /** 计划别名 */
  nickname: string | null
  /** 关联的产品 (可选包含) */
  product?: StripeProduct
  /** 产品 ID */
  productId: string
  /** Stripe 计划 ID */
  stripeId: string
  /** Stripe 产品 ID */
  stripeProductId: string
  /** 阶梯定价列表 */
  tiers: StripePriceTier[] | null
  /** 阶梯定价模式 */
  tiersMode: StripeTiersMode | null
  /** 数量转换 */
  transformUsage: StripePlanTransformUsage | null
  /** 试用天数 */
  trialPeriodDays: number | null
  /** 使用类型 */
  usageType: StripePlanUsageType | null
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
