export function userJson(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    city: user.city,
    country: user.country,
    profileImageUrl: user.profileImageUrl,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    active: user.active,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    role: user.role,
  }
}

export function productJson(product) {
  if (!product) return null
  const stockQuantity = Math.max(0, product.stockQuantity ?? 0)
  const lowStockThreshold = Math.max(0, product.lowStockThreshold ?? 5)
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    sku: product.sku,
    unit: product.unit || 'item',
    price: product.price,
    image: product.image,
    in_stock: Boolean(product.inStock && stockQuantity > 0),
    stock_quantity: stockQuantity,
    low_stock_threshold: lowStockThreshold,
    stock_status: stockQuantity <= 0 ? 'OUT_OF_STOCK' : stockQuantity <= lowStockThreshold ? 'LOW_STOCK' : 'HEALTHY',
    is_promo: product.isPromo,
    original_price: product.originalPrice,
    discount: product.discount,
    active: product.active,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export function reviewJson(review) {
  if (!review) return null
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    userName: review.userName,
    userEmail: review.userEmail,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }
}

export function orderItemJson(item) {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.quantity * item.unitPrice,
    product: item.product ? productJson(item.product) : undefined,
  }
}

export function orderJson(order) {
  if (!order) return null
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    channel: order.channel,
    subtotal: order.subtotal,
    delivery_option: order.deliveryOption,
    delivery_fee: order.deliveryFee,
    delivery_location: order.deliveryLocation,
    total: order.subtotal + (order.deliveryFee || 0),
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
    items: Array.isArray(order.items) ? order.items.map(orderItemJson) : undefined,
  }
}

export function addressJson(address) {
  return {
    id: address.id,
    label: address.label,
    street: address.street,
    city: address.city,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
  }
}

export function preferencesJson(prefs) {
  return {
    id: prefs.id,
    language: prefs.language,
    currency: prefs.currency,
    theme: prefs.theme,
    dateFormat: prefs.dateFormat,
    timezone: prefs.timezone,
    createdAt: prefs.createdAt,
  }
}

export function notificationsJson(notifications) {
  return {
    id: notifications.id,
    emailOrderUpdates: notifications.emailOrderUpdates,
    emailPromotions: notifications.emailPromotions,
    emailNewsletters: notifications.emailNewsletters,
    smsOrderUpdates: notifications.smsOrderUpdates,
    smsPromotions: notifications.smsPromotions,
    createdAt: notifications.createdAt,
  }
}
