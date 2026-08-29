import { empty, int } from '../../../../lib/http'
import { deleteInsight, getInsightById, updateInsight } from '../../../../lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function idFrom(context) {
  const params = await context.params
  return int(params.id)
}

export async function GET(request, context) {
  return getInsightById(request, await idFrom(context))
}

export async function PUT(request, context) {
  return updateInsight(request, await idFrom(context))
}

export async function DELETE(request, context) {
  return deleteInsight(request, await idFrom(context))
}

export const OPTIONS = (request) => empty(request)
