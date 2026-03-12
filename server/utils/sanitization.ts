import { JSDOM } from 'jsdom'
import DOMPurify from 'dompurify'
import Joi from 'joi'

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window
const purify = DOMPurify(window)

export interface SanitizeOptions {
  allowHTML?: boolean
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
}

const defaultOptions: SanitizeOptions = {
  allowHTML: false,
  allowedTags: [],
  allowedAttributes: {}
}

/**
 * Sanitizes string input to prevent XSS attacks
 */
export const sanitizeString = (
  input: string | undefined | null,
  options: SanitizeOptions = defaultOptions
): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Trim whitespace
  let sanitized = input.trim()

  if (options.allowHTML && options.allowedTags && options.allowedTags.length > 0) {
    // Allow specific HTML tags with configured attributes
    const allowedAttrs = options.allowedAttributes ? Object.values(options.allowedAttributes).flat() : []
    sanitized = purify.sanitize(sanitized, {
      ALLOWED_TAGS: options.allowedTags,
      ALLOWED_ATTR: allowedAttrs
    })
  } else {
    // Remove all HTML tags and attributes
    sanitized = purify.sanitize(sanitized, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    })
  }

  // Additional security measures
  sanitized = sanitized
    // Remove potentially dangerous characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Control characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width characters
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length to prevent DoS
    .substring(0, 10000)

  return sanitized
}

/**
 * Sanitizes email input
 */
export const sanitizeEmail = (email: string | undefined | null): string => {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const sanitized = sanitizeString(email.toLowerCase().trim())
  
  // Additional email-specific validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitizes user name input
 */
export const sanitizeName = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }

  const sanitized = sanitizeString(name)
  
  // Allow only letters, numbers, spaces, and basic punctuation
  return sanitized.replace(/[^a-zA-Z0-9\s\-_.'']/g, '')
}

/**
 * Sanitizes password input (for logging purposes only, never store sanitized password)
 */
export const sanitizeForLogging = (input: string | undefined | null): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Return only length for logging, never the actual password
  return `[PASSWORD:${input.length}]`
}

/**
 * Sanitizes OTP/code input
 */
export const sanitizeCode = (code: string | undefined | null): string => {
  if (!code || typeof code !== 'string') {
    return ''
  }

  // Allow only alphanumeric characters
  return code.replace(/[^a-zA-Z0-9]/g, '').trim()
}

/**
 * Sanitizes token input
 */
export const sanitizeToken = (token: string | undefined | null): string => {
  if (!token || typeof token !== 'string') {
    return ''
  }

  // Allow only alphanumeric and specific special characters used in tokens
  return token.replace(/[^a-zA-Z0-9\-_\.]/g, '').trim()
}

/**
 * Sanitizes URL parameters
 */
export const sanitizeUrlParam = (param: string | undefined | null): string => {
  if (!param || typeof param !== 'string') {
    return ''
  }

  const sanitized = sanitizeString(param)
  
  // Allow only URL-safe characters
  return sanitized.replace(/[^a-zA-Z0-9\-_~\/\.]/g, '')
}

/**
 * Enhanced validation schemas with sanitization
 */
export const createSanitizedSchemas = () => {
  const baseString = Joi.string()
  
  return {
    // Sanitized full name - removes HTML and special characters
    fullName: baseString
      .custom((value: string) => sanitizeName(value))
      .min(2)
      .max(120)
      .required()
      .messages({
        'string.custom': 'Invalid characters in name'
      }),
    
    // Sanitized email - removes HTML and validates format
    email: baseString
      .custom((value: string) => sanitizeEmail(value))
      .email()
      .required()
      .messages({
        'string.custom': 'Invalid email format',
        'string.email': 'Invalid email format'
      }),
    
    // Password - no sanitization (hashes handle security)
    password: baseString
      .min(8)
      .max(128)
      .required(),
    
    // Sanitized OTP/code
    otp: baseString
      .custom((value: string) => sanitizeCode(value))
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.custom': 'Invalid code format',
        'string.pattern.base': 'Code must be 6 digits'
      }),
    
    // Sanitized token
    token: baseString
      .custom((value: string) => sanitizeToken(value))
      .required()
      .messages({
        'string.custom': 'Invalid token format'
      })
  }
}
