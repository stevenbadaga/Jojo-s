import { empty, int } from '../../../../../lib/http'
import { stockHistory } from '../../../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  const params = await context.params
  return stockHistory(request, int(params.id))
}

export const OPTIONS = (request) => empty(request)
