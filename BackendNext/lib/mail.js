import nodemailer from 'nodemailer'

function mailConfig() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  if (!host || !user || !pass) return null

  return {
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass },
  }
}

export async function sendMail({ to, subject, text, html }) {
  const config = mailConfig()
  if (!config) return { sent: false, reason: 'not-configured' }

  const transporter = nodemailer.createTransport(config)
  await transporter.sendMail({
    from: process.env.APP_MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })
  return { sent: true }
}

export async function sendVerificationEmail(user, token) {
  const base = (process.env.APP_FRONTEND_URL || '').replace(/\/$/, '')
  const url = `${base}/verify-email?token=${encodeURIComponent(token)}`
  return sendMail({
    to: user.email,
    subject: 'Verify your MarketMet email',
    text: `Verify your MarketMet email: ${url}`,
    html: `<p>Welcome to MarketMet.</p><p><a href="${url}">Verify your email</a></p>`,
  })
}

export async function sendPasswordResetEmail(user, token) {
  const base = (process.env.APP_FRONTEND_URL || '').replace(/\/$/, '')
  const url = `${base}/reset-password?token=${encodeURIComponent(token)}`
  return sendMail({
    to: user.email,
    subject: 'Reset your MarketMet password',
    text: `Reset your password: ${url}`,
    html: `<p>Use the link below to reset your MarketMet password.</p><p><a href="${url}">Reset password</a></p>`,
  })
}

export async function sendTwoFactorCode(user, code) {
  return sendMail({
    to: user.email,
    subject: 'Your MarketMet verification code',
    text: `Your MarketMet verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your MarketMet verification code is:</p><h2>${code}</h2><p>It expires in 10 minutes.</p>`,
  })
}
