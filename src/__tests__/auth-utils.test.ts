/**
 * 工具函数测试
 */

import { describe, it, expect } from "vitest"
import {
  isValidEmail,
  parseAuthError,
  isTokenExpiredError,
  getNameFromEmail,
  buildAuthPath,
  AUTH_ERROR_CODES,
} from "../utils/auth-utils"

describe("isValidEmail", () => {
  it("应该验证有效的邮箱", () => {
    expect(isValidEmail("test@example.com")).toBe(true)
    expect(isValidEmail("user.name@domain.co")).toBe(true)
    expect(isValidEmail("user+tag@example.org")).toBe(true)
  })

  it("应该拒绝无效的邮箱", () => {
    expect(isValidEmail("")).toBe(false)
    expect(isValidEmail("invalid")).toBe(false)
    expect(isValidEmail("@example.com")).toBe(false)
    expect(isValidEmail("test@")).toBe(false)
    expect(isValidEmail("test@.com")).toBe(false)
    expect(isValidEmail("test @example.com")).toBe(false)
  })
})

describe("parseAuthError", () => {
  it("应该解析 JSON 格式的错误", () => {
    const error = JSON.stringify({ code: "PASSWORD_TOO_SHORT", message: "Password too short" })
    const result = parseAuthError(error)

    expect(result.code).toBe("PASSWORD_TOO_SHORT")
    expect(result.isKnownError).toBe(true)
  })

  it("应该处理包含已知错误代码的字符串", () => {
    const result = parseAuthError("Error: INVALID_EMAIL_OR_PASSWORD")

    expect(result.code).toBe("INVALID_EMAIL_OR_PASSWORD")
    expect(result.isKnownError).toBe(true)
  })

  it("应该处理未知错误", () => {
    const result = parseAuthError("Some unknown error")

    expect(result.code).toBeNull()
    expect(result.isKnownError).toBe(false)
    expect(result.message).toBe("Some unknown error")
  })

  it("应该处理 null 输入", () => {
    const result = parseAuthError(null)

    expect(result.code).toBeNull()
    expect(result.message).toBe("")
    expect(result.isKnownError).toBe(false)
  })

  it("应该识别所有已知的错误代码", () => {
    for (const code of AUTH_ERROR_CODES) {
      const error = JSON.stringify({ code, message: "test" })
      const result = parseAuthError(error)
      expect(result.code).toBe(code)
      expect(result.isKnownError).toBe(true)
    }
  })
})

describe("isTokenExpiredError", () => {
  it("应该识别 INVALID_TOKEN 错误", () => {
    expect(isTokenExpiredError(JSON.stringify({ code: "INVALID_TOKEN" }))).toBe(true)
  })

  it("应该识别 SESSION_EXPIRED 错误", () => {
    expect(isTokenExpiredError(JSON.stringify({ code: "SESSION_EXPIRED" }))).toBe(true)
  })

  it("应该识别包含 expired 的消息", () => {
    expect(isTokenExpiredError("Token has expired")).toBe(true)
  })

  it("应该拒绝非过期错误", () => {
    expect(isTokenExpiredError("Password too short")).toBe(false)
    expect(isTokenExpiredError(null)).toBe(false)
  })

  it("应该接受 ParsedAuthError 对象", () => {
    expect(isTokenExpiredError({ code: "INVALID_TOKEN", message: "", isKnownError: true })).toBe(true)
    expect(isTokenExpiredError({ code: null, message: "expired", isKnownError: false })).toBe(true)
  })
})

describe("getNameFromEmail", () => {
  it("应该从邮箱中提取名称", () => {
    expect(getNameFromEmail("john.doe@example.com")).toBe("john.doe")
    expect(getNameFromEmail("user@domain.com")).toBe("user")
    expect(getNameFromEmail("test+tag@example.org")).toBe("test+tag")
  })

  it("应该处理空字符串", () => {
    expect(getNameFromEmail("")).toBe("")
  })
})

describe("buildAuthPath", () => {
  it("应该构建带参数的路径", () => {
    const path = buildAuthPath("/sign-in", { lang: "us", email: "test@example.com" })
    expect(path).toBe("/sign-in?lang=us&email=test%40example.com")
  })

  it("应该忽略 null 和 undefined 参数", () => {
    const path = buildAuthPath("/sign-in", { lang: "us", email: null, name: undefined })
    expect(path).toBe("/sign-in?lang=us")
  })

  it("应该返回无参数的路径", () => {
    const path = buildAuthPath("/sign-in", {})
    expect(path).toBe("/sign-in")
  })
})

