import { empty, int } from '../../../../../lib/http'
import { updateOrderPayment } from '../../../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request, context) {
  const params = await context.params
  return updateOrderPayment(request, int(params.id))
}

export const OPTIONS = (request) => empty(request)
