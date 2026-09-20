import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../../utils/auth'
import { deleteFromCloudinary } from '../../../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const poemId = Number(getRouterParam(event, 'id'))
  const kind = getQuery(event).kind
  if (!Number.isInteger(poemId) || poemId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de poème invalide.' })
  }
  if (kind !== 'image' && kind !== 'pdf') {
    throw createError({ statusCode: 422, statusMessage: 'Le type de média est invalide.' })
  }

  const [media] = await db
    .select()
    .from(schema.media)
    .where(and(eq(schema.media.poemId, poemId), eq(schema.media.kind, kind)))
    .limit(1)

  if (!media) {
    throw createError({ statusCode: 404, statusMessage: 'Média introuvable.' })
  }

  if (media.cloudinaryPublicId) {
    const config = useRuntimeConfig(event)
    try {
      await deleteFromCloudinary(
        media.cloudinaryPublicId,
        kind === 'image' ? 'image' : 'raw',
        {
          cloudName: config.public.cloudinaryCloudName,
          apiKey: config.cloudinaryApiKey,
          apiSecret: config.cloudinaryApiSecret,
        },
      )
    } catch (error) {
      throw createError({
        statusCode: 502,
        statusMessage: error instanceof Error ? error.message : 'Suppression Cloudinary impossible.',
      })
    }
  }

  await db.delete(schema.media).where(eq(schema.media.id, media.id))
  return { success: true }
})
