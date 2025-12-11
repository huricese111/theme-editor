import express from 'express'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import morgan from 'morgan'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const baseDir = path.resolve(process.cwd(), 'consent-api')
const dataDir = path.join(baseDir, 'data')
fs.mkdirSync(dataDir, { recursive: true })
const dbPath = process.env.DB_PATH || path.join(dataDir, 'consents.db')
const db = new Database(dbPath)
db.exec(
  'CREATE TABLE IF NOT EXISTS consents (id TEXT PRIMARY KEY, email TEXT, privacy INTEGER, terms INTEGER, marketing INTEGER, timestamp INTEGER, consent_time TEXT, timezone TEXT, country TEXT, country_code TEXT, locale TEXT, userAgent TEXT, type TEXT, ip TEXT)'
)

const app = express()
app.set('trust proxy', true)
app.use(morgan('combined'))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
})

app.use((req, _res, next) => {
  const ct = (req.headers['content-type'] || '').toLowerCase()
  const chunks = []
  req.on('data', c => chunks.push(c))
  req.on('end', () => {
    const raw = Buffer.concat(chunks).toString('utf8')
    let body = null
    if (ct.includes('application/json')) {
      try { body = JSON.parse(raw || '{}') } catch { body = {} }
    } else if (raw) {
      try { body = JSON.parse(raw) } catch { body = { raw } }
    } else {
      body = {}
    }
    req.body = body
    next()
  })
})

app.post('/api/consent', (req, res) => {
  const b = req.body || {}
  const rec = {
    id: String(b.id || ''),
    email: String(b.email || ''),
    privacy: b.privacy ? 1 : 0,
    terms: b.terms ? 1 : 0,
    marketing: b.marketing ? 1 : 0,
    timestamp: Number(b.timestamp || Math.floor(Date.now() / 1000)),
    consent_time: String(b.consent_time || ''),
    timezone: String(b.timezone || ''),
    country: String(b.country || ''),
    country_code: String(b.country_code || ''),
    locale: String(b.locale || ''),
    userAgent: String(b.userAgent || ''),
    type: String(b.type || ''),
    ip: String(
      (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString()
    )
  }
  try {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO consents (id, email, privacy, terms, marketing, timestamp, consent_time, timezone, country, country_code, locale, userAgent, type, ip) VALUES (@id, @email, @privacy, @terms, @marketing, @timestamp, @consent_time, @timezone, @country, @country_code, @locale, @userAgent, @type, @ip)'
    )
    stmt.run(rec)
    res.status(201).json({ ok: true })
  } catch {
    res.status(500).json({ ok: false })
  }
})

app.get('/api/consents', (_req, res) => {
  try {
    const list = db.prepare('SELECT * FROM consents ORDER BY timestamp DESC LIMIT 500').all()
    res.json(list)
  } catch {
    res.status(500).json([])
  }
})

app.get('/consents.csv', (_req, res) => {
  try {
    const rows = db.prepare('SELECT id,email,privacy,terms,marketing,timestamp,consent_time,timezone,country,country_code,locale,userAgent,type,ip FROM consents ORDER BY timestamp DESC').all()
    const header = 'id,email,privacy,terms,marketing,timestamp,consent_time,timezone,country,country_code,locale,userAgent,type,ip\n'
    const csv = header + rows.map(r => [r.id, r.email, r.privacy, r.terms, r.marketing, r.timestamp, r.consent_time, r.timezone, r.country, r.country_code, r.locale, (r.userAgent || '').replace(/"/g, ''), r.type, r.ip].map(v => String(v)).map(v => v.includes(',') ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')).join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.send(csv)
  } catch {
    res.status(500).send('')
  }
})

app.get('/consents', (_req, res) => {
  try {
    const rows = db.prepare('SELECT id,email,privacy,terms,marketing,timestamp,consent_time,timezone,country,country_code,locale,userAgent,type,ip FROM consents ORDER BY timestamp DESC LIMIT 500').all()
    const htmlHead = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Consents</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:#f8fafc;margin:0;padding:24px}h1{margin:0 0 16px}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}th,td{padding:10px 12px;border-bottom:1px solid #eef2f7;font-size:13px}th{background:#f1f5f9;text-align:left}tbody tr:hover{background:#f9fafb}code{font-size:12px;color:#334155}a.btn{display:inline-block;margin-bottom:12px;padding:8px 12px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:6px}a.btn:visited{color:#fff}</style>`
    const header = '<h1>Consent Records</h1><a class="btn" href="/consents.csv">Download CSV</a>'
    const headerRow = '<tr><th>Email</th><th>Privacy</th><th>Terms</th><th>Marketing</th><th>Time</th><th>Timezone</th><th>Country</th><th>Locale</th><th>User Agent</th><th>IP</th></tr>'
    const bodyRows = rows.map(r => `<tr><td>${escapeHtml(r.email||'')}</td><td>${r.privacy? 'Yes':'No'}</td><td>${r.terms? 'Yes':'No'}</td><td>${r.marketing? 'Yes':'No'}</td><td>${escapeHtml(r.consent_time||String(r.timestamp))}</td><td>${escapeHtml(r.timezone||'')}</td><td>${escapeHtml(r.country||'')}</td><td>${escapeHtml(r.locale||'')}</td><td><code>${escapeHtml((r.userAgent||'').slice(0,200))}</code></td><td>${escapeHtml(r.ip||'')}</td></tr>`).join('')
    const html = `${htmlHead}<body>${header}<table>${headerRow}${bodyRows}</table></body></html>`
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch {
    res.status(500).send('')
  }
})

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

app.listen(PORT, () => {})

