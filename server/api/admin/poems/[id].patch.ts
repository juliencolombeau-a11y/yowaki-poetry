import { eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'
import { normalizePoemLanguages, replacePoemLanguages } from '../../../utils/poem-languages'

const nullableTextFields = [
  'excerpt',
  'collection',
  'form',
  'stanza',
  'meter',
  'rhymeScheme',
  'creationDate',
  'notes',
] as const

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de poème invalide.' })
  }

  const body = await readBody<Record<string, unknown>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 422, statusMessage: 'Données de poème invalides.' })
  }

  const [existingPoem] = await db
    .select({
      contentType: schema.poems.contentType,
      body: schema.poems.body,
    })
    .from(schema.poems)
    .where(eq(schema.poems.id, id))
    .limit(1)

  if (!existingPoem) {
    throw createError({ statusCode: 404, statusMessage: 'Poème introuvable.' })
  }

  const contentType = body.contentType ?? existingPoem.contentType
  if (contentType !== 'poem' && contentType !== 'document') {
    throw createError({ statusCode: 422, statusMessage: 'Le type de ressource est invalide.' })
  }

  const languages = body.languages === undefined ? undefined : normalizePoemLanguages(body.languages)
  const values: Partial<typeof schema.poems.$inferInsert> = {
    updatedAt: new Date(),
  }

  if (body.contentType !== undefined) {
    values.contentType = contentType
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw createError({ statusCode: 422, statusMessage: 'Le titre est obligatoire.' })
    }
    values.title = body.title.trim()
  }

  if (body.body !== undefined) {
    if (typeof body.body !== 'string' || (contentType === 'poem' && !body.body.trim())) {
      throw createError({ statusCode: 422, statusMessage: 'Le texte du poème est obligatoire.' })
    }
    values.body = body.body
  }
  else if (contentType === 'poem') {
    if (!existingPoem.body.trim()) {
      throw createError({ statusCode: 422, statusMessage: 'Le texte du poème est obligatoire.' })
    }
  }

  for (const field of nullableTextFields) {
    if (body[field] !== undefined) {
      if (body[field] !== null && typeof body[field] !== 'string') {
        throw createError({ statusCode: 422, statusMessage: `Le champ ${field} est invalide.` })
      }
      values[field] = typeof body[field] === 'string' && !body[field].trim()
        ? null
        : body[field] as string | null
    }
  }

  if (body.isCalligram !== undefined) {
    if (typeof body.isCalligram !== 'boolean') {
      throw createError({ statusCode: 422, statusMessage: 'Le champ calligramme est invalide.' })
    }
    values.isCalligram = body.isCalligram
  }

  const [poem] = await db
    .update(schema.poems)
    .set(values)
    .where(eq(schema.poems.id, id))
    .returning()

  if (!poem) {
    throw createError({ statusCode: 404, statusMessage: 'Poème introuvable.' })
  }

  if (languages !== undefined) {
    await replacePoemLanguages(id, languages)
  }

  return poem
})
