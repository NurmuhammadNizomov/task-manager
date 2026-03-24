import mongoose, { type Model, type Schema, type Document } from 'mongoose'

export function getModel<T extends Document>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema)
}
