import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de poème invalide.' })
  }

  const poem = await db
    .select()
    .from(schema.poems)
    .where(eq(schema.poems.id, id))
    .limit(1)

  if (!poem[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Poème introuvable.' })
  }

  const [languages, media] = await Promise.all([
    db
      .select({ name: schema.languages.name })
      .from(schema.poemLanguages)
      .innerJoin(schema.languages, eq(schema.languages.id, schema.poemLanguages.languageId))
      .where(eq(schema.poemLanguages.poemId, id)),
    db
      .select({
        id: schema.media.id,
        kind: schema.media.kind,
        url: schema.media.cloudinaryUrl,
        mimeType: schema.media.mimeType,
        originalFilename: schema.media.originalFilename,
      })
      .from(schema.media)
      .where(eq(schema.media.poemId, id)),
  ])

  return {
    ...poem[0],
    languages: languages.map((item) => item.name),
    media,
  }
})
