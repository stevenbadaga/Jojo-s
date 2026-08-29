import { empty } from '../../../lib/http'
import { createInsight, listInsights } from '../../../lib/content'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = (request) => listInsights(request)
export const POST = (request) => createInsight(request)
export const OPTIONS = (request) => empty(request)
