import Joi, { type ObjectSchema } from 'joi'
import { createError, readBody, type H3Event } from 'h3'

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

export const readValidatedBody = async <T>(event: H3Event, schema: ObjectSchema) => {
  const body = (await readBody(event)) ?? {}
  const { value, error } = schema.validate(body, {
    abortEarly: false,
    stripUnknown: true
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.details.map((d) => d.message).join(', ')
    })
  }

  return value as T
}
