import { v2 as cloudinary } from 'cloudinary'

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured')
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })
  return { cloudName, apiKey, apiSecret }
}

export function createUploadSignature() {
  const { cloudName, apiKey, apiSecret } = config()
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = process.env.CLOUDINARY_FOLDER || 'marketmet'
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret)
  return { cloudName, apiKey, timestamp, folder, signature }
}

export async function uploadBuffer(buffer, { folder, resourceType = 'image' } = {}) {
  config()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || process.env.CLOUDINARY_FOLDER || 'marketmet',
        resource_type: resourceType,
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}
