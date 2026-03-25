import { describe, it, expect } from 'vitest'
import { tServer, tServerField } from '../../../server/utils/i18n'
import type { H3Event } from 'h3'

function makeEvent(headers: Record<string, string> = {}): H3Event {
  return {
    node: { req: { headers } }
  } as unknown as H3Event
}

describe('tServer — locale resolution', () => {
  it('returns English by default', () => {
    expect(tServer(undefined, 'errors.userNotFound')).toBe('User not found.')
  })

  it('resolves Russian via accept-language header', () => {
    const event = makeEvent({ 'accept-language': 'ru-RU,ru;q=0.9' })
    const result = tServer(event, 'errors.userNotFound')
    expect(result).not.toBe('User not found.')
    expect(result.length).toBeGreaterThan(0)
  })

  it('prefers x-locale header over accept-language', () => {
    const event = makeEvent({ 'x-locale': 'uz', 'accept-language': 'en-US' })
    const en = tServer(undefined, 'errors.unexpectedError')
    const uz = tServer(event, 'errors.unexpectedError')
    expect(uz).not.toBe(en)
  })

  it('falls back to English for unknown locale', () => {
    const event = makeEvent({ 'accept-language': 'ja-JP' })
    expect(tServer(event, 'errors.userNotFound')).toBe('User not found.')
  })

  it('returns the key itself when key does not exist', () => {
    expect(tServer(undefined, 'errors.keyThatDoesNotExist')).toBe('errors.keyThatDoesNotExist')
  })
})

describe('tServer — interpolation', () => {
  it('replaces {field} placeholder', () => {
    expect(tServer(undefined, 'validation.required', { field: 'Email' })).toBe('Email is required.')
  })

  it('replaces {limit} with a number', () => {
    expect(tServer(undefined, 'validation.stringMin', { field: 'Password', limit: 8 })).toBe(
      'Password must be at least 8 characters.'
    )
  })

  it('leaves unreplaced placeholders when param is missing', () => {
    expect(tServer(undefined, 'validation.required', {})).toContain('{field}')
  })
})

describe('tServerField', () => {
  it('translates known field key', () => {
    expect(tServerField(undefined, 'email')).toBe('Email')
  })

  it('returns raw key for unknown field', () => {
    expect(tServerField(undefined, 'unknownXyz')).toBe('unknownXyz')
  })
})
   