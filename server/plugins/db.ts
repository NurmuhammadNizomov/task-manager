import { connectDB } from '../utils/db'
import { UserModel } from '../modules/auth/models/User'
import { AuthTokenModel } from '../modules/auth/models/AuthToken'
import { AuthSessionModel } from '../modules/auth/models/AuthSession'

export default defineNitroPlugin(async () => {
  try {
    await connectDB()
    // Ensure all model indexes are created at startup
    // so first request doesn't hang waiting for index creation
    await Promise.all([
      UserModel.ensureIndexes(),
      AuthTokenModel.ensureIndexes(),
      AuthSessionModel.ensureIndexes()
    ])
    console.log('[DB] All model indexes ensured.')
  } catch (err) {
    console.error('[DB] Startup index init failed:', err)
  }
})
