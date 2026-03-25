import mongoose from 'mongoose'
import { beforeAll, afterAll, beforeEach } from 'vitest'

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI!, { dbName: 'test' })
})

beforeEach(async () => {
  // wipe all collections between tests for isolation
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
})
