import { connectDB } from '../utils/db'
import { UserModel } from '../modules/auth/models/user'
import { AuthTokenModel } from '../modules/auth/models/auth-token'
import { AuthSessionModel } from '../modules/auth/models/auth-session'
import { ProjectModel } from '../modules/projects/models/project'
import { TaskModel } from '../modules/tasks/models/task'

export default defineNitroPlugin(async () => {
  try {
    await connectDB()
    // Ensure all model indexes are created at startup
    // so first request doesn't hang waiting for index creation
    await Promise.all([
      UserModel.ensureIndexes(),
      AuthTokenModel.ensureIndexes(),
      AuthSessionModel.ensureIndexes(),
      ProjectModel.ensureIndexes(),
      TaskModel.ensureIndexes()
    ])
    console.log('[DB] All model indexes ensured.')
  } catch (err) {
    console.error('[DB] Startup index init failed:', err)
  }
})
