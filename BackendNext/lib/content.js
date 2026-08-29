import { prisma } from './prisma'
import { apiError, int, json, readJson } from './http'
import { requireAdmin } from './security'

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90)

const clean = (value) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const text = String(value).trim()
  return text || null
}

export function serializeInsight(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    image: post.image,
    author: post.author,
    featured: post.featured,
    published: post.published,
    published_at: post.publishedAt,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  }
}

async function uniqueSlug(base, excludeId = null) {
  let candidate = base || `insight-${Date.now()}`
  let suffix = 2
  while (true) {
    const existing = await prisma.insightPost.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    candidate = `${base}-${suffix}`
    suffix += 1
  }
}

function postData(body, { partial = false } = {}) {
  const data = {}
  const set = (key, value) => {
    if (!partial || value !== undefined) data[key] = value
  }

  set('title', body.title !== undefined ? String(body.title).trim() : undefined)
  set('excerpt', clean(body.excerpt))
  set('content', body.content !== undefined ? String(body.content).trim() : undefined)
  set('category', clean(body.category))
  set('image', clean(body.image))
  set('author', clean(body.author) || (partial ? undefined : 'MarketMet Editorial'))
  set('featured', body.featured !== undefined ? Boolean(body.featured) : undefined)
  set('published', body.published !== undefined ? Boolean(body.published) : undefined)

  return data
}

export async function listInsights(request) {
  const adminMode = new URL(request.url).searchParams.get('admin') === 'true'
  if (adminMode) await requireAdmin(request)

  const posts = await prisma.insightPost.findMany({
    where: adminMode ? {} : { published: true },
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
  })
  return json(request, posts.map(serializeInsight))
}

export async function getInsightBySlug(request, slug) {
  const post = await prisma.insightPost.findUnique({ where: { slug } })
  if (!post || !post.published) return apiError(request, 'Insight not found', 404)
  return json(request, serializeInsight(post))
}

export async function getInsightById(request, id) {
  await requireAdmin(request)
  const post = await prisma.insightPost.findUnique({ where: { id } })
  if (!post) return apiError(request, 'Insight not found', 404)
  return json(request, serializeInsight(post))
}

export async function createInsight(request) {
  await requireAdmin(request)
  const body = await readJson(request)
  const data = postData(body)
  if (!data.title) return apiError(request, 'Title is required')
  if (!data.content) return apiError(request, 'Article content is required')

  data.slug = await uniqueSlug(slugify(body.slug || data.title))
  data.publishedAt = data.published === false ? null : new Date()

  if (data.featured) {
    await prisma.insightPost.updateMany({ data: { featured: false } })
  }

  const post = await prisma.insightPost.create({ data })
  return json(request, serializeInsight(post), 201)
}

export async function updateInsight(request, id) {
  await requireAdmin(request)
  const existing = await prisma.insightPost.findUnique({ where: { id } })
  if (!existing) return apiError(request, 'Insight not found', 404)

  const body = await readJson(request)
  const data = postData(body, { partial: true })
  if (body.slug !== undefined || body.title !== undefined) {
    data.slug = await uniqueSlug(slugify(body.slug || body.title || existing.title), id)
  }
  if (data.published === true && !existing.publishedAt) data.publishedAt = new Date()
  if (data.published === false) data.publishedAt = null

  if (data.featured === true) {
    await prisma.insightPost.updateMany({ where: { id: { not: id } }, data: { featured: false } })
  }

  const post = await prisma.insightPost.update({ where: { id }, data })
  return json(request, serializeInsight(post))
}

export async function deleteInsight(request, id) {
  await requireAdmin(request)
  try {
    await prisma.insightPost.delete({ where: { id } })
    return json(request, { success: true })
  } catch {
    return apiError(request, 'Insight not found', 404)
  }
}
