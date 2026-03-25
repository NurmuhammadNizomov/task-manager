import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeName,
  sanitizeCode,
  sanitizeToken
} from '../../../server/utils/sanitization'

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('strips HTML tags but keeps inner text', () => {
    // tag stripped, inner text "alert(1)" remains
    expect(sanitizeString('<script>alert(1)</script>hello')).toBe('alert(1)hello')
  })

  it('removes control characters (no space added)', () => {
    // \x00 removed, words merge
    expect(sanitizeString('hello\x00world')).toBe('helloworld')
  })

  it('collapses multiple spaces', () => {
    expect(sanitizeString('hello   world')).toBe('hello world')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
  })

  it('allows HTML when option is set', () => {
    const result = sanitizeString('<b>bold</b>', { allowHTML: true })
    expect(result).toContain('<b>')
  })
})

describe('sanitizeEmail', () => {
  it('lowercases the email', () => {
    expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com')
  })

  it('trims whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('returns empty string for invalid email format', () => {
    expect(sanitizeEmail('not-an-email')).toBe('')
    expect(sanitizeEmail('@nodomain')).toBe('')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeEmail(null)).toBe('')
    expect(sanitizeEmail(undefined)).toBe('')
  })

  it('accepts valid email', () => {
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com')
  })
})

describe('sanitizeName', () => {
  it('strips HTML tags including their content', () => {
    // <Doe> tag and its content are stripped by sanitizeString first
    expect(sanitizeName('John <Doe>').trim()).toBe('John')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeName(null)).toBe('')
  })

  it('keeps allowed characters intact', () => {
    expect(sanitizeName("O'Brien")).toContain("O'Brien")
  })
})

describe('sanitizeCode', () => {
  it('removes non-alphanumeric characters', () => {
    expect(sanitizeCode('12 34-56')).toBe('123456')
  })

  it('returns 6-digit code unchanged', () => {
    expect(sanitizeCode('123456')).toBe('123456')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeCode(null)).toBe('')
  })
})

describe('sanitizeToken', () => {
  it('allows alphanumeric and - _ .', () => {
    expect(sanitizeToken('abc-123_def.xyz')).toBe('abc-123_def.xyz')
  })

  it('removes disallowed characters', () => {
    expect(sanitizeToken('token<>!@#')).toBe('token')
  })

  it('returns empty string for null/undefined', () => {
    expect(sanitizeToken(null)).toBe('')
  })
})
