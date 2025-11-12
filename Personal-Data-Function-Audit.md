# 涉及个人数据的功能盘点

| 功能名称/概述 | 功能测试入口 (页面链接) | 备注 |
| :--- | :--- | :--- |
| **用户账户创建与管理** | `https://hepha.com/account/login` <br> `https://hepha.com/account/register` | 收集用户的姓名、电子邮箱、密码（加密）、收货地址和订单历史，用于简化购物流程和账户管理。相关文件: `main-login.liquid`, `main-register.liquid`, `main-account.liquid`, `main-addresses.liquid`, `templates/customers/*.json` |
| **订单处理与结账** | `https://hepha.com/cart` <br> `https://hepha.com/checkout` | 收集和处理完成订单所必需的个人信息，包括姓名、地址、联系方式和支付信息（由第三方支付网关处理）。相关文件: `main-cart.liquid`, `cart-drawer.liquid`, `templates/cart.json` |
| **网站分析与追踪** | 无直接前端入口 | 通过 Google Analytics 和 Facebook Pixel 等脚本 (如 `gtag-js.liquid`) 收集匿名的用户行为数据（如 IP 地址、页面浏览、停留时间），用于网站优化和营销分析。 |
| **客户支持** | `https://hepha.com/pages/contact` <br>收集用户主动提供的姓名、邮箱和咨询内容，以便回应用户请求。相关文件: `contact-form.liquid`, `templates/page.contact.json` |
| **邮件订阅 (Newsletter)** | 页脚或弹窗中的订阅表单 | 用户可自愿提供电子邮箱地址以订阅营销邮件和产品更新。相关文件: `newsletter.liquid`, `newsletter-signup.liquid` |
| **Cookie 使用与管理** | `https://hepha.com/pages/cookie-policy` <br> Cookie 同意管理横幅 | 网站使用多种 Cookie 来保证功能、进行分析和个性化营销。用户有权通过 Cookie 政策页面了解详情并通过浏览器或同意横幅进行管理。相关文件: `cookies.liquid`, `templates/page.cookie-policy.liquid` |
| **分期付款选项** | 产品页面或结账页面 | 集成第三方支付服务（如 Alma, Zinia）提供分期付款选项。用户将被重定向到第三方网站输入敏感的财务信息。|
| **经销商查询** | `https://hepha.com/pages/find-a-dealer` | 允许用户输入地理位置（如邮政编码或城市）来查找附近的授权经销商。相关文件: `dealer-search.liquid`, `dealer-search.js`, `templates/page.find-a-dealer.json` |
| **运费计算器** | 购物车页面 | 用户输入国家、省份和邮政编码来估算订单的运费。相关文件: `shipping-calculator.liquid`, `shipping-calculator.js` |
| **礼品卡收件人信息** | 购买礼品卡时 | 购买礼品卡时，需要收集收件人的姓名和电子邮箱地址，以便发送礼品卡。相关文件: `gift-card-recipient.liquid`, `templates/gift_card.liquid` |
| **产品搜索** | 网站头部的搜索框 | 记录用户的搜索关键词，以优化搜索结果和了解用户兴趣。相关文件: `predictive-search.liquid`, `main-search.js`, `templates/search.json` |
| **Cookie 同意管理 (Pandectes)** | 网站首次加载时的弹窗/横幅 | 一个第三方的 GDPR/Cookie 同意管理平台，用于获取、存储和管理用户对 Cookie 使用的同意状态。相关文件: `pandectes-rules.min.js`, `pandectes-settings.json` |
| **本地化设置** | 网站头部或页脚 | 允许用户选择偏好的国家和语言，并将此偏好存储在 Cookie 中，以便在后续访问中提供一致的体验。相关文件: `localization-form.liquid`, `country-selector.liquid` |
| **经销商加盟申请** | `https://hepha.com/pages/become-a-dealer`  | 收集潜在经销商的公司和个人联系信息，用于业务合作评估。相关文件: `templates/page.become-a-dealer.json` |
| **职位申请** | `https://hepha.com/pages/career`  | 收集求职者的个人简历、联系方式和申请职位等信息。相关文件: `templates/page.career.json` |
| **预约试驾** | `https://hepha.com/pages/test-ride` | 收集用户的姓名、联系方式和偏好车型，以安排产品试驾。相关文件: `templates/page.testride.json` |
| **联盟营销计划** | `https://hepha.com/pages/affiliate` | 收集联盟成员的个人信息和支付信息，用于佣金结算。相关文件: `templates/page.affiliate.json` |
| **退货处理** | `https://hepha.com/pages/returns` | 处理用户的退货请求，涉及订单信息和客户联系方式。相关文件: `templates/page.returns.json` |