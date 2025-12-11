# 迁移指引：不使用 nip.io 的 HTTPS 部署

适用场景：后端已运行在 `localhost:3000`，需要为非 `nip.io` 域名（如 `sslip.io` 或自有域名）提供 HTTPS 并反向代理到该端口，供 Shopify 前端通过 `Consent API base URL` 调用。

## 域名选择
- sslip.io：`consent-api.<IP>.sslip.io` 或 `<IP>.sslip.io`，无需自行添加 DNS 记录，域名自动解析到该 IP。
- 自有域名：在你的 DNS 服务商添加 `A`（IPv4）/`AAAA`（IPv6）记录指向服务器 IP。
- 要求：对外需开放 `80/443`，用于申请与提供证书。

## 推荐：使用 Caddy 自动证书
1) 编辑 `/etc/caddy/Caddyfile`，添加你的域名站点块：
```
example.com {
    reverse_proxy localhost:3000
    header Access-Control-Allow-Origin "*"
    header Access-Control-Allow-Methods "GET, POST, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization"
    @options { method OPTIONS }
    respond @options 204
}
```
- 若使用 sslip.io：
```
consent-api.<IP>.sslip.io {
    reverse_proxy localhost:3000
    header Access-Control-Allow-Origin "*"
    header Access-Control-Allow-Methods "GET, POST, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type, Authorization"
    @options { method OPTIONS }
    respond @options 204
}
```

2) 验证并重载：
```
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

3) 测试：
```
curl -I https://example.com/api/consent
curl https://example.com/api/consent?limit=5
curl -I https://example.com/consents.csv
```

## 备用：使用 Nginx + Certbot
1) HTTP 与 ACME 验证（`/etc/nginx/sites-available/consent-api`）：
```
server {
  listen 80;
  server_name example.com;
  location /.well-known/acme-challenge/ { root /var/www/html; }
  location / { return 301 https://$host$request_uri; }
}
```

2) 申请证书（自动写入并启用 443）：
```
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d example.com --agree-tos -m you@example.com --redirect
```

3) 若需手动 443 反代配置：
```
server {
  listen 443 ssl http2;
  server_name example.com;
  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
  location / {
    if ($request_method = OPTIONS) { return 204; }
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods GET,POST,OPTIONS always;
    add_header Access-Control-Allow-Headers Content-Type,Authorization always;
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

4) 启用并重载：
```
sudo ln -sf /etc/nginx/sites-available/consent-api /etc/nginx/sites-enabled/consent-api
sudo nginx -t && sudo systemctl reload nginx
```

## Shopify 主题设置
- 将 Cookie Banner 的 `Consent API base URL` 设置为你的 HTTPS 域名根地址（例如 `https://example.com`）。
- 代码参考：
  - 读取设置并拼接端点：`sections/cookie-banner.liquid:348-349`、`sections/cookie-banner.liquid:295`
  - Consent log 页面端点拼接与拉取：`sections/consent-log.liquid:38-45`

## 接口速览（后端）
- 写入：`POST /api/consent`（`consent-api/index.js:48`）
- 列表：`GET /api/consent?limit=N`（`consent-api/index.js:79`）
- 全量：`GET /api/consents`（`consent-api/index.js:90`）
- CSV：`GET /consents.csv`（`consent-api/index.js:99`）
- 表格页：`GET /consents`（`consent-api/index.js:111`）

## 验证清单
- DNS 指向正确（自有域名）或使用正确的 sslip.io 域名。
- 对外开放 `80/443`（防火墙或安全组）。
- 服务端口 `3000` 正在监听。
- 通过浏览器或 curl 验证：
  - `https://your-domain/api/consent?limit=5`
  - `https://your-domain/consents`
  - `https://your-domain/consents.csv`

## 常见问题与排错
- ERR_SSL_PROTOCOL_ERROR：未配置站点或证书未颁发；检查 `Caddyfile` 或 Nginx/Certbot 状态。
- 403/404：检查反代目标与接口路径是否为 `/api/consent` 等正确路径。
- CORS 报错：确保返回 `Access-Control-Allow-Origin` 与允许 `Content-Type`，并处理 `OPTIONS` 204。
- ACME 验证失败：确保 `80` 可达、无强制跳转阻断 `/.well-known/acme-challenge/`（Nginx 示例已保留该路径）。

## 迁移步骤（从 nip.io 到自有域/sslip.io）
- 选定域名并完成 DNS（自有域名）或直接选用 `sslip.io` 域名。
- 在 Caddy 或 Nginx 上添加站点并启用 HTTPS 反代到 `localhost:3000`。
- 在 Shopify 主题设置更新 `Consent API base URL` 为新的 HTTPS 域名。
- 触发一次同意/表单提交，验证 `/consents` 与 `/api/consent?limit=100` 出现记录。

