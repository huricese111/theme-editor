# Consent API 快速迁移与部署指南

适用对象：开发同事在 Linux 服务器上快速更新并部署 `consent-api/index.js`，包含服务端运行、反向代理/隧道配置、验证与回滚。

## 概览
- 应用端口：默认 `3000`（可通过 `PORT` 覆盖）
- 数据库：`better-sqlite3`，文件默认位于 `data/consents.db`（可通过 `DB_PATH` 覆盖）
- 运行方式：`pm2` 守护进程
- 反向代理：`NGINX` 或 `cloudflared` 隧道二选一
- 自动迁移：服务启动时自动确保新增列（`domain/page_url/privacy_version/terms_version`）存在，无需手工迁移

## 前置要求
- Node.js 18+（原生支持 ESM `import`）
- 已安装依赖：在服务目录有 `package.json` 与 `node_modules`（包含 `better-sqlite3`、`express`、`morgan` 等）
- 已安装 PM2：`npm i -g pm2`
- 服务器具备以下目录结构：
  - `/root/consent-api/index.js`
  - `/root/consent-api/package.json`（需含 `type: "module"` 或使用 `.mjs`）
  - `/root/consent-api/node_modules`（生产依赖已安装）
  - `/root/consent-api/data/consents.db`（首次运行自动创建）

## 快速迁移
- 备份当前文件：
  - `cp /root/consent-api/index.js /root/consent-api/index.js.bak.$(date +%F-%H%M%S)`
- 从本地上传更新后的 `index.js`（任选其一）：
  - Windows PowerShell（已安装 Posh-SSH）：
    - `Import-Module Posh-SSH -Force`
    - `$sec = ConvertTo-SecureString '<服务器密码>' -AsPlainText -Force`
    - `$cred = New-Object System.Management.Automation.PSCredential('root',$sec)`
    - `$sess = New-SSHSession -ComputerName <服务器IP> -Credential $cred -AcceptKey`
    - `$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes('d:\Hepha Theme Editor\consent-api\index.js'))`
    - `Invoke-SSHCommand -SessionId $sess.SessionId -Command "echo '$b64' | base64 -d > /root/consent-api/index.js"`
  - 或使用 `scp`：
    - `scp d:\Hepha\Theme\Editor\consent-api\index.js root@<服务器IP>:/root/consent-api/index.js`

## 启动与重启
- 启动（首次）：
  - `pm2 start /root/consent-api/index.js --name consent-api --update-env`
  - `pm2 save`
  - `pm2 startup`（按提示执行，确保开机自启）
- 重启（更新后）：
  - `pm2 restart consent-api --update-env`
- 停止/删除：
  - `pm2 stop consent-api` / `pm2 delete consent-api`

## 环境变量
- `PORT`：服务监听端口，默认 `3000`
- `DB_PATH`：SQLite 路径，默认 `/root/consent-api/data/consents.db`
- 设置示例：
  - `PORT=3000 DB_PATH=/root/consent-api/data/consents.db pm2 restart consent-api --update-env`

## 反向代理 / 外网映射

### 方案 A：NGINX（推荐稳定域名）
- 安装并签发证书（略）
- 示例站点配置：
  - `/etc/nginx/sites-available/consent-api.conf`
  - 内容：
    ```
    server {
      listen 443 ssl;
      server_name consent.example.com;

      ssl_certificate /etc/letsencrypt/live/consent.example.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/consent.example.com/privkey.pem;

      location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:3000;
      }
    }
    ```
- 启用并重载：
  - `ln -s /etc/nginx/sites-available/consent-api.conf /etc/nginx/sites-enabled/`
  - `nginx -t && systemctl reload nginx`

### 方案 B：Cloudflare Tunnel（免开放端口）
- 安装 cloudflared 并登录（参考 Cloudflare 官方文档）
- 临时隧道（快速验证）：
  - `cloudflared tunnel --url http://localhost:3000 --logfile /var/log/cloudflared-3000.log`
- 长期隧道（建议）：
  - 创建命名隧道并在 Cloudflare 控制台绑定域名到 `http://localhost:3000`
  - 配置为服务并开机自启：
    - `cloudflared service install`
    - `systemctl enable cloudflared && systemctl start cloudflared`

## 验证与排错
- 健康检查：
  - `curl -s http://127.0.0.1:3000/consents | head -n 1`
  - 通过外网域名访问：`https://<域名>/consents`
- 查看进程与端口：
  - `pm2 list`
  - `pm2 logs consent-api --lines 50 --nostream`
  - `netstat -lnp | grep 3000`（确认端口占用）
- 常见错误：
  - `EADDRINUSE`：端口被占用。处理方式：`netstat -lnp | grep 3000` 找到并停止占用进程，或改用 `PORT` 指定新端口并更新反代。
  - `better-sqlite3` 依赖错误：确保使用与服务器架构匹配的 Node 版本，并在 `/root/consent-api` 内执行 `npm ci` 或 `npm install`。

## 回滚
- 恢复备份：
  - `cp /root/consent-api/index.js.bak.<时间戳> /root/consent-api/index.js`
  - `pm2 restart consent-api`

## 数据与导出
- 数据库文件：`/root/consent-api/data/consents.db`
- 导出 CSV：访问 `https://<域名>/consents.csv`

## 功能确认清单
- 列显示：`Domain`、`Page URL`、`Privacy ver`、`Terms ver` 可见
- 表行为：搜索、分类筛选（Registration/Contact/Leasing）、排序、分页器显示正常
- 新记录字段：`privacy_version` 与 `terms_version` 默认 `230220` 已入库

## 变更影响
- 自动列迁移会在首次启动时更新表结构；旧数据对应列为空属正常
- 统一 CORS：默认允许全部来源（`Access-Control-Allow-Origin: *`）；如需收敛，建议在 `index.js` 中按域名白名单限制

---

如需将默认 `pageSize`、分页结构或样式做进一步定制，请修改 `/d:/Hepha Theme Editor/consent-api/index.js` 的 `/consents` 路由中分页相关生成逻辑。
