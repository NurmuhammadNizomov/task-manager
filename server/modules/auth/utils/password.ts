import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (candidate: string, hashed: string) => {
  return bcrypt.compare(candidate, hashed)
}
