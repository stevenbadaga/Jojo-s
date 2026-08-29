import { prisma } from './prisma'
import { apiError, int, json, readJson } from './http'
import { currentUser, isAdminEmail, requireAdmin } from './security'

const DELIVERY_FEES = Object.freeze({ pickup: 0, kigali: 2000, upcountry: 3500 })
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PICKING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED']
const PAYMENT_STATUSES = new Set(['UNPAID', 'AWAITING_PAYMENT', 'PAID', 'FAILED', 'REFUNDED'])
const STATUS_ALIASES = Object.freeze({ PROCESSING: 'PICKING', SHIPPED: 'OUT_FOR_DELIVERY' })

const cleanText = (value) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const text = String(value).trim()
  return text || null
}

const money = (value) => Math.max(0, int(value, 0))
const safeQuantity = (value) => Math.max(0, int(value, 0))

export function serializeProduct(product) {
  if (!product) return null
  const available = Math.max(0, product.stockQuantity ?? 0)
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    sku: product.sku,
    unit: product.unit || 'item',
    price: product.price,
    image: product.image,
    in_stock: Boolean(product.inStock && available > 0),
    stock_quantity: available,
    low_stock_threshold: Math.max(0, product.lowStockThreshold ?? 5),
    stock_status: available <= 0 ? 'OUT_OF_STOCK' : available <= (product.lowStockThreshold ?? 5) ? 'LOW_STOCK' : 'HEALTHY',
    is_promo: product.isPromo,
    original_price: product.originalPrice,
    discount: product.discount,
    active: product.active,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export function serializeOrderItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.quantity * item.unitPrice,
    product: item.product ? serializeProduct(item.product) : undefined,
  }
}

export function serializeOrder(order) {
  if (!order) return null
  const total = order.subtotal + (order.deliveryFee || 0)
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    channel: order.channel,
    subtotal: order.subtotal,
    delivery_option: order.deliveryOption,
    delivery_fee: order.deliveryFee || 0,
    delivery_location: order.deliveryLocation,
    total,
    user_id: order.userId,
    status: order.status,
    tracking_number: order.trackingNumber,
    payment_status: order.paymentStatus || 'UNPAID',
    payment_method: order.paymentMethod,
    payment_reference: order.paymentReference,
    payment_notes: order.paymentNotes,
    paid_at: order.paidAt,
    confirmed_at: order.confirmedAt,
    picking_at: order.pickingAt,
    packed_at: order.packedAt,
    out_for_delivery_at: order.outForDeliveryAt,
    shipped_at: order.shippedAt,
    delivered_at: order.deliveredAt,
    cancelled_at: order.cancelledAt,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    items: Array.isArray(order.items) ? order.items.map(serializeOrderItem) : undefined,
  }
}

function productPayload(body, { partial = false } = {}) {
  const data = {}
  const set = (key, value) => {
    if (!partial || value !== undefined) data[key] = value
  }

  set('name', body.name !== undefined ? String(body.name).trim() : undefined)
  set('description', cleanText(body.description))
  set('category', cleanText(body.category))
  set('sku', body.sku !== undefined ? cleanText(body.sku)?.toUpperCase() || null : undefined)
  set('unit', body.unit !== undefined ? String(body.unit || 'item').trim() || 'item' : undefined)
  set('price', body.price !== undefined ? money(body.price) : undefined)
  set('image', cleanText(body.image))
  set('isPromo', body.is_promo !== undefined ? Boolean(body.is_promo) : body.isPromo !== undefined ? Boolean(body.isPromo) : undefined)
  set('originalPrice', body.original_price !== undefined ? (body.original_price == null || body.original_price === '' ? null : money(body.original_price)) : undefined)
  set('discount', body.discount !== undefined ? (body.discount == null || body.discount === '' ? null : Math.min(100, Math.max(0, int(body.discount)))) : undefined)
  set('active', body.active !== undefined ? Boolean(body.active) : undefined)
  set('lowStockThreshold', body.low_stock_threshold !== undefined ? safeQuantity(body.low_stock_threshold) : body.lowStockThreshold !== undefined ? safeQuantity(body.lowStockThreshold) : undefined)

  const stockInput = body.stock_quantity !== undefined ? body.stock_quantity : body.stockQuantity
  if (stockInput !== undefined) {
    const stockQuantity = safeQuantity(stockInput)
    set('stockQuantity', stockQuantity)
    set('inStock', stockQuantity > 0)
  } else if (body.in_stock !== undefined || body.inStock !== undefined) {
    set('inStock', Boolean(body.in_stock ?? body.inStock))
  }

  return data
}

export async function listPublicProducts(request) {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ inStock: 'desc' }, { createdAt: 'desc' }],
  })
  return json(request, products.map(serializeProduct))
}

export async function listAdminProducts(request) {
  await requireAdmin(request)
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return json(request, products.map(serializeProduct))
}

export async function createProduct(request) {
  await requireAdmin(request)
  const body = await readJson(request)
  const data = productPayload(body)
  if (!data.name) return apiError(request, 'Product name is required')
  if (!Number.isFinite(data.price) || data.price < 0) return apiError(request, 'A valid product price is required')

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data })
      if ((created.stockQuantity || 0) > 0) {
        await tx.stockMovement.create({
          data: {
            productId: created.id,
            type: 'OPENING_BALANCE',
            change: created.stockQuantity,
            quantityBefore: 0,
            quantityAfter: created.stockQuantity,
            note: 'Opening inventory balance',
          },
        })
      }
      return created
    })
    return json(request, serializeProduct(product), 201)
  } catch (error) {
    if (error.code === 'P2002') return apiError(request, 'That SKU is already in use')
    throw error
  }
}

export async function updateProduct(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  const data = productPayload(body, { partial: true })
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return apiError(request, 'Product not found', 404)

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({ where: { id }, data })
      if (data.stockQuantity !== undefined && data.stockQuantity !== existing.stockQuantity) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            type: 'ADMIN_ADJUSTMENT',
            change: data.stockQuantity - existing.stockQuantity,
            quantityBefore: existing.stockQuantity,
            quantityAfter: data.stockQuantity,
            note: body.stock_note || 'Inventory updated from product editor',
          },
        })
      }
      return product
    })
    return json(request, serializeProduct(updated))
  } catch (error) {
    if (error.code === 'P2002') return apiError(request, 'That SKU is already in use')
    throw error
  }
}

export async function deleteProduct(request, id) {
  await requireAdmin(request)
  try {
    await prisma.product.delete({ where: { id } })
    return json(request, { success: true })
  } catch (error) {
    if (error.code === 'P2003') return apiError(request, 'Archive this product instead because it is referenced by an existing order')
    if (error.code === 'P2025') return apiError(request, 'Product not found', 404)
    throw error
  }
}

export async function adjustStock(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return apiError(request, 'Product not found', 404)

  const mode = String(body.mode || 'delta').toLowerCase()
  const requested = int(body.quantity ?? body.change, 0)
  const nextQuantity = mode === 'set'
    ? Math.max(0, requested)
    : Math.max(0, product.stockQuantity + requested)
  const change = nextQuantity - product.stockQuantity

  if (change === 0) return json(request, serializeProduct(product))

  const movementType = String(body.type || (change > 0 ? 'RECEIPT' : 'ADJUSTMENT')).toUpperCase()
  const updated = await prisma.$transaction(async (tx) => {
    const value = await tx.product.update({
      where: { id },
      data: { stockQuantity: nextQuantity, inStock: nextQuantity > 0 },
    })
    await tx.stockMovement.create({
      data: {
        productId: id,
        type: movementType,
        change,
        quantityBefore: product.stockQuantity,
        quantityAfter: nextQuantity,
        note: cleanText(body.note),
      },
    })
    return value
  })

  return json(request, serializeProduct(updated))
}

export async function stockHistory(request, id) {
  await requireAdmin(request)
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return apiError(request, 'Product not found', 404)
  const rows = await prisma.stockMovement.findMany({
    where: { productId: id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return json(request, {
    product: serializeProduct(product),
    movements: rows.map((row) => ({
      id: row.id,
      type: row.type,
      change: row.change,
      quantity_before: row.quantityBefore,
      quantity_after: row.quantityAfter,
      note: row.note,
      order_id: row.orderId,
      created_at: row.createdAt,
    })),
  })
}

async function nextOrderNumber(tx) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const result = await tx.order.aggregate({
    where: { createdAt: { gte: start, lt: end } },
    _max: { orderNumber: true },
  })
  return (result._max.orderNumber || 0) + 1
}

function normalizeItems(rawItems) {
  const grouped = new Map()
  for (const raw of rawItems || []) {
    const productId = int(raw.productId)
    if (!productId) continue
    const quantity = Math.max(1, int(raw.quantity, 1))
    grouped.set(productId, (grouped.get(productId) || 0) + quantity)
  }
  return Array.from(grouped, ([productId, quantity]) => ({ productId, quantity }))
}

async function createOrderNotification(tx, userId, orderId, title, message) {
  if (!userId) return
  await tx.appNotification.create({
    data: { userId, orderId, type: 'ORDER', title, message },
  })
}

export async function createOrder(request, bodyOverride = null) {
  const body = bodyOverride || await readJson(request)
  const customerPhone = String(body.customerPhone || '').trim()
  const items = normalizeItems(body.items)
  if (!customerPhone || items.length === 0) return apiError(request, 'Customer phone and at least one item are required')

  const deliveryOption = String(body.deliveryOption || 'kigali').toLowerCase()
  if (!(deliveryOption in DELIVERY_FEES)) return apiError(request, 'Invalid delivery option')
  if (deliveryOption !== 'pickup' && !String(body.deliveryLocation || '').trim()) {
    return apiError(request, 'Delivery location is required')
  }

  const user = await currentUser(request, { optional: true })

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = items.map((item) => item.productId)
      const products = await tx.product.findMany({ where: { id: { in: productIds } } })
      if (products.length !== productIds.length) throw Object.assign(new Error('One or more products no longer exist'), { status: 400 })

      const byId = new Map(products.map((product) => [product.id, product]))
      const orderItems = []
      let subtotal = 0

      for (const item of items) {
        const product = byId.get(item.productId)
        if (!product.active) throw Object.assign(new Error(`${product.name} is currently unavailable`), { status: 409 })
        if (!product.inStock || product.stockQuantity < item.quantity) {
          const available = Math.max(0, product.stockQuantity)
          throw Object.assign(new Error(`${product.name} only has ${available} ${product.unit || 'item'}${available === 1 ? '' : 's'} available`), { status: 409 })
        }
        subtotal += product.price * item.quantity
        orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price })
      }

      const orderNumber = await nextOrderNumber(tx)
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerName: cleanText(body.customerName),
          customerPhone,
          channel: cleanText(body.channel) || 'WEB',
          subtotal,
          deliveryOption,
          deliveryFee: DELIVERY_FEES[deliveryOption],
          deliveryLocation: deliveryOption === 'pickup' ? null : cleanText(body.deliveryLocation),
          userId: user?.id || null,
          status: 'PENDING',
          paymentStatus: 'AWAITING_PAYMENT',
          paymentMethod: cleanText(body.paymentMethod) || 'MTN_MOMO',
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      })

      for (const item of orderItems) {
        const product = byId.get(item.productId)
        const nextQuantity = product.stockQuantity - item.quantity
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: nextQuantity, inStock: nextQuantity > 0 },
        })
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            orderId: created.id,
            type: 'SALE',
            change: -item.quantity,
            quantityBefore: product.stockQuantity,
            quantityAfter: nextQuantity,
            note: `Reserved for MarketMet order #${orderNumber}`,
          },
        })
      }

      const total = subtotal + DELIVERY_FEES[deliveryOption]
      await createOrderNotification(
        tx,
        user?.id,
        created.id,
        `Order #${orderNumber} received`,
        `We received your MarketMet order for ${total.toLocaleString()} RWF. Payment and confirmation are next.`
      )

      return created
    })

    return json(request, { order: serializeOrder(order) }, 201)
  } catch (error) {
    if (error.status) return apiError(request, error.message, error.status)
    throw error
  }
}

const orderInclude = {
  items: { include: { product: true } },
}

export async function listAdminOrders(request) {
  await requireAdmin(request)
  const orders = await prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } })
  return json(request, orders.map(serializeOrder))
}

export async function getOrder(request, id) {
  const user = await currentUser(request)
  const admin = isAdminEmail(user.email) || ['ADMIN', 'MANAGER', 'STAFF'].includes(String(user.role).toUpperCase())
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude })
  if (!order) return apiError(request, 'Order not found', 404)
  if (!admin && order.userId !== user.id) return apiError(request, 'Not authorized', 403)
  return json(request, { order: serializeOrder(order), items: order.items.map(serializeOrderItem) })
}

export async function deleteOrder(request, id) {
  await requireAdmin(request)
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) return apiError(request, 'Order not found', 404)
  if (!['CANCELLED', 'DELIVERED'].includes(order.status)) {
    return apiError(request, 'Only cancelled or delivered orders can be permanently deleted', 409)
  }
  await prisma.order.delete({ where: { id } })
  return json(request, { success: true })
}

function normalizedStatus(value) {
  const status = String(value || '').toUpperCase()
  return STATUS_ALIASES[status] || status
}

function canMoveStatus(from, to) {
  if (from === to) return true
  if (from === 'CANCELLED' || from === 'DELIVERED') return false
  if (to === 'CANCELLED') return true
  const current = STATUS_ORDER.indexOf(normalizedStatus(from))
  const next = STATUS_ORDER.indexOf(to)
  return current >= 0 && next > current
}

const statusNotificationCopy = {
  CONFIRMED: ['Order confirmed', 'Your order is confirmed and has entered our fulfilment queue.'],
  PICKING: ['We are picking your order', 'Our team is selecting the items in your MarketMet order.'],
  PACKED: ['Order packed', 'Your groceries are packed and ready for the next delivery step.'],
  OUT_FOR_DELIVERY: ['Out for delivery', 'Your MarketMet order is on the way.'],
  DELIVERED: ['Order delivered', 'Your MarketMet order has been marked as delivered. Thank you for shopping with us.'],
  CANCELLED: ['Order cancelled', 'Your MarketMet order has been cancelled and reserved inventory has been returned.'],
}

export async function updateOrderStatus(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  const status = normalizedStatus(body.status)
  if (![...STATUS_ORDER, 'CANCELLED'].includes(status)) return apiError(request, 'Invalid order status')

  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!existing) return apiError(request, 'Order not found', 404)
  const currentStatus = normalizedStatus(existing.status)
  if (!canMoveStatus(currentStatus, status)) {
    return apiError(request, `Order cannot move from ${currentStatus} to ${status}`, 409)
  }

  const updated = await prisma.$transaction(async (tx) => {
    const data = { status }
    if (body.trackingNumber !== undefined) data.trackingNumber = cleanText(body.trackingNumber)
    if (status === 'CONFIRMED' && !existing.confirmedAt) data.confirmedAt = new Date()
    if (status === 'PICKING' && !existing.pickingAt) data.pickingAt = new Date()
    if (status === 'PACKED' && !existing.packedAt) data.packedAt = new Date()
    if (status === 'OUT_FOR_DELIVERY' && !existing.outForDeliveryAt) {
      data.outForDeliveryAt = new Date()
      data.shippedAt = existing.shippedAt || new Date()
      if (!existing.trackingNumber && body.trackingNumber === undefined) {
        data.trackingNumber = `MM-${String(existing.orderNumber || existing.id).padStart(4, '0')}`
      }
    }
    if (status === 'DELIVERED' && !existing.deliveredAt) data.deliveredAt = new Date()
    if (status === 'CANCELLED' && !existing.cancelledAt) data.cancelledAt = new Date()

    if (status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
      for (const item of existing.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product) continue
        const nextQuantity = product.stockQuantity + item.quantity
        await tx.product.update({
          where: { id: product.id },
          data: { stockQuantity: nextQuantity, inStock: nextQuantity > 0 },
        })
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            orderId: existing.id,
            type: 'ORDER_CANCELLED',
            change: item.quantity,
            quantityBefore: product.stockQuantity,
            quantityAfter: nextQuantity,
            note: `Inventory restored from cancelled order #${existing.orderNumber || existing.id}`,
          },
        })
      }
    }

    const order = await tx.order.update({ where: { id }, data, include: orderInclude })
    const [title, message] = statusNotificationCopy[status] || [`Order ${status.toLowerCase()}`, `Your order status is now ${status}.`]
    await createOrderNotification(tx, existing.userId, existing.id, `${title} · #${existing.orderNumber || existing.id}`, message)
    return order
  })

  return json(request, serializeOrder(updated))
}

export async function updateOrderPayment(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  const paymentStatus = String(body.paymentStatus || body.payment_status || '').toUpperCase()
  if (!PAYMENT_STATUSES.has(paymentStatus)) return apiError(request, 'Invalid payment status')

  const existing = await prisma.order.findUnique({ where: { id }, include: orderInclude })
  if (!existing) return apiError(request, 'Order not found', 404)

  const data = {
    paymentStatus,
    ...(body.paymentMethod !== undefined || body.payment_method !== undefined
      ? { paymentMethod: cleanText(body.paymentMethod ?? body.payment_method) }
      : {}),
    ...(body.paymentReference !== undefined || body.payment_reference !== undefined
      ? { paymentReference: cleanText(body.paymentReference ?? body.payment_reference) }
      : {}),
    ...(body.paymentNotes !== undefined || body.payment_notes !== undefined
      ? { paymentNotes: cleanText(body.paymentNotes ?? body.payment_notes) }
      : {}),
  }

  if (paymentStatus === 'PAID') data.paidAt = existing.paidAt || new Date()
  if (paymentStatus !== 'PAID' && paymentStatus !== 'REFUNDED') data.paidAt = null

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({ where: { id }, data, include: orderInclude })
    if (existing.userId) {
      const copy = paymentStatus === 'PAID'
        ? `Payment of ${order.total || order.subtotal + (order.deliveryFee || 0)} RWF has been confirmed.`
        : paymentStatus === 'REFUNDED'
          ? 'Your MarketMet order payment has been marked as refunded.'
          : `Payment status is now ${paymentStatus.replaceAll('_', ' ').toLowerCase()}.`
      await createOrderNotification(tx, existing.userId, id, `Payment update · #${existing.orderNumber || id}`, copy)
    }
    return order
  })

  return json(request, serializeOrder(updated))
}

export async function businessStats(request) {
  await requireAdmin(request)
  const now = new Date()
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startWeek = new Date(startDay)
  startWeek.setDate(startWeek.getDate() - ((startWeek.getDay() + 6) % 7))
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [products, orders, totalCustomers] = await Promise.all([
    prisma.product.findMany({ orderBy: { stockQuantity: 'asc' } }),
    prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
  ])

  const nonCancelled = orders.filter((order) => order.status !== 'CANCELLED')
  const paidOrders = nonCancelled.filter((order) => order.paymentStatus === 'PAID')
  const orderTotal = (order) => order.subtotal + (order.deliveryFee || 0)
  const sum = (rows) => rows.reduce((total, order) => total + orderTotal(order), 0)

  const totalRevenue = sum(paidOrders)
  const grossOrderValue = sum(nonCancelled)
  const outstandingRevenue = sum(nonCancelled.filter((order) => order.paymentStatus !== 'PAID'))
  const monthlyRevenue = sum(paidOrders.filter((order) => order.paidAt ? order.paidAt >= startMonth : order.createdAt >= startMonth))
  const weeklyRevenue = sum(paidOrders.filter((order) => order.paidAt ? order.paidAt >= startWeek : order.createdAt >= startWeek))
  const todayRevenue = sum(paidOrders.filter((order) => order.paidAt ? order.paidAt >= startDay : order.createdAt >= startDay))

  const ordersByStatus = {}
  for (const order of orders) {
    const key = normalizedStatus(order.status)
    ordersByStatus[key] = (ordersByStatus[key] || 0) + 1
  }

  const paymentBreakdown = {}
  for (const order of orders) {
    const key = order.paymentStatus || 'UNPAID'
    paymentBreakdown[key] = (paymentBreakdown[key] || 0) + 1
  }

  const productPerformance = new Map()
  const categoryPerformance = new Map()
  for (const order of paidOrders) {
    for (const item of order.items) {
      const revenue = item.unitPrice * item.quantity
      const existing = productPerformance.get(item.productId) || {
        productId: item.productId,
        name: item.product?.name || `Product ${item.productId}`,
        image: item.product?.image || null,
        category: item.product?.category || 'Other',
        units: 0,
        revenue: 0,
      }
      existing.units += item.quantity
      existing.revenue += revenue
      productPerformance.set(item.productId, existing)

      const category = existing.category || 'Other'
      const categoryRow = categoryPerformance.get(category) || { category, units: 0, revenue: 0 }
      categoryRow.units += item.quantity
      categoryRow.revenue += revenue
      categoryPerformance.set(category, categoryRow)
    }
  }

  const revenueByMonth = {}
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1)
    const key = `${start.toLocaleString('en-US', { month: 'long' }).toUpperCase()} ${start.getFullYear()}`
    revenueByMonth[key] = sum(paidOrders.filter((order) => {
      const date = order.paidAt || order.createdAt
      return date >= start && date < end
    }))
  }

  const dailyRevenue = []
  for (let offset = 13; offset >= 0; offset -= 1) {
    const start = new Date(startDay)
    start.setDate(start.getDate() - offset)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    dailyRevenue.push({
      date: start.toISOString().slice(0, 10),
      revenue: sum(paidOrders.filter((order) => {
        const date = order.paidAt || order.createdAt
        return date >= start && date < end
      })),
    })
  }

  const customerOrderCounts = new Map()
  for (const order of nonCancelled) {
    const key = order.userId ? `user:${order.userId}` : `phone:${order.customerPhone}`
    customerOrderCounts.set(key, (customerOrderCounts.get(key) || 0) + 1)
  }
  const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length

  const lowStockProducts = products
    .filter((product) => product.active && product.stockQuantity <= product.lowStockThreshold)
    .slice(0, 10)
    .map(serializeProduct)

  const inventoryUnits = products.reduce((total, product) => total + Math.max(0, product.stockQuantity), 0)
  const inventoryValue = products.reduce((total, product) => total + Math.max(0, product.stockQuantity) * product.price, 0)

  return json(request, {
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.active).length,
    lowStockCount: products.filter((product) => product.active && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold).length,
    outOfStockCount: products.filter((product) => product.active && product.stockQuantity <= 0).length,
    inventoryUnits,
    inventoryValue,
    totalOrders: orders.length,
    completedOrders: ordersByStatus.DELIVERED || 0,
    pendingOrders: (ordersByStatus.PENDING || 0) + (ordersByStatus.CONFIRMED || 0),
    totalRevenue,
    grossOrderValue,
    outstandingRevenue,
    monthlyRevenue,
    weeklyRevenue,
    todayRevenue,
    totalCustomers,
    repeatCustomers,
    averageOrderValue: paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0,
    ordersByStatus,
    paymentBreakdown,
    revenueByMonth,
    dailyRevenue,
    topProducts: Array.from(productPerformance.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    categoryPerformance: Array.from(categoryPerformance.values()).sort((a, b) => b.revenue - a.revenue),
    lowStockProducts,
    recentOrders: orders.slice(0, 8).map(serializeOrder),
  })
}
