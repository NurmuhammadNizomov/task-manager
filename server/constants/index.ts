// Database Configuration Constants
export const DB_CONFIG = {
  // Connection Pool Settings
  MAX_POOL_SIZE: 10,
  MIN_POOL_SIZE: 2,
  MAX_IDLE_TIME_MS: 30000, // 30 seconds
  SERVER_SELECTION_TIMEOUT_MS: 5000, // 5 seconds
  SOCKET_TIMEOUT_MS: 45000, // 45 seconds
  CONNECT_TIMEOUT_MS: 10000, // 10 seconds
  HEARTBEAT_FREQUENCY_MS: 10000, // 10 seconds
  
  // Retry Settings
  ENABLE_RETRY_WRITES: true,
  ENABLE_RETRY_READS: true
} as const

// JWT Configuration Constants
export const JWT_CONFIG = {
  DEFAULT_ACCESS_EXPIRES_IN: '15m', // 15 minutes
  DEFAULT_REFRESH_EXPIRES_IN: '7d', // 7 days
  TOKEN_MIN_LENGTH: 32 // Minimum secret key length
} as const

// Security Configuration Constants
export const SECURITY_CONFIG = {
  // Password Requirements
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  
  // Rate Limiting
  MAX_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 10,
  
  // CSRF Protection
  CSRF_TOKEN_LENGTH: 32,
  CSRF_COOKIE_NAME: 'csrf_token'
} as const

// API Configuration Constants
export const API_CONFIG = {
  // Request Settings
  MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
  
  // Response Settings
  MAX_RESPONSE_SIZE: 10 * 1024 * 1024, // 10MB
  COMPRESSION_ENABLED: true
} as const

// Application Configuration Constants
export const APP_CONFIG = {
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_THEME: 'light',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File Upload Limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  
  // Cookie Settings
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: 'strict'
} as const

// Validation Configuration Constants
export const VALIDATION_CONFIG = {
  // User Input Limits
  MAX_FULL_NAME_LENGTH: 120,
  MIN_FULL_NAME_LENGTH: 2,
  MAX_EMAIL_LENGTH: 254,
  MAX_OTP_ATTEMPTS: 3,
  
  // Sanitization
  ALLOWED_HTML_TAGS: ['b', 'i', 'em', 'strong'],
  ALLOWED_HTML_ATTRIBUTES: {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'width', 'height']
  }
} as const

// Development Configuration Constants
export const DEV_CONFIG = {
  DEFAULT_DEV_URL: 'http://localhost:3000',
  DEFAULT_DEV_DB_NAME: 'task-manager'
} as const
