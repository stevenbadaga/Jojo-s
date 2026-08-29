import { empty, int } from '../../../../../lib/http'
import { adjustStock } from '../../../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request, context) {
  const params = await context.params
  return adjustStock(request, int(params.id))
}

export const OPTIONS = (request) => empty(request)
