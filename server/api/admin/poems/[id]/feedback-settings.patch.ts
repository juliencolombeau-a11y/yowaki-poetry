import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../../utils/auth'
import { parsePoemId } from '../../../../utils/feedback'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const poemId = parsePoemId(event)
  const body = await readBody<Record<string, unknown>>(event)
  if (
    !body
    || typeof body !== 'object'
    || (body.ratingsEnabled === undefined && body.commentsEnabled === undefined)
    || (body.ratingsEnabled !== undefined && typeof body.ratingsEnabled !== 'boolean')
    || (body.commentsEnabled !== undefined && typeof body.commentsEnabled !== 'boolean')
  ) {
    throw createError({ statusCode: 422, statusMessage: 'Les réglages de la ressource sont invalides.' })
  }

  const values: Partial<typeof schema.poems.$inferInsert> = { updatedAt: new Date() }
  if (body.ratingsEnabled !== undefined) {
    values.ratingsEnabled = body.ratingsEnabled
  }
  if (body.commentsEnabled !== undefined) {
    values.commentsEnabled = body.commentsEnabled
  }

  const [poem] = await db
    .update(schema.poems)
    .set(values)
    .where(eq(schema.poems.id, poemId))
    .returning({
      id: schema.poems.id,
      ratingsEnabled: schema.poems.ratingsEnabled,
      commentsEnabled: schema.poems.commentsEnabled,
    })

  if (!poem) {
    throw createError({ statusCode: 404, statusMessage: 'Ressource introuvable.' })
  }

  return poem
})
