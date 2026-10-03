import { eq, inArray } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export function normalizePoemLanguages(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((language) => typeof language !== 'string')) {
    throw createError({ statusCode: 422, statusMessage: 'La liste des langues est invalide.' })
  }

  return [...new Set(value.map((language: string) => language.trim()).filter(Boolean))]
}

export async function replacePoemLanguages(poemId: number, value: unknown) {
  const names = normalizePoemLanguages(value)

  if (names.length > 0) {
    await db
      .insert(schema.languages)
      .values(names.map((name) => ({ name })))
      .onConflictDoNothing()
  }

  const languages = names.length > 0
    ? await db
        .select({ id: schema.languages.id })
        .from(schema.languages)
        .where(inArray(schema.languages.name, names))
    : []

  if (languages.length !== names.length) {
    throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer les langues du poème.' })
  }

  await db
    .delete(schema.poemLanguages)
    .where(eq(schema.poemLanguages.poemId, poemId))

  if (languages.length > 0) {
    await db
      .insert(schema.poemLanguages)
      .values(languages.map((language) => ({ poemId, languageId: language.id })))
  }
}
