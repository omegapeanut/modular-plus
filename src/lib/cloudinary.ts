// Uploads a file straight from the browser to Cloudinary using an
// *unsigned* upload preset, so no backend/API secret is needed for the
// app itself. Create the preset once in the Cloudinary console:
//   Settings -> Upload -> Upload presets -> Add upload preset
//   Signing mode: Unsigned
// Then put its name + your cloud name in .env.local (see .env.example).
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
}

export async function uploadImage(
  file: File,
  folder = 'modular-plus',
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.',
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Cloudinary upload failed: ${detail}`)
  }

  return response.json()
}
