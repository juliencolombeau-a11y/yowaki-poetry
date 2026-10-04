import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de poème invalide.' })
  }

  const [media] = await db
    .select({ url: schema.media.cloudinaryUrl })
    .from(schema.media)
    .where(and(
      eq(schema.media.poemId, id),
      eq(schema.media.kind, 'pdf'),
    ))
    .limit(1)

  if (!media) {
    throw createError({ statusCode: 404, statusMessage: 'Document PDF introuvable.' })
  }

  const cloudName = useRuntimeConfig(event).public.cloudinaryCloudName
  if (!cloudName) {
    throw createError({ statusCode: 503, statusMessage: 'La configuration Cloudinary est incomplète.' })
  }

  let pdfUrl: URL
  try {
    pdfUrl = new URL(media.url)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'L’adresse du document PDF est invalide.' })
  }

  if (
    pdfUrl.protocol !== 'https:'
    || pdfUrl.hostname !== 'res.cloudinary.com'
    || !pdfUrl.pathname.startsWith(`/${cloudName}/raw/upload/`)
  ) {
    throw createError({ statusCode: 502, statusMessage: 'La source du document PDF est invalide.' })
  }

  const range = getRequestHeader(event, 'range')
  const response = await fetch(pdfUrl, {
    headers: range ? { Range: range } : undefined,
  })
  if (!response.ok || !response.body) {
    throw createError({ statusCode: 502, statusMessage: 'Le document PDF est momentanément indisponible.' })
  }

  setResponseStatus(event, response.status)
  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', 'inline')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  for (const header of ['accept-ranges', 'content-length', 'content-range'] as const) {
    const value = response.headers.get(header)
    if (value) {
      setResponseHeader(event, header, value)
    }
  }

  return sendStream(event, response.body)
})
