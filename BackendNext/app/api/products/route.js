import { empty } from '../../../lib/http'
import { createProduct, listAdminProducts } from '../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = (request) => listAdminProducts(request)
export const POST = (request) => createProduct(request)
export const OPTIONS = (request) => empty(request)
