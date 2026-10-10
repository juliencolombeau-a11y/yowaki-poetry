import { and, avg, count, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { getFeedbackSettings, getPoem, getVisitorTokenHash, parsePoemId } from '../../../utils/feedback'

export default defineEventHandler(async (event) => {
  const poemId = parsePoemId(event)
  const [poem, settings, tokenHash] = await Promise.all([
    getPoem(poemId),
    getFeedbackSettings(),
    getVisitorTokenHash(event),
  ])
  const ratingsEnabled = poem.ratingsEnabled && settings.ratingsEnabled
  const commentsEnabled = poem.commentsEnabled && settings.commentsEnabled

  const [ratingRows, ownRatingRows, commentRows, commentCountRows] = await Promise.all([
    db
      .select({ average: avg(schema.poemRatings.value), total: count() })
      .from(schema.poemRatings)
      .where(eq(schema.poemRatings.poemId, poemId)),
    db
      .select({ value: schema.poemRatings.value })
      .from(schema.poemRatings)
      .where(and(
        eq(schema.poemRatings.poemId, poemId),
        eq(schema.poemRatings.voterTokenHash, tokenHash),
      ))
      .limit(1),
    db
      .select({
        id: schema.poemComments.id,
        pseudonym: schema.poemComments.pseudonym,
        content: schema.poemComments.content,
        createdAt: schema.poemComments.createdAt,
      })
      .from(schema.poemComments)
      .where(and(
        eq(schema.poemComments.poemId, poemId),
        eq(schema.poemComments.status, 'approved'),
      ))
      .orderBy(desc(schema.poemComments.createdAt), desc(schema.poemComments.id))
      .limit(50),
    db
      .select({ total: count() })
      .from(schema.poemComments)
      .where(and(
        eq(schema.poemComments.poemId, poemId),
        eq(schema.poemComments.status, 'approved'),
      )),
  ])

  const ratingCount = ratingRows[0]?.total ?? 0
  const average = Number(ratingRows[0]?.average ?? 0)
  const ratingPois = Array.from({ length: 5 }, (_, index) => Math.min(1, Math.max(0, average - index)))

  return {
    ratings: {
      enabled: ratingsEnabled,
      count: ratingCount,
      pois: ratingPois,
      ownValue: ownRatingRows[0]?.value ?? null,
    },
    comments: {
      enabled: commentsEnabled,
      data: commentRows,
      total: commentCountRows[0]?.total ?? 0,
      pageSize: 50,
    },
  }
})
