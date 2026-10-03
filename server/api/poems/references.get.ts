import { asc, isNotNull } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async () => {
  const [collections, forms, themes, meters, rhymeSchemes, languages] = await Promise.all([
    db
      .selectDistinct({ value: schema.poems.collection })
      .from(schema.poems)
      .where(isNotNull(schema.poems.collection))
      .orderBy(asc(schema.poems.collection)),
    db
      .selectDistinct({ value: schema.poems.form })
      .from(schema.poems)
      .where(isNotNull(schema.poems.form))
      .orderBy(asc(schema.poems.form)),
    db
      .selectDistinct({ value: schema.poems.stanza })
      .from(schema.poems)
      .where(isNotNull(schema.poems.stanza))
      .orderBy(asc(schema.poems.stanza)),
    db
      .selectDistinct({ value: schema.poems.meter })
      .from(schema.poems)
      .where(isNotNull(schema.poems.meter))
      .orderBy(asc(schema.poems.meter)),
    db
      .selectDistinct({ value: schema.poems.rhymeScheme })
      .from(schema.poems)
      .where(isNotNull(schema.poems.rhymeScheme))
      .orderBy(asc(schema.poems.rhymeScheme)),
    db
      .select({ value: schema.languages.name })
      .from(schema.languages)
      .orderBy(asc(schema.languages.name)),
  ])

  return {
    collections: collections.map((item) => item.value).filter((value): value is string => Boolean(value)),
    forms: forms.map((item) => item.value).filter((value): value is string => Boolean(value)),
    themes: themes.map((item) => item.value).filter((value): value is string => Boolean(value)),
    meters: meters.map((item) => item.value).filter((value): value is string => Boolean(value)),
    rhymeSchemes: rhymeSchemes.map((item) => item.value).filter((value): value is string => Boolean(value)),
    languages: languages.map((item) => item.value),
  }
})
