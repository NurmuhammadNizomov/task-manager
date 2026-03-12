import mongoose, { type ConnectOptions } from 'mongoose'
import { type H3Event } from 'h3'
import { tServer } from './i18n'
import { apiError } from './api-response'
import { DB_CONFIG } from '../constants'


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
    const mongoOptions: ConnectOptions = {
      dbName: config.mongodbDbName,
      maxPoolSize: DB_CONFIG.MAX_POOL_SIZE,
      minPoolSize: DB_CONFIG.MIN_POOL_SIZE,
      maxIdleTimeMS: DB_CONFIG.MAX_IDLE_TIME_MS,
      serverSelectionTimeoutMS: DB_CONFIG.SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: DB_CONFIG.SOCKET_TIMEOUT_MS,
      connectTimeoutMS: DB_CONFIG.CONNECT_TIMEOUT_MS,
      heartbeatFrequencyMS: DB_CONFIG.HEARTBEAT_FREQUENCY_MS,
      retryWrites: DB_CONFIG.ENABLE_RETRY_WRITES,
      retryReads: DB_CONFIG.ENABLE_RETRY_READS
    }
    
    cached.promise = mongoose.connect(config.mongodbUri, mongoOptions)
  }

  try {
    cached.conn = await cached.promise
    console.log(`[MongoDB] Connected to database: ${config.mongodbDbName}`)
    console.log(`[MongoDB] Connection pool configured - Max: 10, Min: 2`)
    return cached.conn
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error)
    cached.promise = null // Reset the promise to allow retry
    throw error
  }
}
