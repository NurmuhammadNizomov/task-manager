import { createError, defineEventHandler, isError, setResponseStatus, type H3Event } from 'h3'
import { tServer } from './i18n'

type ApiMeta = Record<string, unknown>

export interface ApiSuccessResponse<TData = unknown, TMeta extends ApiMeta = ApiMeta> {
  status: 'success'
  data: TData
  meta: TMeta
}

export interface ApiErrorObject {
  code: string
  message: string
  details?: unknown
}

export interface ApiErrorResponse<TMeta extends ApiMeta = ApiMeta> {
  status: 'error'
  error: ApiErrorObject
  meta: TMeta
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const getDefaultErrorCode = (statusCode: number) => {
  if (statusCode === 400) {
    return 'BAD_REQUEST'
  }

  if (statusCode === 401) {
    return 'UNAUTHORIZED'
  }

  if (statusCode === 403) {
    return 'FORBIDDEN'
  }

  if (statusCode === 404) {
    return 'NOT_FOUND'
  }

  if (statusCode === 409) {
    return 'CONFLICT'
  }

  if (statusCode === 422) {
    return 'UNPROCESSABLE_ENTITY'
  }

  if (statusCode === 429) {
    return 'TOO_MANY_REQUESTS'
  }

  return 'INTERNAL_SERVER_ERROR'
}

const normalizeErrorResponse = (event: H3Event, error: unknown): ApiErrorResponse => {
  let statusCode = 500
  let code = 'INTERNAL_SERVER_ERROR'
  let message = tServer(event, 'errors.unexpectedError')
  let details: unknown
  let meta: ApiMeta = {}

  if (isError(error)) {
    statusCode = error.statusCode || 500
    code = getDefaultErrorCode(statusCode)

    if (error.statusMessage) {
      message = error.statusMessage
    }

    if (isRecord(error.data)) {
      const data = error.data

      if (typeof data.code === 'string' && data.code.trim()) {
        code = data.code
      }

      if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message
      }

      if ('details' in data) {
        details = data.details
      }

      if (isRecord(data.meta)) {
        meta = data.meta
      }
    }
  } else if (error instanceof Error && error.message) {
    message = error.message
  }

  setResponseStatus(event, statusCode)

  return {
    status: 'error',
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {})
    },
    meta
  }
}

export const apiSuccess = <TData, TMeta extends ApiMeta = ApiMeta>(
  data: TData,
  meta = {} as TMeta
): ApiSuccessResponse<TData, TMeta> => {
  return {
    status: 'success',
    data,
    meta
  }
}

export const apiError = (
  statusCode: number,
  code: string,
  message: string,
  options?: {
    details?: unknown
    meta?: ApiMeta
  }
): never => {
  throw createError({
    statusCode,
    message,
    data: {
      code,
      message,
      ...(options?.details !== undefined ? { details: options.details } : {}),
      meta: options?.meta ?? {}
    }
  })
}

export const defineApiHandler = <TData>(
  handler: (event: H3Event) => Promise<ApiSuccessResponse<TData>> | ApiSuccessResponse<TData>
) => {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    } catch (error) {
      return normalizeErrorResponse(event, error)
    }
  })
}
