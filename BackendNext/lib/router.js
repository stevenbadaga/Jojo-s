import crypto from 'node:crypto'
import { prisma } from './prisma'
import { apiError, empty, int, json, readJson } from './http'
import {
  bootstrapAdminForLogin,
  comparePassword,
  currentUser,
  hashPassword,
  isAdminEmail,
  requireAdmin,
  signAuthToken,
} from './security'
import {
  addressJson,
  notificationsJson,
  orderJson,
  preferencesJson,
  productJson,
  reviewJson,
  userJson,
} from './mappers'
import {
  sendMail,
  sendPasswordResetEmail,
  sendTwoFactorCode,
  sendVerificationEmail,
} from './mail'
import { createUploadSignature, uploadBuffer } from './cloudinary'

const ORDER_STATUSES = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])

function routeKey(path) {
  return path.join('/')
}

function authResult(user, token, extras = {}) {
  const admin = isAdminEmail(user.email) || String(user.role).toUpperCase() === 'ADMIN'
  return {
    token,
    user: userJson({ ...user, role: admin ? 'ADMIN' : user.role }),
    admin,
    isAdmin: admin,
    ...extras,
  }
}

async function createToken(userId, type, minutes, code = null) {
  await prisma.authToken.deleteMany({ where: { userId, type } })
  const token = crypto.randomBytes(32).toString('hex')
  return prisma.authToken.create({
    data: {
      userId,
      type,
      token,
      code,
      expiresAt: new Date(Date.now() + minutes * 60 * 1000),
    },
  })
}

async function register(request) {
  const body = await readJson(request)
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!email || !email.includes('@')) return apiError(request, 'Valid email is required')
  if (password.length < 6) return apiError(request, 'Password must be at least 6 characters')
  if (isAdminEmail(email)) return apiError(request, 'This email is reserved for admin use only')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return apiError(request, 'Email already exists')

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      name: body.name ? String(body.name).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
      role: 'CUSTOMER',
      emailVerified: false,
    },
  })

  const verification = await createToken(user.id, 'EMAIL_VERIFY', 24 * 60)
  try { await sendVerificationEmail(user, verification.token) } catch (error) { console.error('Verification email failed:', error.message) }

  const token = await signAuthToken(user)
  return json(request, authResult(user, token))
}

async function login(request) {
  const body = await readJson(request)
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) user = await bootstrapAdminForLogin(email, password)
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return apiError(request, 'Invalid credentials', 401)
  }
  if (!user.active) return apiError(request, 'Account is deactivated', 401)

  if (isAdminEmail(user.email) && user.role !== 'ADMIN') {
    user = await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } })
  }

  if (user.twoFactorEnabled) {
    const code = String(Math.floor(100000 + Math.random() * 900000))
    await createToken(user.id, 'TWO_FACTOR', 10, code)
    try { await sendTwoFactorCode(user, code) } catch (error) { console.error('2FA email failed:', error.message) }
    return json(request, {
      requiresTwoFactor: true,
      message: 'Two-factor authentication code has been sent to your email',
    })
  }

  user = await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
  return json(request, authResult(user, await signAuthToken(user)))
}

async function verifyTwoFactor(request) {
  const body = await readJson(request)
  const email = String(body.email || '').trim().toLowerCase()
  const code = String(body.code || '').trim()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.active) return apiError(request, 'User not found', 401)

  const token = await prisma.authToken.findFirst({
    where: { userId: user.id, type: 'TWO_FACTOR', code, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  if (!token) return apiError(request, 'Invalid or expired verification code', 401)
  await prisma.authToken.deleteMany({ where: { userId: user.id, type: 'TWO_FACTOR' } })

  const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
  return json(request, authResult(updated, await signAuthToken(updated)))
}

async function forgotPassword(request) {
  const body = await readJson(request)
  const email = String(body.email || '').trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const reset = await createToken(user.id, 'PASSWORD_RESET', 60)
    try { await sendPasswordResetEmail(user, reset.token) } catch (error) { console.error('Reset email failed:', error.message) }
  }
  return json(request, { message: 'Password reset link has been sent to your email. Please check your inbox.' })
}

async function resetPassword(request) {
  const body = await readJson(request)
  const tokenValue = String(body.token || '')
  const newPassword = String(body.newPassword || '')
  if (newPassword.length < 6) return apiError(request, 'Password must be at least 6 characters')

  const token = await prisma.authToken.findFirst({
    where: { token: tokenValue, type: 'PASSWORD_RESET', expiresAt: { gt: new Date() } },
  })
  if (!token) return apiError(request, 'Invalid or expired reset token')

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
    prisma.authToken.deleteMany({ where: { userId: token.userId, type: 'PASSWORD_RESET' } }),
  ])
  return json(request, { message: 'Password has been reset successfully' })
}

async function verifyEmail(request) {
  const body = await readJson(request)
  const tokenValue = String(body.token || '')
  const token = await prisma.authToken.findFirst({
    where: { token: tokenValue, type: 'EMAIL_VERIFY', expiresAt: { gt: new Date() } },
  })
  if (!token) return apiError(request, 'Invalid or expired verification token')

  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { emailVerified: true } }),
    prisma.authToken.deleteMany({ where: { userId: token.userId, type: 'EMAIL_VERIFY' } }),
  ])
  return json(request, { message: 'Email verified successfully' })
}

async function resendVerification(request) {
  const body = await readJson(request)
  const email = String(body.email || '').trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return apiError(request, 'User not found')
  if (user.emailVerified) return json(request, { message: 'Email is already verified' })

  const token = await createToken(user.id, 'EMAIL_VERIFY', 24 * 60)
  try { await sendVerificationEmail(user, token.token) } catch (error) { console.error('Verification email failed:', error.message) }
  return json(request, { message: 'Verification email sent' })
}

async function checkAuth(request) {
  try {
    const user = await currentUser(request)
    const admin = isAdminEmail(user.email) || String(user.role).toUpperCase() === 'ADMIN'
    return json(request, { isAuthenticated: true, user: userJson(user), isAdmin: admin })
  } catch {
    return json(request, { isAuthenticated: false, user: null, isAdmin: false }, 401)
  }
}

function productData(body, { partial = false } = {}) {
  const data = {}
  const assign = (key, value) => { if (!partial || value !== undefined) data[key] = value }
  assign('name', body.name !== undefined ? String(body.name).trim() : undefined)
  assign('description', body.description !== undefined ? body.description || null : undefined)
  assign('category', body.category !== undefined ? body.category || null : undefined)
  assign('price', body.price !== undefined ? int(body.price) : undefined)
  assign('image', body.image !== undefined ? body.image || null : undefined)
  assign('inStock', body.in_stock !== undefined ? Boolean(body.in_stock) : body.inStock !== undefined ? Boolean(body.inStock) : undefined)
  assign('isPromo', body.is_promo !== undefined ? Boolean(body.is_promo) : body.isPromo !== undefined ? Boolean(body.isPromo) : undefined)
  assign('originalPrice', body.original_price !== undefined ? (body.original_price == null ? null : int(body.original_price)) : body.originalPrice !== undefined ? body.originalPrice : undefined)
  assign('discount', body.discount !== undefined ? (body.discount == null ? null : int(body.discount)) : undefined)
  assign('active', body.active !== undefined ? Boolean(body.active) : undefined)
  return data
}

async function getPublicProducts(request) {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } })
  return json(request, products.map(productJson))
}

async function getAllProducts(request) {
  await requireAdmin(request)
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return json(request, products.map(productJson))
}

async function getProduct(request, id) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product || !product.active) return apiError(request, 'Product not found', 404)
  return json(request, productJson(product))
}

async function createProduct(request) {
  await requireAdmin(request)
  const body = await readJson(request)
  const data = productData(body)
  if (!data.name || data.price < 0) return apiError(request, 'Product name and valid price are required')
  const product = await prisma.product.create({ data })
  return json(request, productJson(product))
}

async function updateProduct(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  const product = await prisma.product.update({ where: { id }, data: productData(body, { partial: true }) })
  return json(request, productJson(product))
}

async function toggleProduct(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  if (typeof body.active !== 'boolean') return apiError(request, 'Active status is required')
  const product = await prisma.product.update({ where: { id }, data: { active: body.active } })
  return json(request, productJson(product))
}

async function deleteProduct(request, id) {
  await requireAdmin(request)
  try {
    await prisma.product.delete({ where: { id } })
    return json(request, { success: true })
  } catch (error) {
    if (String(error.code) === 'P2003') return apiError(request, 'Product cannot be deleted because it is referenced by an existing order')
    if (String(error.code) === 'P2025') return apiError(request, 'Product not found', 404)
    throw error
  }
}

async function nextOrderNumber() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const max = await prisma.order.aggregate({
    where: { createdAt: { gte: start, lt: end } },
    _max: { orderNumber: true },
  })
  return (max._max.orderNumber || 0) + 1
}

function whatsappLink(phone, text) {
  const clean = String(phone || '').replace(/\D/g, '')
  if (!clean) return null
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
}

async function createOrder(request, bodyOverride = null) {
  const body = bodyOverride || await readJson(request)
  if (!body.customerPhone || !Array.isArray(body.items) || body.items.length === 0) {
    return apiError(request, 'Customer phone and items are required')
  }

  const user = await currentUser(request, { optional: true })
  const items = body.items.map((item) => ({
    productId: int(item.productId),
    quantity: Math.max(1, int(item.quantity, 1)),
    unitPrice: Math.max(0, int(item.unitPrice)),
  }))

  const order = await prisma.order.create({
    data: {
      orderNumber: await nextOrderNumber(),
      customerName: body.customerName || null,
      customerPhone: String(body.customerPhone).trim(),
      channel: body.channel || 'WEB',
      subtotal: Math.max(0, int(body.subtotal)),
      deliveryOption: body.deliveryOption || null,
      deliveryFee: body.deliveryFee == null ? 0 : Math.max(0, int(body.deliveryFee)),
      deliveryLocation: body.deliveryLocation || null,
      userId: user?.id || null,
      status: 'PENDING',
      items: { create: items },
    },
    include: { items: true },
  })

  const total = order.subtotal + (order.deliveryFee || 0)
  const summary = `New MarketMet order #${order.orderNumber}\nCustomer: ${order.customerName || 'Guest'}\nPhone: ${order.customerPhone}\nTotal: ${total.toLocaleString()} RWF`
  const adminWhatsAppUrl = whatsappLink(process.env.ADMIN_WHATSAPP, summary)
  const customerWhatsAppUrl = whatsappLink(order.customerPhone, `Your MarketMet order #${order.orderNumber} has been received. Total: ${total.toLocaleString()} RWF.`)

  return json(request, {
    order: orderJson(order),
    ...(adminWhatsAppUrl ? { adminWhatsAppUrl } : {}),
    ...(customerWhatsAppUrl ? { customerWhatsAppUrl } : {}),
  })
}

async function allOrders(request) {
  await requireAdmin(request)
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } })
  return json(request, orders.map(orderJson))
}

async function myOrders(request) {
  const user = await currentUser(request)
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } })
  return json(request, orders.map(orderJson))
}

async function getOrder(request, id) {
  const user = await currentUser(request)
  const admin = isAdminEmail(user.email) || user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'STAFF'
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) return apiError(request, 'Order not found', 404)
  if (!admin && order.userId !== user.id) return apiError(request, 'Not authorized', 403)
  return json(request, { order: orderJson(order), items: order.items.map((item) => ({ id: item.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice })) })
}

async function deleteOrder(request, id) {
  await requireAdmin(request)
  try { await prisma.order.delete({ where: { id } }) } catch { return apiError(request, 'Order not found', 404) }
  return json(request, { success: true })
}

async function updateOrderStatus(request, id) {
  await requireAdmin(request)
  const body = await readJson(request)
  const status = String(body.status || '').toUpperCase()
  if (!ORDER_STATUSES.has(status)) return apiError(request, 'Invalid order status')

  const data = {
    status,
    trackingNumber: body.trackingNumber || null,
  }
  if (status === 'SHIPPED') data.shippedAt = new Date()
  if (status === 'DELIVERED') data.deliveredAt = new Date()
  if (status !== 'SHIPPED' && status !== 'DELIVERED') {
    if (status === 'PENDING' || status === 'CONFIRMED' || status === 'PROCESSING') {
      data.shippedAt = null
      data.deliveredAt = null
    }
  }

  const order = await prisma.order.update({ where: { id }, data, include: { items: true } })
  return json(request, orderJson(order))
}

function trackingJson(order) {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
  }
}

async function trackByNumber(request) {
  const body = await readJson(request)
  const orderNumber = int(body.orderNumber, -1)
  const phone = String(body.phone || '').trim()
  if (orderNumber < 0 || !phone) return apiError(request, 'Order number and phone are required')
  const order = await prisma.order.findFirst({ where: { orderNumber, customerPhone: phone } })
  if (!order) return apiError(request, 'Order not found')
  return json(request, trackingJson(order))
}

async function trackOrder(request, id) {
  const user = await currentUser(request)
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return apiError(request, 'Order not found', 404)
  const staff = ['ADMIN', 'MANAGER', 'STAFF'].includes(String(user.role).toUpperCase()) || isAdminEmail(user.email)
  if (!staff && order.userId !== user.id) return apiError(request, 'Not authorized to track this order', 403)
  return json(request, trackingJson(order))
}

async function businessStats(request) {
  await requireAdmin(request)
  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startWeek = new Date(now)
  startWeek.setHours(0, 0, 0, 0)
  startWeek.setDate(startWeek.getDate() - startWeek.getDay())
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [totalProducts, activeProducts, totalOrders, completedOrders, totalCustomers, orders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.order.findMany({ select: { subtotal: true, deliveryFee: true, status: true, createdAt: true } }),
  ])

  const revenue = (filter) => orders.filter(filter).reduce((sum, order) => sum + order.subtotal + (order.deliveryFee || 0), 0)
  const validSale = (order) => order.status !== 'CANCELLED'
  const totalRevenue = revenue(validSale)
  const monthlyRevenue = revenue((order) => validSale(order) && order.createdAt >= startMonth)
  const weeklyRevenue = revenue((order) => validSale(order) && order.createdAt >= startWeek)
  const todayRevenue = revenue((order) => validSale(order) && order.createdAt >= startDay)

  const revenueByMonth = {}
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1)
    const key = `${start.toLocaleString('en-US', { month: 'long' }).toUpperCase()} ${start.getFullYear()}`
    revenueByMonth[key] = revenue((order) => validSale(order) && order.createdAt >= start && order.createdAt < end)
  }

  return json(request, {
    totalProducts,
    activeProducts,
    totalOrders,
    completedOrders,
    totalRevenue,
    monthlyRevenue,
    weeklyRevenue,
    todayRevenue,
    totalCustomers,
    ordersByStatus: { all: totalOrders },
    revenueByMonth,
  })
}

async function profile(request) {
  return json(request, userJson(await currentUser(request)))
}

async function updateProfile(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  const data = {}
  if (body.name !== undefined) data.name = body.name || null
  if (body.phone !== undefined) data.phone = body.phone || null
  if (body.address !== undefined) data.address = body.address || null
  if (body.city !== undefined) data.city = body.city || null
  if (body.country !== undefined) data.country = body.country || null

  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase()
    if (!email.includes('@')) return apiError(request, 'Invalid email')
    if (isAdminEmail(email) && !isAdminEmail(user.email)) return apiError(request, 'This email is reserved for admin use only')
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== user.id) return apiError(request, 'Email already exists')
    data.email = email
    if (email !== user.email) data.emailVerified = false
  }

  return json(request, userJson(await prisma.user.update({ where: { id: user.id }, data })))
}

async function changePassword(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  if (!body.currentPassword || String(body.newPassword || '').length < 6) return apiError(request, 'Invalid password data')
  if (!(await comparePassword(body.currentPassword, user.passwordHash))) return apiError(request, 'Current password is incorrect')
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } })
  return json(request, { message: 'Password changed successfully' })
}

async function updateTwoFactor(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  if (typeof body.enabled !== 'boolean') return apiError(request, "Missing 'enabled' flag")
  const updated = await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: body.enabled } })
  return json(request, { twoFactorEnabled: updated.twoFactorEnabled })
}

async function deactivate(request) {
  const user = await currentUser(request)
  if (isAdminEmail(user.email) || user.role === 'ADMIN') return apiError(request, 'Admin accounts cannot be deactivated')
  await prisma.user.update({ where: { id: user.id }, data: { active: false } })
  return json(request, { message: 'Account deactivated successfully' })
}

async function deleteMe(request) {
  const user = await currentUser(request)
  if (isAdminEmail(user.email) || user.role === 'ADMIN') return apiError(request, 'Admin accounts cannot be deleted')
  await prisma.user.delete({ where: { id: user.id } })
  return json(request, { message: 'Account deleted successfully' })
}

async function allUsers(request) {
  await requireAdmin(request)
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return json(request, users.map(userJson))
}

async function deleteUser(request, id) {
  const admin = await requireAdmin(request)
  if (admin.id === id) return apiError(request, 'You cannot delete your own account')
  try { await prisma.user.delete({ where: { id } }) } catch { return apiError(request, 'User not found', 404) }
  return json(request, { success: true, message: 'User deleted successfully' })
}

async function getAddresses(request) {
  const user = await currentUser(request)
  const values = await prisma.userAddress.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] })
  return json(request, values.map(addressJson))
}

async function addAddress(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  if (!body.street || !body.city || !body.country) return apiError(request, 'Street, city and country are required')
  if (body.isDefault) await prisma.userAddress.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
  const value = await prisma.userAddress.create({ data: { userId: user.id, label: body.label || null, street: body.street, city: body.city, country: body.country, isDefault: Boolean(body.isDefault) } })
  return json(request, addressJson(value))
}

async function updateAddress(request, id) {
  const user = await currentUser(request)
  const existing = await prisma.userAddress.findFirst({ where: { id, userId: user.id } })
  if (!existing) return apiError(request, 'Address not found', 404)
  const body = await readJson(request)
  if (body.isDefault) await prisma.userAddress.updateMany({ where: { userId: user.id, id: { not: id } }, data: { isDefault: false } })
  const value = await prisma.userAddress.update({
    where: { id },
    data: {
      ...(body.label !== undefined ? { label: body.label || null } : {}),
      ...(body.street !== undefined ? { street: body.street } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
      ...(body.country !== undefined ? { country: body.country } : {}),
      ...(body.isDefault !== undefined ? { isDefault: Boolean(body.isDefault) } : {}),
    },
  })
  return json(request, addressJson(value))
}

async function deleteAddress(request, id) {
  const user = await currentUser(request)
  const result = await prisma.userAddress.deleteMany({ where: { id, userId: user.id } })
  if (!result.count) return apiError(request, 'Address not found', 404)
  return json(request, { success: true, message: 'Address deleted successfully' })
}

async function getPreferences(request) {
  const user = await currentUser(request)
  const prefs = await prisma.userPreferences.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
  return json(request, preferencesJson(prefs))
}

async function updatePreferences(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  const data = {
    ...(body.language !== undefined ? { language: body.language } : {}),
    ...(body.currency !== undefined ? { currency: body.currency } : {}),
    ...(body.theme !== undefined ? { theme: body.theme } : {}),
    ...(body.dateFormat !== undefined ? { dateFormat: body.dateFormat } : {}),
    ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
  }
  const prefs = await prisma.userPreferences.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } })
  return json(request, preferencesJson(prefs))
}

async function getNotifications(request) {
  const user = await currentUser(request)
  const value = await prisma.userNotifications.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
  return json(request, notificationsJson(value))
}

async function updateNotifications(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  const keys = ['emailOrderUpdates', 'emailPromotions', 'emailNewsletters', 'smsOrderUpdates', 'smsPromotions']
  const data = Object.fromEntries(keys.filter((key) => body[key] !== undefined).map((key) => [key, Boolean(body[key])]))
  const value = await prisma.userNotifications.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } })
  return json(request, notificationsJson(value))
}

async function productReviews(request, productId) {
  const reviews = await prisma.review.findMany({ where: { productId }, orderBy: { createdAt: 'desc' } })
  return json(request, reviews.map(reviewJson))
}

async function productRating(request, productId) {
  const aggregate = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true } })
  return json(request, { averageRating: aggregate._avg.rating || 0 })
}

async function createReview(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  const productId = int(body.productId)
  const rating = int(body.rating)
  if (!productId || rating < 1 || rating > 5) return apiError(request, 'Product and rating from 1 to 5 are required')
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return apiError(request, 'Product not found', 404)
  try {
    const review = await prisma.review.create({ data: { productId, userId: user.id, rating, comment: body.comment || null, userName: user.name, userEmail: user.email } })
    return json(request, reviewJson(review))
  } catch (error) {
    if (error.code === 'P2002') return apiError(request, 'You have already reviewed this product')
    throw error
  }
}

async function deleteReview(request, id) {
  const user = await currentUser(request)
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return apiError(request, 'Review not found', 404)
  const admin = isAdminEmail(user.email) || user.role === 'ADMIN'
  if (!admin && review.userId !== user.id) return apiError(request, 'You can only delete your own review', 403)
  await prisma.review.delete({ where: { id } })
  return json(request, { message: 'Review deleted successfully' })
}

async function getWishlist(request) {
  const user = await currentUser(request)
  const rows = await prisma.wishlist.findMany({ where: { userId: user.id }, select: { productId: true } })
  return json(request, rows.map((row) => row.productId))
}

async function toggleWishlist(request) {
  const user = await currentUser(request)
  const body = await readJson(request)
  const productId = int(body.productId)
  const action = String(body.action || 'toggle').toLowerCase()
  if (!productId) return apiError(request, 'Product ID is required')
  const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: user.id, productId } } })
  const shouldAdd = action === 'add' || (action === 'toggle' && !existing)
  if (shouldAdd && !existing) await prisma.wishlist.create({ data: { userId: user.id, productId } })
  if (!shouldAdd && existing) await prisma.wishlist.delete({ where: { userId_productId: { userId: user.id, productId } } })
  return json(request, { success: true })
}

async function contact(request) {
  const body = await readJson(request)
  if (!body.email || !body.message) return apiError(request, 'Email and message are required')
  const recipients = (process.env.ADMIN_EMAIL || '').split(',').map((v) => v.trim()).filter(Boolean)
  if (recipients.length) {
    try {
      await sendMail({
        to: recipients.join(','),
        subject: `MarketMet contact: ${body.subject || 'Website message'}`,
        text: `From: ${body.name || 'Customer'} <${body.email}>\n\n${body.message}`,
      })
    } catch (error) { console.error('Contact email failed:', error.message) }
  }
  return json(request, { success: true, message: 'Message sent successfully' })
}

async function uploadImage(request, { profile = false } = {}) {
  const user = profile ? await currentUser(request) : await requireAdmin(request)
  const form = await request.formData()
  const file = form.get('image')
  if (!file || typeof file.arrayBuffer !== 'function') return apiError(request, 'No image uploaded')
  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadBuffer(buffer, { folder: profile ? `${process.env.CLOUDINARY_FOLDER || 'marketmet'}/profiles` : process.env.CLOUDINARY_FOLDER || 'marketmet' })
  if (profile) await prisma.user.update({ where: { id: user.id }, data: { profileImageUrl: result.secure_url } })
  return json(request, { url: result.secure_url, publicId: result.public_id })
}

async function uploadSignature(request) {
  await currentUser(request)
  return json(request, createUploadSignature())
}

export async function handleApi(request, path, method) {
  const key = routeKey(path)

  try {
    if (method === 'OPTIONS') return empty(request)
    if (method === 'GET' && (key === 'health' || key === '')) return json(request, { status: 'ok', service: 'marketmet-next-api' })

    if (method === 'POST' && key === 'register') return register(request)
    if (method === 'POST' && key === 'login') return login(request)
    if (method === 'POST' && key === 'logout') return json(request, { success: true })
    if (method === 'POST' && key === 'verify-2fa') return verifyTwoFactor(request)
    if (method === 'POST' && key === 'forgot-password') return forgotPassword(request)
    if (method === 'POST' && key === 'reset-password') return resetPassword(request)
    if (method === 'POST' && key === 'verify-email') return verifyEmail(request)
    if (method === 'POST' && key === 'resend-verification') return resendVerification(request)
    if (method === 'GET' && key === 'check-auth') return checkAuth(request)

    if (method === 'GET' && key === 'public-products') return getPublicProducts(request)
    if (method === 'GET' && key === 'products') return getAllProducts(request)
    if (method === 'POST' && key === 'products') return createProduct(request)
    if (path[0] === 'products' && path.length === 2) {
      const id = int(path[1])
      if (method === 'GET') return getProduct(request, id)
      if (method === 'PUT') return updateProduct(request, id)
      if (method === 'DELETE') return deleteProduct(request, id)
    }
    if (path[0] === 'products' && path.length === 3 && path[2] === 'active' && method === 'PATCH') return toggleProduct(request, int(path[1]))

    if (method === 'GET' && key === 'orders') return allOrders(request)
    if (method === 'GET' && key === 'orders/my-orders') return myOrders(request)
    if (method === 'POST' && key === 'orders') return createOrder(request)
    if (method === 'POST' && key === 'orders/beacon') {
      const raw = await request.text()
      let body = {}
      try { body = JSON.parse(raw) } catch { return apiError(request, 'Invalid order payload') }
      return createOrder(request, body)
    }
    if (method === 'POST' && key === 'orders/track') return trackByNumber(request)
    if (path[0] === 'orders' && path.length === 2) {
      const id = int(path[1])
      if (method === 'GET') return getOrder(request, id)
      if (method === 'DELETE') return deleteOrder(request, id)
    }
    if (path[0] === 'orders' && path.length === 3 && path[2] === 'status' && method === 'PUT') return updateOrderStatus(request, int(path[1]))
    if (path[0] === 'orders' && path.length === 3 && path[2] === 'track' && method === 'GET') return trackOrder(request, int(path[1]))

    if (method === 'GET' && key === 'stats/business') return businessStats(request)

    if (method === 'GET' && key === 'users/profile') return profile(request)
    if (method === 'PUT' && key === 'users/profile') return updateProfile(request)
    if (method === 'POST' && key === 'users/change-password') return changePassword(request)
    if (method === 'PUT' && key === 'users/two-factor') return updateTwoFactor(request)
    if (method === 'POST' && key === 'users/deactivate') return deactivate(request)
    if (method === 'DELETE' && key === 'users/me') return deleteMe(request)
    if (method === 'GET' && key === 'users/all') return allUsers(request)
    if (path[0] === 'users' && path.length === 2 && /^\d+$/.test(path[1]) && method === 'DELETE') return deleteUser(request, int(path[1]))

    if (method === 'GET' && key === 'users/addresses') return getAddresses(request)
    if (method === 'POST' && key === 'users/addresses') return addAddress(request)
    if (path[0] === 'users' && path[1] === 'addresses' && path.length === 3) {
      if (method === 'PUT') return updateAddress(request, int(path[2]))
      if (method === 'DELETE') return deleteAddress(request, int(path[2]))
    }
    if (method === 'GET' && key === 'users/preferences') return getPreferences(request)
    if (method === 'PUT' && key === 'users/preferences') return updatePreferences(request)
    if (method === 'GET' && key === 'users/notifications') return getNotifications(request)
    if (method === 'PUT' && key === 'users/notifications') return updateNotifications(request)

    if (path[0] === 'reviews' && path[1] === 'product' && path.length === 3 && method === 'GET') return productReviews(request, int(path[2]))
    if (path[0] === 'reviews' && path[1] === 'product' && path.length === 4 && path[3] === 'rating' && method === 'GET') return productRating(request, int(path[2]))
    if (method === 'POST' && key === 'reviews') return createReview(request)
    if (path[0] === 'reviews' && path.length === 2 && method === 'DELETE') return deleteReview(request, int(path[1]))

    if (method === 'GET' && key === 'wishlist') return getWishlist(request)
    if (method === 'POST' && key === 'wishlist') return toggleWishlist(request)
    if (method === 'POST' && key === 'contact') return contact(request)

    if (method === 'POST' && key === 'upload-image') return uploadImage(request)
    if (method === 'POST' && key === 'users/profile-image') return uploadImage(request, { profile: true })
    if (method === 'POST' && key === 'upload-signature') return uploadSignature(request)

    return apiError(request, 'API route not found', 404)
  } catch (error) {
    console.error(`API ${method} /api/${key}:`, error)
    return apiError(request, error.message || 'Internal server error', error.status || (error.code === 'P2025' ? 404 : 500))
  }
}
