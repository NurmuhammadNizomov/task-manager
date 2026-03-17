import type { AuthJwtPayload } from '../modules/auth/utils/jwt'

declare module 'h3' {
  interface H3EventContext {
    auth?: {
      userId: string
      email: string
      payload: AuthJwtPayload
    }
  }
}

export {}
