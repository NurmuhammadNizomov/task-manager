import jwt, { type SignOptions } from 'jsonwebtoken'
import { type H3Event } from 'h3'
import { tServer } from '../../../utils/i18n'
import { apiError } from '../../../utils/api-response'


export type AuthJwtPayload = {
  sub: string
  email: string
  type: 'access' | 'refresh'
}

const getJwtConfig = (event?: H3Event) => {
  const config = useRuntimeConfig()

  if (!config.jwtAccessSecret || !config.jwtRefreshSecret) {
    apiError(500, 'CONFIG_JWT_SECRETS_MISSING', tServer(event, 'errors.jwtSecretsNotConfigured'))
  }

  return config
}

export const signAccessToken = (userId: string, email: string, event?: H3Event) => {
  const config = getJwtConfig(event)

  return jwt.sign(
    { sub: userId, email, type: 'access' },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn as SignOptions['expiresIn'] }
  )
}

export const signRefreshToken = (userId: string, email: string, event?: H3Event) => {
  const config = getJwtConfig(event)

  return jwt.sign(
    { sub: userId, email, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn as SignOptions['expiresIn'] }
  )
}

export const verifyAccessToken = (token: string, event?: H3Event) => {
  const config = getJwtConfig(event)
  return jwt.verify(token, config.jwtAccessSecret) as AuthJwtPayload
}

export const verifyRefreshToken = (token: string, event?: H3Event) => {
  const config = getJwtConfig(event)
  return jwt.verify(token, config.jwtRefreshSecret) as AuthJwtPayload
}
