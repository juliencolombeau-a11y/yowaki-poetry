export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  resource_type: string
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function signUpload(params: Record<string, string | number>, apiSecret: string): Promise<string> {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  const digest = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(`${payload}${apiSecret}`),
  )
  return toHex(digest)
}

export async function uploadToCloudinary(
  body: ArrayBuffer,
  contentType: string,
  publicId: string,
  resourceType: 'image' | 'raw',
  config: { cloudName?: string, apiKey?: string, apiSecret?: string },
) {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La configuration Cloudinary serveur est incomplète.',
    })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const params = { public_id: publicId, timestamp, overwrite: 1 }
  const formData = new FormData()
  formData.append('file', new Blob([body], { type: contentType }))
  formData.append('api_key', config.apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('public_id', publicId)
  formData.append('overwrite', '1')
  formData.append('signature', await signUpload(params, config.apiSecret))

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    { method: 'POST', body: formData },
  )
  if (!response.ok) {
    throw new Error(`Téléversement Cloudinary impossible (${response.status}).`)
  }

  return await response.json() as CloudinaryUploadResponse
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw',
  config: { cloudName?: string, apiKey?: string, apiSecret?: string },
) {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'La configuration Cloudinary serveur est incomplète.',
    })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const params = { public_id: publicId, timestamp }
  const formData = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature: await signUpload(params, config.apiSecret),
  })
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    throw new Error(`Suppression Cloudinary impossible (${response.status}).`)
  }

  return await response.json() as { result: string }
}
