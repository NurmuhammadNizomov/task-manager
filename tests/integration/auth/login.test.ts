import { describe, it, expect, vi } from 'vitest'
import { UserModel } from '../../../server/modules/auth/models/user'

// Minimal fake H3 event for tServer (locale resolution)
const fakeEvent = {
  node: { req: { headers: {} } }
} as never

// Stub side-effects that require full Nitro environment
vi.mock('../../../server/modules/auth/utils/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../../../server/utils/db', () => ({
  connectDB: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../../../server/modules/auth/services/auth-service', () => ({
  AuthService: {
    createSession: vi.fn().mockResolvedValue(undefined)
  }
}))

// Stub Nitro globals used by tServer / useRuntimeConfig
vi.stubGlobal('useRuntimeConfig', () => ({}))

const baseUser = {
  fullName: 'Test User',
  email: 'login@example.com',
  password: 'Password123!',
  isEmailVerified: true,
  authType: 'email' as const
}

describe('Login — UserModel layer', () => {
  it('user lookup by email works after create', async () => {
    await UserModel.create(baseUser)
    const found = await UserModel.findOne({ email: 'login@example.com' })
    expect(found).not.toBeNull()
    expect(found!.email).toBe('login@example.com')
  })

  it('comparePassword returns true for correct password', async () => {
    const user = await UserModel.create(baseUser)
    expect(await user.comparePassword('Password123!')).toBe(true)
  })

  it('comparePassword returns false for wrong password', async () => {
    const user = await UserModel.create(baseUser)
    expect(await user.comparePassword('WrongPassword!')).toBe(false)
  })

  it('unverified user has isEmailVerified = false', async () => {
    const user = await UserModel.create({ ...baseUser, email: 'unverified@example.com', isEmailVerified: false })
    expect(user.isEmailVerified).toBe(false)
  })

  it('google-only user has no password', async () => {
    const googleUser = await UserModel.create({
      fullName: 'Google User',
      email: 'guser@example.com',
      googleId: 'gid-123',
      authType: 'google',
      isEmailVerified: true
    })
    expect(googleUser.password).toBeUndefined()
    expect(await googleUser.comparePassword('anything')).toBe(false)
  })
})

describe('Login — tServer error messages', () => {
  it('returns English invalidCredentials message', async () => {
    const { tServer } = await import('../../../server/utils/i18n')
    const msg = tServer(fakeEvent, 'errors.invalidCredentials')
    expect(msg).toBe('Invalid email or password.')
  })

  it('returns English emailNotVerified message', async () => {
    const { tServer } = await import('../../../server/utils/i18n')
    const msg = tServer(fakeEvent, 'errors.emailNotVerified')
    expect(msg).toBe('Please verify your email first.')
  })

  it('returns Russian invalidCredentials for ru locale', async () => {
    const { tServer } = await import('../../../server/utils/i18n')
    const ruEvent = { node: { req: { headers: { 'accept-language': 'ru' } } } } as never
    const en = tServer(fakeEvent, 'errors.invalidCredentials')
    const ru = tServer(ruEvent, 'errors.invalidCredentials')
    expect(ru).not.toBe(en)
  })
})
