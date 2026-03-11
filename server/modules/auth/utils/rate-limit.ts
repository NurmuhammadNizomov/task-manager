import { RateLimiterMemory } from 'rate-limiter-flexible'
import { createError, getRequestIP, type H3Event } from 'h3'

const limiters = {
  register: new RateLimiterMemory({ points: 5, duration: 60 }),
  login: new RateLimiterMemory({ points: 10, duration: 60 }),
  forgotPassword: new RateLimiterMemory({ points: 5, duration: 60 }),
  refresh: new RateLimiterMemory({ points: 20, duration: 60 })
}

export type LimiterKey = keyof typeof limiters

export const enforceRateLimit = async (event: H3Event, key: LimiterKey) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown-ip'

  try {
    await limiters[key].consume(ip)
  } catch {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.'
    })
  }
}
