import { v2 as cloudinary } from 'cloudinary'

const configureCloudinary = () => {
  const config = useRuntimeConfig()
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName as string,
    api_key: config.cloudinaryApiKey as string,
    api_secret: config.cloudinaryApiSecret as string,
    secure: true
  })
}

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string = 'task-manager') => {
  configureCloudinary()

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
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
