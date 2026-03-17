import { z } from 'zod'

export interface SanitizeOptions {
  allowHTML?: boolean
}

const defaultOptions: SanitizeOptions = {
  allowHTML: false
}

/**
 * Sanitizes string input to prevent XSS attacks
 * Nuxt/Vue already escapes output by default, so this is mainly for data cleanup
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

  if (!options.allowHTML) {
    // Simple tag stripping if HTML is not allowed
    sanitized = sanitized.replace(/<[^>]*>?/gm, '')
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
 * Enhanced validation schemas with sanitization using Zod
 */
export const createSanitizedSchemas = () => {
  return {
    // Sanitized full name - removes HTML and special characters
    fullName: z.string()
      .transform((val) => sanitizeName(val))
      .pipe(z.string().min(2).max(120)),
    
    // Sanitized email - removes HTML and validates format
    email: z.string()
      .transform((val) => sanitizeEmail(val))
      .pipe(z.string().email()),
    
    // Password - no sanitization (hashes handle security)
    password: z.string()
      .min(8)
      .max(128),
    
    // Sanitized OTP/code
    otp: z.string()
      .transform((val) => sanitizeCode(val))
      .pipe(z.string().regex(/^\d{6}$/, 'Code must be 6 digits')),
    
    // Sanitized token
    token: z.string()
      .transform((val) => sanitizeToken(val))
      .pipe(z.string().min(1))
  }
}
