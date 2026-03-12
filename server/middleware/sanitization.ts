import { getQuery, getRouterParams, readBody } from 'h3'
import { sanitizeUrlParam, sanitizeToken } from '../utils/sanitization'

export default defineEventHandler(async (event) => {
  // Only apply to API routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  // Sanitize query parameters
  const query = getQuery(event)
  const sanitizedQuery: Record<string, string | string[]> = {}
  
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      if (key.includes('token')) {
        sanitizedQuery[key] = sanitizeToken(value)
      } else {
        sanitizedQuery[key] = sanitizeUrlParam(value)
      }
    } else if (Array.isArray(value)) {
      sanitizedQuery[key] = value.map(item => 
        typeof item === 'string' ? sanitizeUrlParam(item) : item
      )
    } else {
      sanitizedQuery[key] = value
    }
  }

  // Override the query object with sanitized version
  event.node.req.query = sanitizedQuery

  // Sanitize route parameters
  const params = getRouterParams(event)
  const sanitizedParams: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      if (key.includes('token') || key.includes('id')) {
        sanitizedParams[key] = sanitizeToken(value)
      } else {
        sanitizedParams[key] = sanitizeUrlParam(value)
      }
    } else {
      sanitizedParams[key] = value
    }
  }

  // Override the params object with sanitized version
  event.context.params = sanitizedParams
})
