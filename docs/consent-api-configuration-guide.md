# API 配置指引 / API Configuration Guide

## 中文
- 目标
  - 记录注册同意与增强表单同意日志，包含 `id、preferences(0–7)、status(allow|deny|custom)、timestamp、consent_time、ip、userAgent` 等，用于合规留痕。
  - 统一使用“完整 API URL”进行上报，不再自动拼接路径。

- 涉及文件
  - 片段：`snippets/consent-logger.liquid:11` 读取全局 `settings.consent_api_url` 并上报
  - 注册页：`sections/main-register.liquid:61,68` 读取全局隐私/条款链接；`190–198` 调用片段
  - 增强表单：`sections/enhanced-form.liquid:1398,1405` 读取全局隐私/条款链接；`1514–1522` 调用片段（含 `formTitle`）
  - 同意日志列表：`sections/consent-log.liquid:43–49` 使用全局完整端点拉取
  - 主题设置：`config/settings_schema.json:1761–1789` 增加并维护 `privacy_policy_url`、`terms_policy_url`、`consent_api_url`、`privacy_version`、`terms_version`
  - 模板：`templates/page.consent-log.json:6–11` 移除本地端点字段，改为使用全局
  - 服务端示例：`consent-api/index.js` 提供默认路由 `/api/consent`、`/api/consents`、`/consents.csv`

- 前端配置（新设计）
  - 在主题「Consent & Legal」中填写：
    - `Privacy policy link`、`Terms of service link`（完整或相对 URL；前端会规范化）
    - `Consent API URL`（填写完整端点，如 `https://your-domain.com/api/consent`）
    - `Privacy policy version`、`Terms of service version`（可选，用于日志版本留痕）

- 前端集成与行为
  - 所有上报统一通过片段：`snippets/consent-logger.liquid:11–16`
    - 直接使用全局 `Consent API URL`，不再拼接 `/api/consent`
    - `sendBeacon` 成功则不可读取响应体，失败回退 `fetch`
  - 注册页：必须勾选法律同意才可提交；营销开关默认关闭（`sections/main-register.liquid:204–209`）
    - 仅当营销开关开启且显示复选框时，未勾选会追加隐藏字段 `customer[accepts_marketing]=false`
  - 增强表单：必须勾选法律同意才可提交；营销开关默认关闭（`sections/enhanced-form.liquid:1536–1541`）
    - 记录 `formTitle` 便于区分来源
  - 同意日志列表：通过全局端点请求最近记录（`sections/consent-log.liquid:43–49`）

- 已移除的节级配置
  - `sections/main-register.liquid` 与 `sections/enhanced-form.liquid` 不再包含：
    - `privacy_policy_url`、`terms_policy_url`、`consent_api_base`、`privacy_version`、`terms_version`
  - 请在主题全局配置「Consent & Legal」维护上述字段

- 接口约定（推荐）
  - 推荐服务端提供 `POST /api/consent`；前端可配置任意完整端点（例如自定义路径），只需与后端一致
  - 请求（JSON）：
    - `id`（UUID）、`email`（字符串或 `null`）
    - `privacy`、`terms`（布尔）、`marketing`（三态：`true | false | undefined`；当营销开关未开启或复选框未渲染时，该字段不发送）
    - `preferences`（数字 0–7；位图：功能=1、性能=2、定向=4；未勾选表示拒绝）
    - `status`（`allow | deny | custom`）、`timestamp`（秒）、`consent_time`（本地时间+时区）
    - `userAgent`、`type`（`registration_consent | enhanced_form_consent`）
    - 其他：`formTitle`（增强表单）
  - 响应（JSON）：
    - 成功：`{ ok: true }`；失败：`{ ok: false }`
  - 查询（示例）：`GET <Consent API URL>?limit=N` 返回最近 N 条 `{ consents: [ ... ] }`

- 数据库（SQLite 示例）
  - 列：`id,email,privacy,terms,marketing,preferences,status,timestamp,consent_time,ip,userAgent,domain,page_url,privacy_version,terms_version,received_at`

- 服务端要点
  - IP 捕获（代理兼容）：优先 `x-forwarded-for`，兼容 `cf-connecting-ip`、`x-real-ip`、`fastly-client-ip`，回退 `remoteAddress`
  - CORS 与预检：允许 `*`、`Content-Type`；方法 `GET, POST, OPTIONS`；`OPTIONS` 返回 204
  - sendBeacon：成功不暴露响应体；仅在回退到 `fetch` 时可见

- 部署（Node/Express 示例）
  - 依赖：`express`、`better-sqlite3`、`morgan`
  - 路由参考：`consent-api/index.js` 默认实现 `/api/consent`、`/api/consents`、`/consents.csv`

- 测试
  - 浏览器控制台查看打印：`consent payload`
  - 后端数据库：验证新记录含 `ip`、`userAgent`、`domain`、`page_url`

- 合规与安全
  - IP 属于个人数据：建议伪匿名（截断或哈希）
  - 建议保留期 180–395 天，定期清理
  - 加固：限制来源、速率限制、审计日志；务必使用 HTTPS

- 常见问题
  - `endpoint: null`：前端未在全局配置 `Consent API URL`
  - 看不到响应：sendBeacon 成功不返回响应体；仅 `fetch` 回退会打印
  - CORS 报错：后端需返回 `Access-Control-Allow-Origin: *` 并允许 `Content-Type`

---

## English
- Goal
  - Persist registration and enhanced form consents with `id, preferences(0–7), status(allow|deny|custom), timestamp, consent_time, ip, userAgent`.
  - Use a single “full API URL” for posting; no path concatenation on the frontend.

- Files involved
  - Snippet: `snippets/consent-logger.liquid:11` reads global `settings.consent_api_url`
  - Register page: `sections/main-register.liquid:61,68` reads global privacy/terms; `190–198` invokes snippet
  - Enhanced Form: `sections/enhanced-form.liquid:1398,1405` reads global privacy/terms; `1514–1522` invokes snippet (`formTitle`)
  - Theme settings: `config/settings_schema.json:1761–1789` maintain `privacy_policy_url`/`terms_policy_url`/`consent_api_url`/versions
  - Backend sample: `consent-api/index.js` routes `/api/consent`, `/api/consents`, `/consents.csv`

- Frontend configuration (new design)
  - In “Consent & Legal”, set:
    - `Privacy policy link`, `Terms of service link`
    - `Consent API URL` (a full endpoint, e.g. `https://your-domain.com/api/consent`)
    - Optional versions: `Privacy policy version`, `Terms of service version`

- Frontend integration & behavior
  - Posting via `snippets/consent-logger.liquid` using the full endpoint (no concatenation)
  - Register page: legal consent required; marketing toggle default off. Only when the marketing toggle is enabled and the checkbox is rendered, unchecked will append hidden `customer[accepts_marketing]=false`
  - Enhanced Form: legal consent required; marketing toggle default off; includes `formTitle`
  - Consent log: fetches recent records from the configured endpoint

- Removed per-section settings
  - The two sections no longer contain: `privacy_policy_url`, `terms_policy_url`, `consent_api_base`, `privacy_version`, `terms_version`
  - Maintain them globally in theme settings

- API contract (recommended)
  - Backend provides `POST /api/consent`; frontend accepts any full URL as long as it matches the backend
  - Request: `id`, `email`, `privacy`, `terms`, `marketing` (tri-state: `true | false | undefined`), `preferences`, `status`, `timestamp`, `consent_time`, `userAgent`, `type`, optional `formTitle`
  - Response: `{ ok: true }` or `{ ok: false }`
  - Query: `GET <Consent API URL>?limit=N` → `{ consents: [ ... ] }`

- Database schema (SQLite example)
  - Columns: `id,email,privacy,terms,marketing,preferences,status,timestamp,consent_time,ip,userAgent,domain,page_url,privacy_version,terms_version,received_at`

- Backend notes
  - IP extraction: `x-forwarded-for` (first), support `cf-connecting-ip`, `x-real-ip`, `fastly-client-ip`, fallback `remoteAddress`
  - CORS: allow `*`, `Content-Type`, methods `GET, POST, OPTIONS`; `OPTIONS` → 204
  - sendBeacon: no response body on success; `fetch` fallback prints

- Deployment (Node/Express)
  - Dependencies: `express`, `better-sqlite3`, `morgan`
  - Example routes: `/api/consent`, `/api/consents`, `/consents.csv`

- Testing
  - Inspect console prints: `consent payload`
  - Verify DB inserts include `ip`, `userAgent`, `domain`, `page_url`

- Compliance & security
  - Treat IP as personal data; consider pseudonymization
  - Retention 180–395 days with cleanup
  - Hardened setup: origin restriction, rate limiting, audit logging; enforce HTTPS

- Troubleshooting
  - `endpoint: null`: global `Consent API URL` is not configured
  - No response printed: sendBeacon success does not expose body; only visible in `fetch` fallback
  - CORS errors: set `Access-Control-Allow-Origin: *` and allow `Content-Type`
