import { handleApi } from '../../../../lib/router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function run(request, context, method) {
  const params = await context.params
  return handleApi(request, params.path || [], method)
}

export async function GET(request, context) {
  return run(request, context, 'GET')
}

export async function POST(request, context) {
  return run(request, context, 'POST')
}

export async function PUT(request, context) {
  return run(request, context, 'PUT')
}

export async function PATCH(request, context) {
  return run(request, context, 'PATCH')
}

export async function DELETE(request, context) {
  return run(request, context, 'DELETE')
}

export async function OPTIONS(request, context) {
  return run(request, context, 'OPTIONS')
}
