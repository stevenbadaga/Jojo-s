import { empty } from '../../../lib/http'
import { listNotifications } from '../../../lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = (request) => listNotifications(request)
export const OPTIONS = (request) => empty(request)
