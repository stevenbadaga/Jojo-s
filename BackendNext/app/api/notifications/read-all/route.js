import { empty } from '../../../../lib/http'
import { markAllNotificationsRead } from '../../../../lib/notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const PUT = (request) => markAllNotificationsRead(request)
export const OPTIONS = (request) => empty(request)
