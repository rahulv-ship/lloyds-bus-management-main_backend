const nodemailer = require('nodemailer')
const QRCode = require('qrcode')
const crypto = require('crypto')

function toBase64Url(str) {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4))
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64').toString('utf-8')
}

function buildPassPayload(data) {
  if (!data || !data.token) return null

  const lines = [
    'EMPLOYEE BUS PASS',
    '-----------------',
    `Pass No  : ${data.passNumber || '—'}`,
    `Employee : ${data.employeeName || '—'}`,
    `Emp ID   : ${data.employeeCode || '—'}`,
    `Dept     : ${data.department || '—'}`,
    `Route    : ${[data.routeNumber, data.routeName].filter(Boolean).join(' - ') || '—'}`,
    `Bus      : ${data.busNumber || '—'}`,
    `Shift    : ${data.shiftName || '—'}`,
    `Pickup   : ${data.pickupName || '—'}`,
    `Drop     : ${data.dropName || '—'}`,
    `Valid    : ${data.validFrom || '—'} to ${data.validTo || '—'}`,
    `Token    : ${data.token}`,
  ]

  return lines.join('\n')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
  },
})

async function generateQRDataURL(payload) {
  if (!payload) return null
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: 'H',
      color: { dark: '#0f2a3d', light: '#ffffff' },
    })
    return dataUrl
  } catch (err) {
    console.error('QR generation failed:', err)
    return null
  }
}

async function sendQRCodeEmail({ to, pass }) {
  if (!to) {
    throw new Error('Recipient email is required')
  }

  const payload = buildPassPayload(pass)

  if (!payload) {
    throw new Error('Unable to build QR payload: missing pass token')
  }

  const qrDataUrl = await generateQRDataURL(payload)

  if (!qrDataUrl) {
    throw new Error('Unable to generate QR code image')
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f2a3d; max-width: 600px; margin: auto;">
      <h2 style="color: #0f2a3d;">Your Employee Bus Pass</h2>
      <p>Hello ${pass.employeeName || 'Employee'},</p>
      <p>Your bus pass has been approved. Please find your digital pass and QR code below.</p>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; background: #ffffff;">
        <p style="margin: 4px 0;"><strong>Pass Number:</strong> ${pass.passNumber || '—'}</p>
        <p style="margin: 4px 0;"><strong>Employee:</strong> ${pass.employeeName || '—'} (${pass.employeeCode || '—'})</p>
        <p style="margin: 4px 0;"><strong>Route:</strong> ${pass.routeNumber || '—'} - ${pass.routeName || '—'}</p>
        <p style="margin: 4px 0;"><strong>Bus:</strong> ${pass.busNumber || '—'}</p>
        <p style="margin: 4px 0;"><strong>Shift:</strong> ${pass.shiftName || '—'}</p>
        <p style="margin: 4px 0;"><strong>Pickup:</strong> ${pass.pickupName || '—'}</p>
        <p style="margin: 4px 0;"><strong>Destination:</strong> ${pass.dropName || '—'}</p>
        <p style="margin: 4px 0;"><strong>Valid From:</strong> ${pass.validFrom || '—'}</p>
        <p style="margin: 4px 0;"><strong>Valid To:</strong> ${pass.validTo || '—'}</p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <img src="${qrDataUrl}" alt="Bus Pass QR Code" style="width: 220px; height: 220px; border: 1px solid #e2e8f0; border-radius: 8px;" />
        <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Scan this QR code to board the bus</p>
      </div>

      <p style="color: #64748b; font-size: 12px;">Please keep this email for your records. Contact transport support if you have any issues.</p>
    </div>
  `

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Employee Bus Pass - QR Code',
    html,
  }

  const info = await transporter.sendMail(mailOptions)
  return info
}

module.exports = {
  sendQRCodeEmail,
}
