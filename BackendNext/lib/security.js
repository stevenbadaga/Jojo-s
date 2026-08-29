import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma'

function jwtKey() {
  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-marketmet-jwt-secret-change-me' : '')
  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }
  return new TextEncoder().encode(secret)
}

export function adminEmails() {
  return (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email) {
  return Boolean(email) && adminEmails().includes(String(email).trim().toLowerCase())
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export async function signAuthToken(user) {
  const isAdmin = isAdminEmail(user.email) || String(user.role || '').toUpperCase() === 'ADMIN'
  const role = isAdmin ? 'ADMIN' : (user.role || 'CUSTOMER')

  return new SignJWT({
    userId: user.id,
    email: user.email,
    role,
    isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(jwtKey())
}

export async function verifyAuthToken(token) {
  const { payload } = await jwtVerify(token, jwtKey())
  return payload
}

export function bearerToken(request) {
  const header = request.headers.get('authorization') || ''
  if (!header.toLowerCase().startsWith('bearer ')) return null
  return header.slice(7).trim()
}

export async function currentUser(request, { optional = false } = {}) {
  const token = bearerToken(request)
  if (!token) {
    if (optional) return null
    throw Object.assign(new Error('Not authenticated'), { status: 401 })
  }

  try {
    const payload = await verifyAuthToken(token)
    const user = await prisma.user.findUnique({ where: { id: Number(payload.userId) } })
    if (!user || !user.active) {
      throw new Error('Account is unavailable')
    }
    return user
  } catch (error) {
    if (optional) return null
    throw Object.assign(new Error(error.message || 'Invalid authentication token'), { status: 401 })
  }
}

export async function requireAdmin(request) {
  const user = await currentUser(request)
  if (!isAdminEmail(user.email) && String(user.role).toUpperCase() !== 'ADMIN') {
    throw Object.assign(new Error('Admin access required'), { status: 403 })
  }
  return user
}

export async function bootstrapAdminForLogin(email, password) {
  if (!isAdminEmail(email)) return null

  const normalized = String(email).trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalized } })
  if (existing) return existing

  const bootstrapPassword = process.env.ADMIN_DEFAULT_PASSWORD
  if (!bootstrapPassword || password !== bootstrapPassword) return null

  return prisma.user.create({
    data: {
      email: normalized,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
      name: 'MarketMet Admin',
      emailVerified: true,
      active: true,
    },
  })
}
