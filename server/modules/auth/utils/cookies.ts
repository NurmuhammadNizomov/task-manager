import { setCookie, deleteCookie, type H3Event } from 'h3'

export const setRefreshTokenCookie = (event: H3Event, token: string) => {
  setCookie(event, 'refresh_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export const setAccessTokenCookie = (event: H3Event, token: string) => {
  setCookie(event, 'access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15 // 15 minutes
  })
}

export const clearAuthCookies = (event: H3Event) => {
  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })
}
