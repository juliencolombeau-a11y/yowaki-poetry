import { and, count, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { requireAdmin } from '../../../utils/auth'

const pageSize = 50

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const status = query.status === 'approved' || query.status === 'pending' ? query.status : 'all'
  const parsedPage = Number(query.page)
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const filters = [
    status === 'all' ? undefined : eq(schema.poemComments.status, status),
  ].filter(Boolean)
  const where = filters.length ? and(...filters) : undefined

  const [comments, countRows] = await Promise.all([
    db
      .select({
        id: schema.poemComments.id,
        poemId: schema.poemComments.poemId,
        poemTitle: schema.poems.title,
        pseudonym: schema.poemComments.pseudonym,
        content: schema.poemComments.content,
        status: schema.poemComments.status,
        createdAt: schema.poemComments.createdAt,
        moderatedAt: schema.poemComments.moderatedAt,
      })
      .from(schema.poemComments)
      .innerJoin(schema.poems, eq(schema.poems.id, schema.poemComments.poemId))
      .where(where)
      .orderBy(desc(schema.poemComments.createdAt), desc(schema.poemComments.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(schema.poemComments).where(where),
  ])

  const total = countRows[0]?.total ?? 0
  return {
    data: comments,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  }
})
