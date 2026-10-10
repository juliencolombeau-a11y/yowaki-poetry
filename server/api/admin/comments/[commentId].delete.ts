import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'
import { parseCommentId } from '../../../utils/feedback'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const commentId = parseCommentId(event)
  const [comment] = await db
    .delete(schema.poemComments)
    .where(eq(schema.poemComments.id, commentId))
    .returning({ id: schema.poemComments.id })

  if (!comment) {
    throw createError({ statusCode: 404, statusMessage: 'Commentaire introuvable.' })
  }

  return { success: true }
})
