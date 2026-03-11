import mongoose from 'mongoose'
import { createError } from 'h3'


type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache
}

const cached = globalForMongoose._mongooseCache || {
  conn: null,
  promise: null
}

globalForMongoose._mongooseCache = cached

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn
  }

  const config = useRuntimeConfig()

  if (!config.mongodbUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI is not configured'
    })
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongodbUri, {
      dbName: config.mongodbDbName
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
