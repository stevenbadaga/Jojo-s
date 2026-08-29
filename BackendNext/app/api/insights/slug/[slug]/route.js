import { empty } from '../../../../../lib/http'
import { getInsightBySlug } from '../../../../../lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  const params = await context.params
  return getInsightBySlug(request, params.slug)
}

export const OPTIONS = (request) => empty(request)
