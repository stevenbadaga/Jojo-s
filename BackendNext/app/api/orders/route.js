import { empty } from '../../../lib/http'
import { createOrder, listAdminOrders } from '../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = (request) => listAdminOrders(request)
export const POST = (request) => createOrder(request)
export const OPTIONS = (request) => empty(request)
