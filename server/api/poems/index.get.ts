import { and, asc, count, desc, eq, exists, inArray, isNull, like, or } from 'drizzle-orm'
import { db, schema } from 'hub:db'

const pageSize = 24

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const collection = typeof query.collection === 'string' ? query.collection.trim() : ''
  const form = typeof query.form === 'string' ? query.form.trim() : ''
  const language = typeof query.language === 'string' ? query.language.trim() : ''
  const calligram = query.calligram === 'true'
  const sort = typeof query.sort === 'string' ? query.sort : 'date-desc'
  const parsedPage = Number(query.page)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const offset = (page - 1) * pageSize

  const filters = [
    search
      ? or(
          like(schema.poems.title, `%${search}%`),
          like(schema.poems.body, `%${search}%`),
          like(schema.poems.excerpt, `%${search}%`),
          like(schema.poems.collection, `%${search}%`),
        )
      : undefined,
    collection ? eq(schema.poems.collection, collection) : undefined,
    form ? eq(schema.poems.form, form) : undefined,
    language
      ? exists(
          db
            .select({ poemId: schema.poemLanguages.poemId })
            .from(schema.poemLanguages)
            .innerJoin(schema.languages, eq(schema.languages.id, schema.poemLanguages.languageId))
            .where(
              and(
                eq(schema.poemLanguages.poemId, schema.poems.id),
                eq(schema.languages.name, language),
              ),
            ),
        )
      : undefined,
    query.calligram === 'true' ? eq(schema.poems.isCalligram, true) : undefined,
  ].filter(Boolean)
  const where = filters.length > 0 ? and(...filters) : undefined
  const isTitleSort = sort === 'title-asc' || sort === 'title-desc'

  const [poems, countRows] = await Promise.all([
    (isTitleSort
      ? db
        .select({
          id: schema.poems.id,
          documentOrder: schema.poems.documentOrder,
          title: schema.poems.title,
          contentType: schema.poems.contentType,
          excerpt: schema.poems.excerpt,
          collection: schema.poems.collection,
          form: schema.poems.form,
          meter: schema.poems.meter,
          rhymeScheme: schema.poems.rhymeScheme,
          isCalligram: schema.poems.isCalligram,
        })
        .from(schema.poems)
        .where(where)
      : db
      .select({
        id: schema.poems.id,
        documentOrder: schema.poems.documentOrder,
        title: schema.poems.title,
        contentType: schema.poems.contentType,
        excerpt: schema.poems.excerpt,
        collection: schema.poems.collection,
        form: schema.poems.form,
        meter: schema.poems.meter,
        rhymeScheme: schema.poems.rhymeScheme,
        isCalligram: schema.poems.isCalligram,
      })
      .from(schema.poems)
      .where(where)
      .orderBy(
        asc(isNull(schema.poems.creationDate)),
        sort === 'date-asc' ? asc(schema.poems.creationDate) : desc(schema.poems.creationDate),
        sort === 'date-asc' ? asc(schema.poems.documentOrder) : desc(schema.poems.documentOrder),
      )
      .limit(pageSize)
      .offset(offset)),
    db.select({ total: count() }).from(schema.poems).where(where),
  ])

  const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true })
  const sortedPoems = isTitleSort
    ? poems
      .sort((left, right) => {
        const titleOrder = collator.compare(left.title, right.title)
        const order = titleOrder || left.documentOrder - right.documentOrder
        return sort === 'title-desc' ? -order : order
      })
      .slice(offset, offset + pageSize)
    : poems

  const total = countRows[0]?.total ?? 0
  const languages = sortedPoems.length > 0
    ? await db
        .select({
          poemId: schema.poemLanguages.poemId,
          name: schema.languages.name,
        })
        .from(schema.poemLanguages)
        .innerJoin(schema.languages, eq(schema.languages.id, schema.poemLanguages.languageId))
        .where(inArray(schema.poemLanguages.poemId, sortedPoems.map((poem) => poem.id)))
    : []

  const languagesByPoem = new Map<number, string[]>()
  for (const item of languages) {
    const names = languagesByPoem.get(item.poemId) ?? []
    names.push(item.name)
    languagesByPoem.set(item.poemId, names)
  }

  const images = sortedPoems.length > 0
    ? await db
        .select({
          poemId: schema.media.poemId,
          url: schema.media.cloudinaryUrl,
          originalFilename: schema.media.originalFilename,
        })
        .from(schema.media)
        .where(and(
          inArray(schema.media.poemId, sortedPoems.map((poem) => poem.id)),
          eq(schema.media.kind, 'image'),
        ))
    : []

  const imagesByPoem = new Map(images.map((image) => [image.poemId, image]))

  return {
    data: sortedPoems.map((poem) => ({
      ...poem,
      languages: languagesByPoem.get(poem.id) ?? [],
      image: imagesByPoem.get(poem.id) ?? null,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
})
