import { z } from 'zod'
import { readBody, type H3Event } from 'h3'
import { tServer, tServerField } from '../../../utils/i18n'
import { apiError } from '../../../utils/api-response'
import { createSanitizedSchemas } from '../../../utils/sanitization'

// Get sanitized schemas
const sanitizedSchemas = createSanitizedSchemas()

export const registerSchema = z.object({
  fullName: sanitizedSchemas.fullName,
  email: sanitizedSchemas.email,
  password: sanitizedSchemas.password,
  language: z.enum(['en', 'ru', 'uz']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional()
})

export const loginSchema = z.object({
  email: sanitizedSchemas.email,
  password: sanitizedSchemas.password
})

export const forgotPasswordSchema = z.object({
  email: sanitizedSchemas.email
})

export const resetPasswordSchema = z.object({
  token: sanitizedSchemas.token,
  password: sanitizedSchemas.password
})

export const verifyEmailOtpSchema = z.object({
  email: sanitizedSchemas.email,
  otp: sanitizedSchemas.otp
})

export const resetPasswordOtpSchema = z.object({
  email: sanitizedSchemas.email,
  otp: sanitizedSchemas.otp,
  password: sanitizedSchemas.password
})

export const refreshSchema = z.object({
  refreshToken: sanitizedSchemas.token.optional()
}).default({})

export const updatePreferencesSchema = z.object({
  language: z.enum(['en', 'ru', 'uz']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional()
}).refine(data => data.language || data.theme, {
  message: 'Provide at least one field to update'
})

const resolveValidationMessage = (event: H3Event, issue: Record<string, unknown>) => {
  const fieldKey = issue.path[0] || 'field'
  let messageKey = 'validation.default'

  switch (issue.code) {
    case 'invalid_type':
      if (issue.received === 'undefined') messageKey = 'validation.required'
      else messageKey = 'validation.stringBase'
      break
    case 'invalid_string':   // Zod v3
    case 'invalid_format':   // Zod v4
      if (issue.validation === 'email' || issue.format === 'email') messageKey = 'validation.stringEmail'
      break
    case 'too_small':
      messageKey = 'validation.stringMin'
      break
    case 'too_big':
      messageKey = 'validation.stringMax'
      break
    case 'invalid_enum_value':
      messageKey = 'validation.anyOnly'
      break
    case 'custom':
      if (issue.message === 'Provide at least one field to update') messageKey = 'validation.objectMissing'
      break
  }

  const limit = issue.minimum ?? issue.maximum ?? issue.min ?? issue.max ?? undefined

  return tServer(event, messageKey, {
    field: tServerField(event, fieldKey),
    limit
  })
}

export const readValidatedBody = async <T>(event: H3Event, schema: z.ZodType<T>) => {
  const body = (await readBody(event)) ?? {}
  
  try {
    return await schema.parseAsync(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const localizedMessage = (error.issues ?? error.errors)
        .map((issue) => resolveValidationMessage(event, issue))
        .join(' ')

      apiError(400, 'VALIDATION_ERROR', localizedMessage, {
        details: (error.issues ?? error.errors).map((issue) => ({
          type: issue.code,
          path: issue.path,
          message: resolveValidationMessage(event, issue)
        }))
      })
    }
    throw error
  }
}
