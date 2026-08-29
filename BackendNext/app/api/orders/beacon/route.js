import { apiError, empty } from '../../../../lib/http'
import { createOrder } from '../../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  const raw = await request.text()
  let body = {}
  try {
    body = JSON.parse(raw)
  } catch {
    return apiError(request, 'Invalid order payload')
  }
  return createOrder(request, body)
}

export const OPTIONS = (request) => empty(request)
