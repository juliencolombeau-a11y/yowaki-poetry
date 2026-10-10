import { and, lt, or, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { enforceSubmissionProtections, getEnabledFeedback, getVisitorTokenHash, parsePoemId } from '../../../utils/feedback'

export default defineEventHandler(async (event) => {
  const poemId = parsePoemId(event)
  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 422, statusMessage: 'Données de commentaire invalides.' })
  }
  const pseudonym = typeof body?.pseudonym === 'string' ? body.pseudonym.trim() : ''
  const content = typeof body?.content === 'string' ? body.content.trim() : ''

  if (pseudonym.length < 1 || pseudonym.length > 50 || content.length < 1 || content.length > 500) {
    throw createError({ statusCode: 422, statusMessage: 'Le pseudonyme (1 à 50 caractères) et le commentaire (1 à 500 caractères) sont obligatoires.' })
  }
  await enforceSubmissionProtections(event, body)
  if (!await getEnabledFeedback(poemId, 'comments')) {
    throw createError({ statusCode: 403, statusMessage: 'Les commentaires sont désactivés pour cette ressource.' })
  }

  const voterTokenHash = await getVisitorTokenHash(event)
  const now = Math.floor(Date.now() / 1000)
  const dayStart = Math.floor(now / 86400) * 86400
  const limit = schema.feedbackCommentLimits
  await db.delete(limit).where(lt(limit.lastCommentAt, now - 86400))
  const [rateLimit] = await db
    .insert(limit)
    .values({
      voterTokenHash,
      lastCommentAt: now,
      dailyStart: dayStart,
      dailyCount: 1,
    })
    .onConflictDoUpdate({
      target: limit.voterTokenHash,
      set: {
        lastCommentAt: now,
        dailyStart: sql`case when ${limit.dailyStart} < ${dayStart} then ${dayStart} else ${limit.dailyStart} end`,
        dailyCount: sql`case when ${limit.dailyStart} < ${dayStart} then 1 else ${limit.dailyCount} + 1 end`,
      },
      setWhere: and(
        lt(limit.lastCommentAt, now - 60),
        or(lt(limit.dailyStart, dayStart), lt(limit.dailyCount, 5)),
      ),
    })
    .returning({ voterTokenHash: limit.voterTokenHash })

  if (!rateLimit) {
    throw createError({ statusCode: 429, statusMessage: 'Vous avez récemment envoyé un commentaire. Réessayez plus tard.' })
  }

  const [comment] = await db
    .insert(schema.poemComments)
    .values({
      poemId,
      pseudonym,
      content,
      status: 'pending',
      createdAt: new Date(),
    })
    .returning({ id: schema.poemComments.id, createdAt: schema.poemComments.createdAt })

  if (!comment) {
    throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer le commentaire.' })
  }

  setResponseStatus(event, 201)
  return { id: comment.id, status: 'pending', createdAt: comment.createdAt }
})
