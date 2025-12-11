import express from 'express'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import morgan from 'morgan'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const baseDir = path.dirname(new URL(import.meta.url).pathname)
const dataDir = path.join(baseDir, 'data')
fs.mkdirSync(dataDir, { recursive: true })
const dbPath = process.env.DB_PATH || path.join(dataDir, 'consents.db')
const db = new Database(dbPath)
db.exec(
  'CREATE TABLE IF NOT EXISTS consents (id TEXT PRIMARY KEY, email TEXT, privacy INTEGER, terms INTEGER, marketing INTEGER, timestamp INTEGER, consent_time TEXT, timezone TEXT, country TEXT, country_code TEXT, locale TEXT, userAgent TEXT, type TEXT, ip TEXT, domain TEXT, page_url TEXT, privacy_version TEXT, terms_version TEXT)'
)
try {
  const cols = db.prepare('PRAGMA table_info(consents)').all().map(r => r.name)
  if (!cols.includes('domain')) db.exec('ALTER TABLE consents ADD COLUMN domain TEXT')
  if (!cols.includes('page_url')) db.exec('ALTER TABLE consents ADD COLUMN page_url TEXT')
  if (!cols.includes('privacy_version')) db.exec('ALTER TABLE consents ADD COLUMN privacy_version TEXT')
  if (!cols.includes('terms_version')) db.exec('ALTER TABLE consents ADD COLUMN terms_version TEXT')
} catch {}

const app = express()
app.set('trust proxy', true)
app.use(morgan('combined'))
app.use('/consent-assets', express.static(baseDir))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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
  let domain = ''
  let pageUrl = ''
  try {
    domain = String(b.domain || '')
    pageUrl = String(b.page_url || '')
  } catch {}
  if (!domain) {
    const o = String((req.headers['origin'] || '')).trim()
    const r = String((req.headers['referer'] || '')).trim()
    const src = r || o
    if (src) {
      try { domain = new URL(src).hostname } catch {}
    }
  }
  if (!pageUrl) {
    const r = String((req.headers['referer'] || '')).trim()
    if (r) pageUrl = r
  }
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
    ),
    domain: String(domain || ''),
    page_url: String(pageUrl || ''),
    privacy_version: String(b.privacy_version || ''),
    terms_version: String(b.terms_version || '')
  }
  try {
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO consents (id, email, privacy, terms, marketing, timestamp, consent_time, timezone, country, country_code, locale, userAgent, type, ip, domain, page_url, privacy_version, terms_version) VALUES (@id, @email, @privacy, @terms, @marketing, @timestamp, @consent_time, @timezone, @country, @country_code, @locale, @userAgent, @type, @ip, @domain, @page_url, @privacy_version, @terms_version)'
    )
    stmt.run(rec)
    res.status(201).json({ ok: true })
  } catch {
    res.status(500).json({ ok: false })
  }
})

app.get('/api/consent', (req, res) => {
  try {
    const limit = Math.max(1, Math.min(1000, Number(req.query.limit || 100)))
    const stmt = db.prepare('SELECT id,email,privacy,terms,marketing,ip,consent_time,domain,page_url,privacy_version,terms_version FROM consents ORDER BY timestamp DESC LIMIT ?')
    const rows = stmt.all(limit)
    res.json({ consents: rows })
  } catch {
    res.status(500).json({ consents: [] })
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
    const rows = db.prepare('SELECT id,email,privacy,terms,marketing,timestamp,consent_time,timezone,country,country_code,locale,userAgent,type,ip,domain,page_url,privacy_version,terms_version FROM consents ORDER BY timestamp DESC').all()
    const header = 'id,email,privacy,terms,marketing,timestamp,consent_time,timezone,country,country_code,locale,userAgent,type,ip,domain,page_url,privacy_version,terms_version\n'
    const csv = header + rows.map(r => [r.id, r.email, r.privacy, r.terms, r.marketing, r.timestamp, r.consent_time, r.timezone, r.country, r.country_code, r.locale, (r.userAgent || '').replace(/"/g, ''), r.type, r.ip, r.domain, r.page_url, r.privacy_version, r.terms_version].map(v => String(v)).map(v => v.includes(',') ? '"' + v.replace(/"/g, '""') + '"' : v).join(',')).join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.send(csv)
  } catch {
    res.status(500).send('')
  }
})

app.get('/consents', (req, res) => {
  try {
    const q = String(req.query.q || '').trim()
    const type = String(req.query.type || '').trim()
    const page = Math.max(1, Number(req.query.page || 1))
    const pageSize = Math.max(1, Math.min(200, Number(req.query.pageSize || 50)))
    const sortByRaw = String(req.query.sortBy || 'timestamp').trim()
    const sortDirRaw = String(req.query.sortDir || 'desc').toLowerCase()
    const allowedSort = ['timestamp','email','privacy','terms','marketing','ip','domain','page_url']
    const sortBy = allowedSort.includes(sortByRaw) ? sortByRaw : 'timestamp'
    const sortDir = sortDirRaw === 'asc' ? 'asc' : 'desc'
    const where = []
    const params = []
    if (q) { where.push('(email LIKE ? OR domain LIKE ? OR page_url LIKE ?)'); params.push('%'+q+'%','%'+q+'%','%'+q+'%') }
    if (type) {
      const tk = type.toLowerCase()
      if (tk === 'registration') {
        where.push('LOWER(page_url) LIKE ?'); params.push('%account/register%')
      } else if (tk === 'contact') {
        where.push('LOWER(page_url) LIKE ?'); params.push('%contact%')
      } else if (tk === 'leasing') {
        where.push('(LOWER(page_url) LIKE ? OR LOWER(page_url) LIKE ? OR LOWER(page_url) LIKE ? OR LOWER(page_url) LIKE ?)')
        params.push('%jobrad%','%bikeleasing%','%dienstrad%','%business-bike%')
      }
    }
    const whereSql = where.length ? ('WHERE ' + where.join(' AND ')) : ''
    const offset = (page - 1) * pageSize
    const orderSql = `ORDER BY ${sortBy} ${sortDir.toUpperCase()}`
    const baseSelect = `SELECT id,email,privacy,terms,marketing,timestamp,consent_time,timezone,country,country_code,locale,type,ip,domain,page_url,privacy_version,terms_version FROM consents ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
    const rows = db.prepare(baseSelect).all(...params, pageSize, offset)
    const total = db.prepare(`SELECT COUNT(*) AS c FROM consents ${whereSql}`).get(...params).c
    const htmlHead = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Consents</title><style>:root{--bg:#f6f8fb;--card-bg:#ffffff;--text:#0f172a;--muted:#64748b;--border:#e5e7eb;--accent:#2563eb;--accent-2:#0ea5e9}*{box-sizing:border-box}body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;background:var(--bg);margin:0}a{color:var(--accent)}.wrap{width:100%;max-width:none;margin:0 auto;padding:24px}header.brand{display:flex;align-items:center;justify-content:space-between;margin:0 0 12px}header.brand .brand-left{display:flex;align-items:center;gap:12px}header.brand .logo{height:28px;display:block}header.brand h1{font-size:20px;margin:0;color:var(--text)}.btn{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 12px;border-radius:8px;background:var(--accent-2);color:#fff;text-decoration:none;border:0;cursor:pointer;box-shadow:0 1px 2px rgba(2,8,23,.06)}.btn:visited{color:#fff}.filters{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.filters input,.filters select,.filters button{height:34px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:#fff;font-size:13px;color:var(--text)}.table-card{background:var(--card-bg);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 24px rgba(2,8,23,.06);overflow:hidden}.table-wrap{width:100%;overflow:auto}.table{width:100%;border-collapse:separate;border-spacing:0}.table th,.table td{padding:10px 12px;border-bottom:1px solid #eef2f7;font-size:13px;color:var(--text)}.table thead th{position:sticky;top:0;background:#f8fafc;text-align:left}.table tbody tr:nth-child(even){background:#fbfcfe}.table tbody tr:hover{background:#f3f6fb}.table th a{color:var(--text);text-decoration:none}.table th a:hover{color:var(--accent)}.empty{color:var(--muted);text-align:center;padding:24px}.pager{display:flex;gap:8px;align-items:center;margin-top:12px;color:var(--muted)}.pager .total{margin-right:auto}.pager-pages a.page,.pager-pages span.page{display:inline-flex;align-items:center;justify-content:center;height:28px;min-width:28px;padding:0 8px;border:1px solid var(--border);border-radius:6px;color:var(--text);text-decoration:none;background:#fff}.pager-pages span.page.disabled{opacity:.5}.pager-pages span.page.active{background:var(--accent);color:#fff;border-color:var(--accent)}.pager-goto input{height:28px;padding:0 8px;border:1px solid var(--border);border-radius:6px}</style>`
    const baseParams = new URLSearchParams()
    if (q) baseParams.set('q', q)
    if (type) baseParams.set('type', type)
    baseParams.set('pageSize', String(pageSize))
    function sortLink(col){ const p = new URLSearchParams(baseParams); const next = (sortBy===col && sortDir==='asc')?'desc':'asc'; p.set('sortBy', col); p.set('sortDir', next); p.set('page','1'); return `?${p.toString()}` }
    function pageLink(n){ const p = new URLSearchParams(baseParams); p.set('sortBy', sortBy); p.set('sortDir', sortDir); p.set('page', String(n)); return `?${p.toString()}` }
    const header = `<header class="brand"><div class="brand-left"><img src="/consent-assets/HEPHA_Logo_JPG_1200px.jpg" alt="HEPHA" class="logo"><h1>Consent Records</h1></div><div class="brand-actions"><a class="btn" href="/consents.csv">Download CSV</a></div></header>`
    const controls = `<form class="filters" method="get"><input type="text" name="q" value="${escapeHtml(q)}" placeholder="Search"><select name="type"><option value="">All categories</option><option value="registration"${type==='registration'?' selected':''}>Registration</option><option value="contact"${type==='contact'?' selected':''}>Contact</option><option value="leasing"${type==='leasing'?' selected':''}>Leasing (All)</option></select><select name="pageSize"><option${pageSize===25?' selected':''} value="25">25</option><option${pageSize===50?' selected':''} value="50">50</option><option${pageSize===100?' selected':''} value="100">100</option></select><button type="submit" class="btn" style="background:#334155;color:#fff">Apply</button></form>`
    const headerRow = `<tr><th>No.</th><th><a href="${sortLink('email')}">Email</a></th><th><a href="${sortLink('privacy')}">Privacy</a></th><th><a href="${sortLink('terms')}">Terms</a></th><th><a href="${sortLink('marketing')}">Marketing</a></th><th><a href="${sortLink('timestamp')}">Time</a></th><th>Timezone</th><th>Country</th><th>IP</th><th><a href="${sortLink('domain')}">Domain</a></th><th><a href="${sortLink('page_url')}">Page URL</a></th><th>Privacy ver</th><th>Terms ver</th></tr>`
    const bodyRows = rows.map((r,i) => `<tr><td>${offset + i + 1}</td><td>${escapeHtml(r.email||'')}</td><td>${r.privacy? 'Yes':'No'}</td><td>${r.terms? 'Yes':'No'}</td><td>${r.marketing? 'Yes':'No'}</td><td>${escapeHtml(r.consent_time||String(r.timestamp))}</td><td>${escapeHtml(r.timezone||'')}</td><td>${escapeHtml(r.country||'')}</td><td>${escapeHtml(r.ip||'')}</td><td>${escapeHtml(r.domain||'')}</td><td>${r.page_url ? `<a href="${escapeHtml(r.page_url)}" target="_blank" rel="noopener">${escapeHtml(r.page_url)}</a>` : ''}</td><td>${escapeHtml(r.privacy_version||'')}</td><td>${escapeHtml(r.terms_version||'')}</td></tr>`).join('')
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const maxLinks = 9
    let start = Math.max(1, page - Math.floor(maxLinks/2))
    let end = Math.min(totalPages, start + maxLinks - 1)
    if (end - start + 1 < maxLinks) start = Math.max(1, end - maxLinks + 1)
    const prev = page>1 ? `<a class="page" href="${pageLink(page-1)}">&lt;</a>` : `<span class="page disabled">&lt;</span>`
    const next = page<totalPages ? `<a class="page" href="${pageLink(page+1)}">&gt;</a>` : `<span class="page disabled">&gt;</span>`
    const nums = Array.from({length: end-start+1}, (_,i)=>{
      const n = start + i
      return n===page ? `<span class="page active">${n}</span>` : `<a class="page" href="${pageLink(n)}">${n}</a>`
    }).join('')
    const pager = `<div class="pager"><span class="total">Total ${total} records</span><nav class="pager-pages">${prev}${nums}${next}</nav><form class="pager-goto" method="get" style="display:flex;gap:6px;align-items:center;margin-left:12px"><input type="hidden" name="q" value="${escapeHtml(q)}"><input type="hidden" name="type" value="${escapeHtml(type)}"><input type="hidden" name="sortBy" value="${escapeHtml(sortBy)}"><input type="hidden" name="sortDir" value="${escapeHtml(sortDir)}"><input type="hidden" name="pageSize" value="${String(pageSize)}"><span>Go to</span><input type="number" name="page" min="1" max="${totalPages}" value="${page}"><button class="btn" type="submit" style="height:28px;padding:0 10px;background:#334155;color:#fff">Go</button></form></div>`
    const html = `${htmlHead}<body><div class="wrap">${header}${controls}<div class="table-card"><div class="table-wrap"><table class="table">${headerRow}${rows.length?bodyRows:`<tr><td class="empty" colspan="13">No data</td></tr>`}</table></div></div>${pager}</div></body></html>`
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.send(html)
  } catch {
    res.status(500).send('')
  }
})

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

app.listen(PORT, () => {})
