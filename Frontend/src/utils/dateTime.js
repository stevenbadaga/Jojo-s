export const RWANDA_TIME_ZONE = 'Africa/Kigali'

export const parseBackendDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value

  const raw = String(value).trim()
  if (!raw) return null

  // Spring (LocalDateTime) often serializes without a timezone. In production (Render/Postgres),
  // these timestamps are typically effectively UTC, so we treat "no TZ" as UTC.
  const hasTimeZone = /Z$|[+-]\d{2}:?\d{2}$/.test(raw)
  const iso = hasTimeZone ? raw : `${raw}Z`

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export const formatDateTimeRwanda = (
  value,
  options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  locale = 'en-US'
) => {
  const date = parseBackendDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat(locale, { timeZone: RWANDA_TIME_ZONE, ...options }).format(date)
}

export const formatDateRwanda = (
  value,
  options = { year: 'numeric', month: 'short', day: 'numeric' },
  locale = 'en-US'
) => {
  const date = parseBackendDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat(locale, { timeZone: RWANDA_TIME_ZONE, ...options }).format(date)
}

export const getRwandaDateKey = (value) => {
  const date = value instanceof Date ? value : parseBackendDate(value)
  if (!date) return null
  // YYYY-MM-DD for stable comparisons.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: RWANDA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

