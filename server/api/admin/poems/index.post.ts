import { desc } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'
import { normalizePoemLanguages, replacePoemLanguages } from '../../../utils/poem-languages'

function nullableText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value !== 'string') {
    throw createError({ statusCode: 422, statusMessage: 'Une métadonnée textuelle est invalide.' })
  }
  return value.trim() || null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Le titre est obligatoire.' })
  }
  if (typeof body.body !== 'string' || !body.body.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'Le texte du poème est obligatoire.' })
  }
  if (body.isCalligram !== undefined && typeof body.isCalligram !== 'boolean') {
    throw createError({ statusCode: 422, statusMessage: 'Le champ calligramme est invalide.' })
  }

  const languages = body.languages === undefined ? undefined : normalizePoemLanguages(body.languages)

  const [lastPoem] = await db
    .select({ documentOrder: schema.poems.documentOrder })
    .from(schema.poems)
    .orderBy(desc(schema.poems.documentOrder))
    .limit(1)

  const now = new Date()
  const [poem] = await db
    .insert(schema.poems)
    .values({
      documentOrder: (lastPoem?.documentOrder ?? 0) + 1,
      title: body.title.trim(),
      body: body.body,
      excerpt: nullableText(body.excerpt),
      collection: nullableText(body.collection),
      form: nullableText(body.form),
      stanza: nullableText(body.stanza),
      meter: nullableText(body.meter),
      rhymeScheme: nullableText(body.rhymeScheme),
      creationDate: nullableText(body.creationDate),
      notes: nullableText(body.notes),
      isCalligram: body.isCalligram === true,
      contentType: 'poem',
      createdAt: now,
      updatedAt: now,
    })
    .returning()

  if (!poem) {
    throw createError({ statusCode: 500, statusMessage: 'Impossible de créer le poème.' })
  }

  if (languages !== undefined) {
    await replacePoemLanguages(poem.id, languages)
  }

  setResponseStatus(event, 201)
  return poem
})
