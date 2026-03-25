import { describe, it, expect } from 'vitest'
import { apiSuccess, apiError } from '../../../server/utils/api-response'

describe('apiSuccess', () => {
  it('wraps data in success envelope', () => {
    const result = apiSuccess({ id: '1', name: 'Test' })
    expect(result.status).toBe('success')
    expect(result.data).toEqual({ id: '1', name: 'Test' })
    expect(result.meta).toEqual({})
  })

  it('includes meta when provided', () => {
    const result = apiSuccess([1, 2, 3], { total: 3 })
    expect(result.meta).toEqual({ total: 3 })
  })

  it('works with null data', () => {
    const result = apiSuccess(null)
    expect(result.data).toBeNull()
  })
})

describe('apiError', () => {
  it('throws an H3 error', () => {
    expect(() => apiError(404, 'NOT_FOUND', 'Resource not found.')).toThrow()
  })

  it('thrown error carries statusCode', () => {
    try {
      apiError(403, 'FORBIDDEN', 'Access denied.')
    } catch (err: unknown) {
      expect((err as { statusCode: number }).statusCode).toBe(403)
    }
  })

  it('thrown error carries code and message in data', () => {
    try {
      apiError(400, 'VALIDATION_ERROR', 'Invalid input.', { details: ['field is required'] })
    } catch (err: unknown) {
      const e = err as { data: { code: string; message: string; details: unknown } }
      expect(e.data.code).toBe('VALIDATION_ERROR')
      expect(e.data.message).toBe('Invalid input.')
      expect(e.data.details).toEqual(['field is required'])
    }
  })

  it('never returns (return type is never)', () => {
    let reached = false
    try {
      apiError(500, 'SERVER_ERROR', 'Oops.')
      reached = true
    } catch {
      // expected
    }
    expect(reached).toBe(false)
  })
})
