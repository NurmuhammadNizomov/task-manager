import { getMethod, getRequestURL } from 'h3'
import { apiError, defineApiHandler } from '../utils/api-response'
import { tServer } from '../utils/i18n'

export default defineApiHandler(async (event) => {
  apiError(404, 'API_ENDPOINT_NOT_FOUND', tServer(event, 'errors.endpointNotFound'), {
    meta: {
      method: getMethod(event),
      path: getRequestURL(event).pathname
    }
  })
})
