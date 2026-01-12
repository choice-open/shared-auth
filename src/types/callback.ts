/** 回调类型 */
export type CallbackType =
  | "signup"
  | "delete-user"
  | "reset-password"
  | "invite"
  | "confirm-change-email"
  | "verify-change-email"
  | null

/** 回调处理结果 */
export interface CallbackResult {
  /** 额外数据 */
  data?: Record<string, unknown>
  /** 错误信息 */
  error?: string
  /** 错误代码 */
  errorCode?: string
  /** 是否需要登录 */
  needsLogin?: boolean
  /** 重定向 URL */
  redirectTo?: string
  /** 是否需要显示自定义 UI（不自动重定向） */
  showCustomUI?: boolean,
  /** 是否成功 */
  success: boolean
}

/** 回调配置 */
export interface CallbackConfig {
  /** 成功后的默认跳转地址 */
  defaultRedirect?: string
  /** 删除成功页地址 */
  deleteSuccessPath?: string
  /** 语言 */
  lang?: string
  /** 链接过期页地址 */
  linkExpiredPath?: string
  /** 密码重置页地址 */
  resetPasswordPath?: string
  /** 登录页地址 */
  signInPath?: string
}