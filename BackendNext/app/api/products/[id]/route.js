import { empty, int } from '../../../../lib/http'
import { deleteProduct, updateProduct } from '../../../../lib/commerce'
import { prisma } from '../../../../lib/prisma'
import { serializeProduct } from '../../../../lib/commerce'
import { apiError, json } from '../../../../lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function idFrom(context) {
  const params = await context.params
  return int(params.id)
}

export async function GET(request, context) {
  const id = await idFrom(context)
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || !product.active) return apiError(request, 'Product not found', 404)
  return json(request, serializeProduct(product))
}

export async function PUT(request, context) {
  return updateProduct(request, await idFrom(context))
}

export async function DELETE(request, context) {
  return deleteProduct(request, await idFrom(context))
}

export const OPTIONS = (request) => empty(request)
