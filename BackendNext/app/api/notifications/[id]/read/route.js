import { empty, int } from '../../../../../lib/http'
import { markNotificationRead } from '../../../../../lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(request, context) {
  const params = await context.params
  return markNotificationRead(request, int(params.id))
}

export const OPTIONS = (request) => empty(request)
