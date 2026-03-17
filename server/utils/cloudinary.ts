import { v2 as cloudinary } from 'cloudinary'
import { type H3Event } from 'h3'

let isConfigured = false

const configureCloudinary = () => {
  if (isConfigured) return
  
  const config = useRuntimeConfig()
  
  if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    console.warn('[Cloudinary] Missing configuration. Uploads will fail.')
    return
  }
  
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    secure: true
  })
  
  isConfigured = true
}

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string = 'task-manager') => {
  configureCloudinary()
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    ).end(fileBuffer)
  })
}

export const deleteFromCloudinary = async (publicId: string) => {
  configureCloudinary()
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
  })
}
