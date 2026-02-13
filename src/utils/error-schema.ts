/**
 * Error Schema Validation
 *
 * Provides utilities to parse error code and message from unknown data
 */

export interface ErrorSchema {
  code?: string
  message?: string
}

/**
 * Validates and extracts error code and message from unknown data
 *
 * @param data - Unknown data that might contain error information
 * @returns Object with code and message if found, otherwise undefined values
 */
export function parseErrorSchema(data: unknown): ErrorSchema {
  if (!data || typeof data !== "object") {
    return { code: undefined, message: undefined }
  }

  const obj = data as Record<string, unknown>

  // Check for direct code and message properties
  const code = typeof obj.code === "string" ? obj.code : undefined
  const message = typeof obj.message === "string" ? obj.message : undefined

  // Check for nested error object
  if (!code && !message && typeof obj.error === "object" && obj.error !== null) {
    const errorObj = obj.error as Record<string, unknown>
    return {
      code: typeof errorObj.code === "string" ? errorObj.code : undefined,
      message: typeof errorObj.message === "string" ? errorObj.message : undefined,
    }
  }

  return { code, message }
}

/**
 * Creates an Error with code and message appended
 *
 * @param baseMessage - Base error message
 * @param status - HTTP status code
 * @param data - Response data that might contain error code and message
 * @returns Error instance with code and message appended
 */
export function createErrorWithSchema(
  baseMessage: string,
  status: number,
  data?: unknown
): Error {
  const schema = parseErrorSchema(data)
  const parts: string[] = [baseMessage]

  if (schema.code) {
    parts.push(`code: ${schema.code}`)
  }
  if (schema.message) {
    parts.push(`message: ${schema.message}`)
  }
  parts.push(`status: ${status}`)

  const error = new Error(parts.join(", "))
  // Attach code and message as properties for programmatic access
  if (schema.code) {
    ;(error as Error & { code?: string }).code = schema.code
  }
  if (schema.message) {
    ;(error as Error & { message?: string }).message = schema.message
  }
  ;(error as Error & { status?: number }).status = status

  return error
}
