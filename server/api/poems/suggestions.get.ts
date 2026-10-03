import { eq, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async () => {
  const suggestions = await db
    .select({
      id: schema.poems.id,
      title: schema.poems.title,
      imageUrl: schema.media.cloudinaryUrl,
      imageFilename: schema.media.originalFilename,
    })
    .from(schema.poems)
    .innerJoin(schema.media, eq(schema.media.poemId, schema.poems.id))
    .where(eq(schema.media.kind, 'image'))
    .orderBy(sql`RANDOM()`)
    .limit(3)

  return suggestions.map((suggestion) => ({
    id: suggestion.id,
    title: suggestion.title,
    image: {
      url: suggestion.imageUrl,
      originalFilename: suggestion.imageFilename,
    },
  }))
})
