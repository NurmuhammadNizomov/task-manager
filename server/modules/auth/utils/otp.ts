import crypto from 'node:crypto'

export const createOtpCode = () => {
  return crypto.randomInt(100000, 1000000).toString()
}

export const hashOtpCode = (code: string) => {
  return crypto.createHash('sha256').update(code).digest('hex')
}

