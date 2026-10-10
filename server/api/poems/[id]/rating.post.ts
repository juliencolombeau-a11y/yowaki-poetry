import { db, schema } from 'hub:db'
import { enforceSubmissionProtections, getEnabledFeedback, getVisitorTokenHash, parsePoemId } from '../../../utils/feedback'

export default defineEventHandler(async (event) => {
  const poemId = parsePoemId(event)
  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object' || !Number.isInteger(body.value) || Number(body.value) < 1 || Number(body.value) > 5) {
    throw createError({ statusCode: 422, statusMessage: 'La note doit être comprise entre 1 et 5.' })
  }
  await enforceSubmissionProtections(event, body)
  if (!await getEnabledFeedback(poemId, 'ratings')) {
    throw createError({ statusCode: 403, statusMessage: 'Les notes sont désactivées pour cette ressource.' })
  }

  const voterTokenHash = await getVisitorTokenHash(event)
  const now = new Date()
  await db
    .insert(schema.poemRatings)
    .values({ poemId, voterTokenHash, value: Number(body.value), createdAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [schema.poemRatings.poemId, schema.poemRatings.voterTokenHash],
      set: { value: Number(body.value), updatedAt: now },
    })

  return { success: true }
})
