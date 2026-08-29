import { empty } from '../../../../lib/http'
import { businessStats } from '../../../../lib/commerce'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = (request) => businessStats(request)
export const OPTIONS = (request) => empty(request)
