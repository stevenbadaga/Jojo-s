import { prisma } from './prisma'
import { apiError, json } from './http'
import { currentUser } from './security'

const serialize = (item) => ({
  id: item.id,
  order_id: item.orderId,
  type: item.type,
  title: item.title,
  message: item.message,
  read: item.read,
  created_at: item.createdAt,
})

export async function listNotifications(request) {
  const user = await currentUser(request)
  const rows = await prisma.appNotification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })
  return json(request, rows.map(serialize))
}

export async function markNotificationRead(request, id) {
  const user = await currentUser(request)
  const existing = await prisma.appNotification.findFirst({ where: { id, userId: user.id } })
  if (!existing) return apiError(request, 'Notification not found', 404)
  const row = await prisma.appNotification.update({ where: { id }, data: { read: true } })
  return json(request, serialize(row))
}

export async function markAllNotificationsRead(request) {
  const user = await currentUser(request)
  await prisma.appNotification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } })
  return json(request, { success: true })
}
