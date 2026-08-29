import { NextResponse } from 'next/server'

const configuredOrigins = (process.env.APP_CORS_ALLOWED_ORIGINS || process.env.APP_FRONTEND_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

export function corsHeaders(request) {
  const origin = request.headers.get('origin')
  const allowOrigin = !origin
    ? configuredOrigins[0] || '*'
    : configuredOrigins.length === 0 || configuredOrigins.includes(origin)
      ? origin
      : configuredOrigins[0] || origin

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    'Cache-Control': 'no-store',
  }
}

export function json(request, data, status = 200, extraHeaders = {}) {
  return NextResponse.json(data, {
    status,
    headers: {
      ...corsHeaders(request),
      ...extraHeaders,
    },
  })
}

export function empty(request, status = 204) {
  return new NextResponse(null, { status, headers: corsHeaders(request) })
}

export function apiError(request, message, status = 400) {
  return json(request, { error: message }, status)
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

export function int(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}
