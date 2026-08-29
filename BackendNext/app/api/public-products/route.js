import { empty } from '../../../lib/http'
import { listPublicProducts } from '../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = (request) => listPublicProducts(request)
export const OPTIONS = (request) => empty(request)
