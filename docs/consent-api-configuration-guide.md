# API 配置指引 / API Configuration Guide

## 中文
- 目标
  - 记录 Cookie 同意与注册同意日志，包含 `ID、preferences(0–7)、status(allow|deny|custom)、timestamp、consent_time、IP、userAgent` 等，用于合规留痕。
  - 前端通过“主题设置中的 `Consent API base URL`”自动拼接 `.../api/consent` 并上报。

- 前端集成位置
  - `sections/cookie-banner.liquid`
    - 端点拼接与上报：`sections/cookie-banner.liquid:291-292`
    - 写入 Cookie 与生成 payload：`sections/cookie-banner.liquid:262-266`、`sections/cookie-banner.liquid:301`
    - 事件上报与关闭：
      - 接受并关闭：`sections/cookie-banner.liquid:308`
      - 拒绝并关闭：`sections/cookie-banner.liquid:309`
      - 偏好保存并关闭：`sections/cookie-banner.liquid:316`
    - 初始化弹窗（有任何同意记录则不再弹窗）：`sections/cookie-banner.liquid:304`
    - 政策链接（段落中的内联链接）：`sections/cookie-banner.liquid:98-100`
    - Cookie 拦截与清理（拒绝或自定义关闭时）：
      - 启用拦截：`sections/cookie-banner.liquid:287`
      - 清理非必需 Cookie：`sections/cookie-banner.liquid:289`
      - 关闭拦截（接受全部）：`sections/cookie-banner.liquid:292`
      - 根据状态应用拦截：`sections/cookie-banner.liquid:290`
    - 日志监控（控制台输出）：
      - 写入尝试/允许/阻止：`sections/cookie-banner.liquid:287-290`
      - 周期扫描新增/移除：`sections/cookie-banner.liquid:305-307`
  - `sections/main-register.liquid`
  - `sections/footer.liquid`
    - 端点拼接：`sections/main-register.liquid:186-188`
    - 表单提交上报（含隐私/条款/营销）：`sections/main-register.liquid:191-213`

- 主题设置（必须配置）
  - 在主题编辑器中，将 Cookie Banner 区块的 `Consent API base URL` 设置为你的后端根地址。
    - 示例：`http://localhost:3000` 或 `https://your-domain.com`
    - 前端自动拼接：`https://your-domain.com/api/consent`

- 接口约定
  - `POST /api/consent`
    - 请求体（JSON）：
      - `id` 字符串（UUID）
      - `email` 字符串或 `null`
      - `privacy` 布尔（注册页）
      - `terms` 布尔（注册页）
      - `marketing` 布尔（注册页）
      - `preferences` 数字（0–7，3 位位图：功能=1、性能=2、定向=4；未勾选表示拒绝，对应置 1）
      - `status` 字符串：`allow | deny | custom`
      - `timestamp` 秒级时间戳
      - `consent_time` ISO 字符串
      - `userAgent` 字符串
      - `type` 固定：`cookie_consent`
  - 响应体（JSON）：
      - 成功：`{ ok: true, ip: "<客户端IP>" }`（参考 `sections/cookie-banner.liquid:180-181`）
      - 失败：`{ ok: false }`（500）
  - `GET /api/consent?limit=N`
    - 返回最近 N 条记录：`{ consents: [ ... ] }`（参考 `sections/cookie-banner.liquid:173-176`）

- 数据库表结构（SQLite 示例）
  - 字段：`id,email,privacy,terms,marketing,preferences,status,timestamp,consent_time,ip,userAgent,received_at`
  - 插入语句位置：`sections/cookie-banner.liquid:178-181`

- 服务端实现要点
  - IP 捕获（代理兼容）：`sections/cookie-banner.liquid:146-154`
    - 读取 `x-forwarded-for`（取第一个），兼容 `cf-connecting-ip`、`x-real-ip`、`fastly-client-ip`，回退到 `remoteAddress`
  - CORS 与预检：允许 `*`、`Content-Type`、方法 `GET, POST, OPTIONS`；`OPTIONS` 返回 204（`sections/cookie-banner.liquid:146`）
  - sendBeacon 行为：成功时前端无法读取响应体；仅在回退到 `fetch` 时，前端会打印服务端响应（`sections/cookie-banner.liquid:236-241`）。

- 部署步骤（示例：Node/Express）
  - 依赖：`express`、`sqlite3`
  - 端口：`PORT` 环境变量或默认 `3000`
  - 将后端部署到你的域名后，设置主题的 `Consent API base URL` 为该域名根地址。

- 测试方法
  - 在浏览器控制台查看日志：
    - 本地打印：`consent { endpoint, payload }`（`sections/cookie-banner.liquid:236-241`）
    - 回退 `fetch` 时打印：`consent saved { ok: true, ip: "..." }`
  - 数据库验证：检查插入新行，含 `ip` 与 `userAgent`。

- 合规与安全建议
  - IP 属于个人数据：可伪匿名（截断或哈希）再存储。
  - 保留期建议 180–395 天，定期清理。
  - 加强防护：限制来源、速率限制、审计日志。
  - 使用 HTTPS。

- 常见问题
  - 控制台 `endpoint: null`：未在主题设置配置 `Consent API base URL`。
  - 看不到响应：sendBeacon 成功不返回响应体；仅 `fetch` 回退会打印。
  - CORS 报错：后端需返回 `Access-Control-Allow-Origin: *` 并允许 `Content-Type` 头。

---

## English
- Goal
  - Persist cookie and registration consents with `id, preferences(0–7), status(allow|deny|custom), timestamp, consent_time, ip, userAgent` for compliance.
  - Frontend reads Theme setting `Consent API base URL` and posts to `.../api/consent`.

- Frontend integration points
  - `sections/cookie-banner.liquid`
    - Endpoint building and logging: `sections/cookie-banner.liquid:291-292`
    - Cookie write and payload creation: `sections/cookie-banner.liquid:262-266`, `sections/cookie-banner.liquid:301`
    - Event logging and closing:
      - Accept & close: `sections/cookie-banner.liquid:308`
      - Deny & close: `sections/cookie-banner.liquid:309`
      - Save preferences & close: `sections/cookie-banner.liquid:316`
    - Initial modal logic (do not open if any consent exists): `sections/cookie-banner.liquid:304`
    - Policy links (inline in paragraph): `sections/cookie-banner.liquid:98-100`
    - Cookie interception & cleanup:
      - Enable interception: `sections/cookie-banner.liquid:287`
      - Cleanup non-essential cookies: `sections/cookie-banner.liquid:289`
      - Disable interception on "Accept all": `sections/cookie-banner.liquid:292`
      - Apply by status: `sections/cookie-banner.liquid:290`
    - Logging:
      - Attempt/allowed/blocked: `sections/cookie-banner.liquid:287-290`
      - Periodic detection/removal scan: `sections/cookie-banner.liquid:305-307`

- Theme setting (required)
  - Set `Consent API base URL` in the Cookie Banner section to your backend base URL.
    - Example: `http://localhost:3000` or `https://your-domain.com`
    - Frontend posts to: `https://your-domain.com/api/consent`

- API contract
  - `POST /api/consent`
    - Request (JSON):
      - `id` (UUID), `email` (string or null), `privacy` (bool), `terms` (bool), `marketing` (bool)
      - `preferences` (number 0–7; bits: 1=functionality, 2=performance, 4=targeting; 1 means denied)
      - `status` (`allow | deny | custom`), `timestamp` (unix seconds), `consent_time` (ISO), `userAgent` (string), `type` (`cookie_consent`)
    - Response (JSON):
      - Success: `{ ok: true, ip: "<client_ip>" }` (see `sections/cookie-banner.liquid:180-181`)
      - Failure: `{ ok: false }` (500)
  - `GET /api/consent?limit=N`
    - Returns latest N records: `{ consents: [ ... ] }` (see `sections/cookie-banner.liquid:173-176`)

- Database schema (SQLite example)
  - Columns: `id,email,privacy,terms,marketing,preferences,status,timestamp,consent_time,ip,userAgent,received_at`
  - Insert reference: `sections/cookie-banner.liquid:178-181`

- Backend notes
  - IP extraction (proxy-aware): `sections/cookie-banner.liquid:146-154`
    - Use `x-forwarded-for` (first value), support `cf-connecting-ip`, `x-real-ip`, `fastly-client-ip`, fallback `remoteAddress`
  - CORS & preflight: allow `*`, `Content-Type`, methods `GET, POST, OPTIONS`; respond 204 for `OPTIONS` (`sections/cookie-banner.liquid:146`).
  - sendBeacon: response body is not accessible on success; frontend prints server response only on `fetch` fallback (`sections/cookie-banner.liquid:236-241`).

- Deployment (Node/Express example)
  - Dependencies: `express`, `sqlite3`
  - Port: `PORT` env or default `3000`
  - Deploy to your domain, then set Theme `Consent API base URL` accordingly.

- Testing
  - Browser console:
    - Local print: `consent { endpoint, payload }` (`sections/cookie-banner.liquid:236-241`)
    - Fetch fallback: `consent saved { ok: true, ip: "..." }`
  - DB: verify inserted rows with `ip` and `userAgent`.

- Compliance & security
  - IP is personal data: consider pseudonymization (truncate or hash) before storage.
  - Retention: 180–395 days, scheduled cleanup.
  - Hardening: restrict origins, rate limit, audit logging.
  - Enforce HTTPS.

- Troubleshooting
  - `endpoint: null`: Theme `Consent API base URL` not configured.
  - No response printed: sendBeacon success does not expose response; only `fetch` fallback prints it.
  - CORS errors: set `Access-Control-Allow-Origin: *` and allow `Content-Type` header.
