import mongoose from 'mongoose'
import { type H3Event } from 'h3'
import { tServer } from './i18n'
import { apiError } from './api-response'


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

export const connectDB = async (event?: H3Event) => {
  if (cached.conn) {
    return cached.conn
  }

  const config = useRuntimeConfig()

  if (!config.mongodbUri) {
    apiError(500, 'CONFIG_MONGODB_URI_MISSING', tServer(event, 'errors.mongodbUriNotConfigured'))
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongodbUri, {
      dbName: config.mongodbDbName
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
