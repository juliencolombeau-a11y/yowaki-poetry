import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'
import { parseCommentId } from '../../../utils/feedback'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const commentId = parseCommentId(event)
  const body = await readBody<Record<string, unknown>>(event)
  if (body?.status !== 'pending' && body?.status !== 'approved') {
    throw createError({ statusCode: 422, statusMessage: 'Le statut du commentaire est invalide.' })
  }

  const [comment] = await db
    .update(schema.poemComments)
    .set({
      status: body.status,
      moderatedAt: body.status === 'approved' ? new Date() : null,
    })
    .where(eq(schema.poemComments.id, commentId))
    .returning({
      id: schema.poemComments.id,
      status: schema.poemComments.status,
      moderatedAt: schema.poemComments.moderatedAt,
    })

  if (!comment) {
    throw createError({ statusCode: 404, statusMessage: 'Commentaire introuvable.' })
  }

  return comment
})
