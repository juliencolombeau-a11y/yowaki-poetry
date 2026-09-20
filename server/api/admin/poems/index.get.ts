import { and, asc, count, desc, eq, exists, like, or, sql } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'

const pageSize = 50

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const collection = typeof query.collection === 'string' ? query.collection.trim() : ''
  const form = typeof query.form === 'string' ? query.form.trim() : ''
  const language = typeof query.language === 'string' ? query.language.trim() : ''
  const calligram = query.calligram === 'true'
  const searchScope = query.searchScope === 'title' ? 'title' : 'all'
  const sort = typeof query.sort === 'string' ? query.sort : ''
  const parsedPage = Number(query.page)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const filters = [
    search
      ? searchScope === 'title'
        ? like(schema.poems.title, `%${search}%`)
        : or(
            like(schema.poems.title, `%${search}%`),
            like(schema.poems.body, `%${search}%`),
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
            .where(and(
              eq(schema.poemLanguages.poemId, schema.poems.id),
              eq(schema.languages.name, language),
            )),
        )
      : undefined,
    calligram ? eq(schema.poems.isCalligram, true) : undefined,
  ].filter(Boolean)
  const where = filters.length > 0 ? and(...filters) : undefined
  const orderBy = search
    ? [
        sql`CASE WHEN ${schema.poems.title} LIKE ${`%${search}%`} THEN 0 ELSE 1 END`,
        sort === 'title-desc' ? desc(schema.poems.title) : sort === 'title-asc' ? asc(schema.poems.title) : asc(schema.poems.documentOrder),
      ]
    : sort === 'title-desc'
      ? [desc(schema.poems.title)]
      : sort === 'title-asc'
        ? [asc(schema.poems.title)]
        : sort === 'order-desc'
          ? [desc(schema.poems.documentOrder)]
          : [asc(schema.poems.documentOrder)]

  const [data, countRows] = await Promise.all([
    db
      .select({
        id: schema.poems.id,
        documentOrder: schema.poems.documentOrder,
        title: schema.poems.title,
        collection: schema.poems.collection,
        form: schema.poems.form,
        isCalligram: schema.poems.isCalligram,
        updatedAt: schema.poems.updatedAt,
      })
      .from(schema.poems)
      .where(where)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(schema.poems).where(where),
  ])

  const total = countRows[0]?.total ?? 0
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
})
