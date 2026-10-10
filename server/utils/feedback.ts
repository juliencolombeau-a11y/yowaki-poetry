import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

const visitorCookieName = 'yowaki_feedback_visitor'
const startedCookieName = 'yowaki_feedback_started'
const visitorCookieAge = 60 * 60 * 24 * 365
const startedCookieAge = 60 * 30
const signaturePattern = /^[\da-f]{64}$/

async function signCookieValue(event: Parameters<typeof getRouterParam>[0], name: string, value: string) {
  const secret = useRuntimeConfig(event).session.password
  if (typeof secret !== 'string' || new TextEncoder().encode(secret).length < 32) {
    throw createError({ statusCode: 500, statusMessage: 'La configuration sécurisée des contributions est indisponible.' })
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${name}:${value}`),
  )
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string) {
  let difference = left.length ^ right.length
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
  }
  return difference === 0
}

async function readSignedCookie(event: Parameters<typeof getRouterParam>[0], name: string) {
  const cookie = getCookie(event, name)
  if (!cookie) {
    return null
  }
  const separator = cookie.lastIndexOf('.')
  if (separator <= 0) {
    return null
  }

  const value = cookie.slice(0, separator)
  const signature = cookie.slice(separator + 1)
  if (!signaturePattern.test(signature)) {
    return null
  }

  const expectedSignature = await signCookieValue(event, name, value)
  return constantTimeEqual(signature, expectedSignature) ? value : null
}

async function setSignedCookie(
  event: Parameters<typeof getRouterParam>[0],
  name: string,
  value: string,
  maxAge: number,
) {
  const signature = await signCookieValue(event, name, value)
  setCookie(event, name, `${value}.${signature}`, {
    httpOnly: true,
    secure: getRequestURL(event).protocol === 'https:',
    sameSite: 'strict',
    path: '/',
    maxAge,
  })
}

export function parsePoemId(event: Parameters<typeof getRouterParam>[0]): number {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de ressource invalide.' })
  }
  return id
}

export function parseCommentId(event: Parameters<typeof getRouterParam>[0]): number {
  const id = Number(getRouterParam(event, 'commentId'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de commentaire invalide.' })
  }
  return id
}

export async function getFeedbackSettings() {
  const [settings] = await db
    .select()
    .from(schema.feedbackSettings)
    .where(eq(schema.feedbackSettings.id, 1))
    .limit(1)

  if (!settings) {
    throw createError({ statusCode: 500, statusMessage: 'Les réglages des contributions sont indisponibles.' })
  }

  return settings
}

export async function getPoem(id: number) {
  const [poem] = await db
    .select({
      id: schema.poems.id,
      title: schema.poems.title,
      contentType: schema.poems.contentType,
      ratingsEnabled: schema.poems.ratingsEnabled,
      commentsEnabled: schema.poems.commentsEnabled,
    })
    .from(schema.poems)
    .where(eq(schema.poems.id, id))
    .limit(1)

  if (!poem) {
    throw createError({ statusCode: 404, statusMessage: 'Ressource introuvable.' })
  }

  return poem
}

export async function getVisitorTokenHash(event: Parameters<typeof getRouterParam>[0]) {
  let token = await readSignedCookie(event, visitorCookieName)

  if (!token || !signaturePattern.test(token)) {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
    await setSignedCookie(event, visitorCookieName, token, visitorCookieAge)
  }

  const startedAt = await readSignedCookie(event, startedCookieName)
  if (!startedAt || !/^\d{10}$/.test(startedAt)) {
    await setSignedCookie(event, startedCookieName, String(Math.floor(Date.now() / 1000)), startedCookieAge)
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function enforceSubmissionProtections(
  event: Parameters<typeof getRouterParam>[0],
  body: Record<string, unknown>,
) {
  if (typeof body.website === 'string' && body.website.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'La contribution n’a pas pu être acceptée.' })
  }

  const startedAtValue = await readSignedCookie(event, startedCookieName)
  const startedAt = Number(startedAtValue)
  const now = Math.floor(Date.now() / 1000)
  if (
    !Number.isInteger(startedAt)
    || !/^\d{10}$/.test(startedAtValue ?? '')
    || now - startedAt < 3
    || now - startedAt > startedCookieAge
  ) {
    throw createError({ statusCode: 429, statusMessage: 'Veuillez patienter avant d’envoyer votre contribution.' })
  }

  const origin = getRequestHeader(event, 'origin')
  if (origin) {
    let originUrl: URL
    try {
      originUrl = new URL(origin)
    }
    catch {
      throw createError({ statusCode: 403, statusMessage: 'Origine de requête invalide.' })
    }
    if (originUrl.origin !== getRequestURL(event).origin) {
      throw createError({ statusCode: 403, statusMessage: 'Origine de requête invalide.' })
    }
  }
}

export async function getEnabledFeedback(id: number, kind: 'ratings' | 'comments') {
  const [poem, settings] = await Promise.all([getPoem(id), getFeedbackSettings()])
  return kind === 'ratings'
    ? poem.ratingsEnabled && settings.ratingsEnabled
    : poem.commentsEnabled && settings.commentsEnabled
}
