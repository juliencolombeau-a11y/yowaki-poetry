import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../../utils/auth'
import { uploadToCloudinary } from '../../../../utils/cloudinary'

const maxFileSize = 10 * 1024 * 1024

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de poème invalide.' })
  }

  const poem = await db
    .select({ id: schema.poems.id })
    .from(schema.poems)
    .where(eq(schema.poems.id, id))
    .limit(1)
  if (!poem[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Poème introuvable.' })
  }

  const parts = await readMultipartFormData(event)
  const kindPart = parts?.find((part) => part.name === 'kind')
  const file = parts?.find((part) => part.name === 'file')
  const kind = kindPart?.data ? new TextDecoder().decode(kindPart.data) : ''

  if (kind !== 'image' && kind !== 'pdf') {
    throw createError({ statusCode: 422, statusMessage: 'Le type de média est invalide.' })
  }
  if (!file?.data || !file.type || !file.filename) {
    throw createError({ statusCode: 422, statusMessage: 'Un fichier est requis.' })
  }
  if (file.data.byteLength > maxFileSize) {
    throw createError({ statusCode: 422, statusMessage: 'Le fichier ne doit pas dépasser 10 Mo.' })
  }
  if (kind === 'image' && !file.type.startsWith('image/')) {
    throw createError({ statusCode: 422, statusMessage: 'Un fichier image est requis.' })
  }
  if (kind === 'pdf' && file.type !== 'application/pdf') {
    throw createError({ statusCode: 422, statusMessage: 'Un fichier PDF est requis.' })
  }

  const config = useRuntimeConfig(event)
  const publicId = `poetry/poem-${id}-${kind}`
  let uploaded: Awaited<ReturnType<typeof uploadToCloudinary>>
  try {
    uploaded = await uploadToCloudinary(
      new Uint8Array(file.data).slice().buffer,
      file.type,
      publicId,
      kind === 'image' ? 'image' : 'raw',
      {
        cloudName: config.public.cloudinaryCloudName,
        apiKey: config.cloudinaryApiKey,
        apiSecret: config.cloudinaryApiSecret,
      },
    )
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 502,
      statusMessage: error instanceof Error ? error.message : 'Téléversement impossible.',
    })
  }

  const now = new Date()
  const [media] = await db
    .insert(schema.media)
    .values({
      poemId: id,
      kind,
      cloudinaryPublicId: uploaded.public_id,
      cloudinaryUrl: uploaded.secure_url,
      mimeType: file.type,
      originalFilename: file.filename,
      sizeBytes: file.data.byteLength,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [schema.media.poemId, schema.media.kind],
      set: {
        cloudinaryPublicId: uploaded.public_id,
        cloudinaryUrl: uploaded.secure_url,
        mimeType: file.type,
        originalFilename: file.filename,
        sizeBytes: file.data.byteLength,
        updatedAt: now,
      },
    })
    .returning()

  return media
})
