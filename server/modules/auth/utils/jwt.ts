import jwt, { type SignOptions } from 'jsonwebtoken'
import { createError } from 'h3'


export type AuthJwtPayload = {
  sub: string
  email: string
  type: 'access' | 'refresh'
}

const getJwtConfig = () => {
  const config = useRuntimeConfig()

  if (!config.jwtAccessSecret || !config.jwtRefreshSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT secrets are not configured'
    })
  }

  return config
}

export const signAccessToken = (userId: string, email: string) => {
  const config = getJwtConfig()

  return jwt.sign(
    { sub: userId, email, type: 'access' },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn as SignOptions['expiresIn'] }
  )
}

export const signRefreshToken = (userId: string, email: string) => {
  const config = getJwtConfig()

  return jwt.sign(
    { sub: userId, email, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn as SignOptions['expiresIn'] }
  )
}

export const verifyAccessToken = (token: string) => {
  const config = getJwtConfig()
  return jwt.verify(token, config.jwtAccessSecret) as AuthJwtPayload
}

export const verifyRefreshToken = (token: string) => {
  const config = getJwtConfig()
  return jwt.verify(token, config.jwtRefreshSecret) as AuthJwtPayload
}
