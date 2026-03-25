import { describe, it, expect } from 'vitest'
import { UserModel } from '../../../server/modules/auth/models/user'

const baseUser = {
  fullName: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
  isEmailVerified: true,
  authType: 'email' as const
}

describe('UserModel — password hashing', () => {
  it('hashes password on save', async () => {
    const user = await UserModel.create(baseUser)
    expect(user.password).not.toBe('Password123!')
    expect(user.password!.startsWith('$2')).toBe(true) // bcrypt hash
  })

  it('comparePassword returns true for correct password', async () => {
    const user = await UserModel.create(baseUser)
    expect(await user.comparePassword('Password123!')).toBe(true)
  })

  it('comparePassword returns false for wrong password', async () => {
    const user = await UserModel.create(baseUser)
    expect(await user.comparePassword('WrongPassword!')).toBe(false)
  })

  it('does not rehash password when other fields are updated', async () => {
    const user = await UserModel.create(baseUser)
    const originalHash = user.password

    user.fullName = 'Updated Name'
    await user.save()

    expect(user.password).toBe(originalHash)
  })
})

describe('UserModel — validation', () => {
  it('rejects duplicate email', async () => {
    await UserModel.create(baseUser)
    await expect(UserModel.create({ ...baseUser, _id: undefined })).rejects.toThrow(/duplicate|E11000/)
  })

  it('rejects missing fullName', async () => {
    await expect(
      UserModel.create({ ...baseUser, fullName: undefined })
    ).rejects.toThrow(/fullName.*required|Path `fullName`/i)
  })

  it('stores email in lowercase', async () => {
    const user = await UserModel.create({ ...baseUser, email: 'UPPER@EXAMPLE.COM' })
    expect(user.email).toBe('upper@example.com')
  })

  it('sets default authType to email', async () => {
    const user = await UserModel.create({ ...baseUser, authType: undefined })
    expect(user.authType).toBe('email')
  })
})

describe('UserModel — google auth', () => {
  it('comparePassword returns false when no password set (google user)', async () => {
    const googleUser = await UserModel.create({
      fullName: 'Google User',
      email: 'google@example.com',
      googleId: 'google-123',
      authType: 'google',
      isEmailVerified: true
    })
    expect(await googleUser.comparePassword('anything')).toBe(false)
  })
})
