import Joi, { type ObjectSchema, type ValidationErrorItem } from 'joi'
import { readBody, type H3Event } from 'h3'
import { tServer, tServerField } from '../../../utils/i18n'
import { apiError } from '../../../utils/api-response'

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
  language: Joi.string().valid('en', 'ru', 'uz').optional(),
  theme: Joi.string().valid('light', 'dark', 'system').optional()
})

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required()
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
})

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required()
})

export const verifyEmailOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().trim().pattern(/^\d{6}$/).required()
})

export const resetPasswordOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().trim().pattern(/^\d{6}$/).required(),
  password: Joi.string().min(8).max(128).required()
})

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().optional()
}).default({})

export const updatePreferencesSchema = Joi.object({
  language: Joi.string().valid('en', 'ru', 'uz').optional(),
  theme: Joi.string().valid('light', 'dark', 'system').optional()
})
  .or('language', 'theme')
  .required()

const validationMessageKeyByType: Record<string, string> = {
  'any.required': 'validation.required',
  'string.empty': 'validation.required',
  'string.base': 'validation.stringBase',
  'string.email': 'validation.stringEmail',
  'string.min': 'validation.stringMin',
  'string.max': 'validation.stringMax',
  'string.pattern.base': 'validation.stringPatternBase',
  'any.only': 'validation.anyOnly',
  'object.missing': 'validation.objectMissing'
}

const resolveValidationMessage = (event: H3Event, detail: ValidationErrorItem) => {
  const fieldKey =
    detail.path.find((segment): segment is string => typeof segment === 'string') ??
    detail.context?.key ??
    'field'

  const messageKey = validationMessageKeyByType[detail.type] ?? 'validation.default'
  const limit = typeof detail.context?.limit === 'number' ? detail.context.limit : undefined

  return tServer(event, messageKey, {
    field: tServerField(event, fieldKey),
    limit
  })
}

export const readValidatedBody = async <T>(event: H3Event, schema: ObjectSchema) => {
  const body = (await readBody(event)) ?? {}
  const { value, error } = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  })

  if (error) {
    const localizedMessage =
      error.details.length > 0
        ? error.details.map((detail) => resolveValidationMessage(event, detail)).join(' ')
        : tServer(event, 'validation.invalidBody')

    apiError(400, 'VALIDATION_ERROR', localizedMessage, {
      details: error.details.map((detail) => ({
        type: detail.type,
        path: detail.path,
        message: resolveValidationMessage(event, detail)
      }))
    })
  }

  return value as T
}
