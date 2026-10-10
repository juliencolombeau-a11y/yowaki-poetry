import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../utils/auth'
import { getFeedbackSettings } from '../../utils/feedback'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event)
  if (
    !body
    || typeof body !== 'object'
    || (body.ratingsEnabled === undefined && body.commentsEnabled === undefined)
    || (body.ratingsEnabled !== undefined && typeof body.ratingsEnabled !== 'boolean')
    || (body.commentsEnabled !== undefined && typeof body.commentsEnabled !== 'boolean')
  ) {
    throw createError({ statusCode: 422, statusMessage: 'Les réglages de contributions sont invalides.' })
  }

  const values: Partial<typeof schema.feedbackSettings.$inferInsert> = {}
  if (body.ratingsEnabled !== undefined) {
    values.ratingsEnabled = body.ratingsEnabled
  }
  if (body.commentsEnabled !== undefined) {
    values.commentsEnabled = body.commentsEnabled
  }

  const [settings] = await db
    .update(schema.feedbackSettings)
    .set(values)
    .where(eq(schema.feedbackSettings.id, 1))
    .returning()

  if (!settings) {
    throw createError({ statusCode: 500, statusMessage: 'Les réglages des contributions sont indisponibles.' })
  }

  return {
    ratingsEnabled: settings.ratingsEnabled,
    commentsEnabled: settings.commentsEnabled,
  }
})
