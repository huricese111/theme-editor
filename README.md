# Hepha Theme Editor 主题项目

一个基于 Shopify 的主题项目，用于构建 HEPHA 品牌网站的店铺前端。项目以 Liquid 模板、可配置的 Sections 与 Snippets、静态资源（CSS/JS/图片/数据）以及多语言本地化为核心，支持灵活的内容编排与丰富的交互组件。

## 项目概览
- 技术栈：Shopify Themes（Liquid、JSON 模板）、原生 CSS/JS、Shopify 多语言与设置架构
- 主要目录：`assets/`、`config/`、`layout/`、`locales/`、`sections/`、`snippets/`、`templates/`
- 多语言支持：`locales/` 下包含 `de.json`、`fr.json`、`fi.json`、`es.json` 等多语言字典，模板通过 `| t` 进行翻译渲染
- 可视化配置：`config/settings_schema.json` 定义了主题设置面板（颜色、排版、功能开关等），`settings_data.json` 存储具体店铺的主题设置值
- 典型功能：
  - 商品展示与购买（`main-product.liquid`、`product-price.liquid`、`buy-buttons.liquid` 等）
  - 集合与内容栅格（`main-collection.liquid`、`collection-list.liquid`、`adaptive-content-grid.liquid`）
  - 搜索与过滤（`main-search.liquid`、`search.json`、`price-range.*`、`faceted-filters.liquid`）
- 交互与多媒体（`shop-the-look.liquid`、`slideshow.js`、`video.*`、`hotspots.*`）
- 地区与经销商数据（`assets/dealers-data.json` 及数据转换脚本）

## 项目介绍
本项目是 HEPHA 品牌的 Shopify 主题实现，旨在提供高性能、可维护、可扩展且多语言友好的电商前端。主题通过 Shopify 的 Liquid 模板系统、Section/Block 架构与 JSON 页面模板，搭配原生 CSS/JS 以及多语言字典，构建出模块化、可视化可配置的页面。

- 技术栈与平台
  - Shopify Themes：Liquid 模板、`sections/*` 模块、`snippets/*` 片段、`layout/*` 布局、`templates/*` JSON 页面模板。
  - 原生前端：`assets/*.css`、`assets/*.js`，无打包器依赖，强调按需加载与性能优化。
  - 多语言与地区化：`locales/*.json` + `| t` 翻译机制，以及部分 Section 的多语言字段（如 `*_de/*_fr/*_fi`）。

- 架构总览
  - 布局层：`layout/theme.liquid` 提供全局结构与公共资源注册，例如加载通知与全局组件（`d:\Hepha Theme Editor\layout\theme.liquid:216`、`:238`）。
  - 页面层：`templates/*.json` 定义页面所用 Sections 的顺序与配置（如 `d:\Hepha Theme Editor\templates\search.json`）。这些文件通常由主题编辑器自动生成。
  - 模块层（Sections）：每个 Section 代表可视化模块，支持配置与 Block 子模块（如 `d:\Hepha Theme Editor\sections\main-product.liquid`、`d:\Hepha Theme Editor\sections\shop-the-look.liquid`）。
  - 片段层（Snippets）：可复用的渲染单元，如价格、库存、面包屑、过滤器等（如 `d:\Hepha Theme Editor\snippets\product-price.liquid`、`d:\Hepha Theme Editor\snippets\faceted-filters.liquid`）。
  - 资源层（Assets）：通用样式与脚本、图像与数据文件（如 `d:\Hepha Theme Editor\assets\variant-picker.js`、`d:\Hepha Theme Editor\assets\sticky-atc.js`、`d:\Hepha Theme Editor\assets\dealers-data.json`）。
  - 配置层（Config）：主题设置结构与当前店铺的设置数据（`d:\Hepha Theme Editor\config\settings_schema.json`、`d:\Hepha Theme Editor\config\settings_data.json`）。

- 关键功能与模块
  - 商品详情页：
    - 主模板 `sections/main-product.liquid`，集成价格、购买按钮、库存、标签等；价格片段调用参考 `d:\Hepha Theme Editor\sections\main-product.liquid:363`。
    - 交互脚本：`assets/variant-picker.js`（变体选择）、`assets/sticky-atc.js`（粘性加购）、`assets/pickup-availability.js`。
  - 集合与内容栅格：
    - `sections/main-collection.liquid` 提供集合页与过滤、排序；`d:\Hepha Theme Editor\sections\collection-list.liquid:143` 使用片段渲染集合卡片。
    - `sections/adaptive-content-grid.liquid` 支持多内容类型、响应式栅格与多语言显示。
  - 搜索与过滤：
    - `sections/main-search.liquid` + `d:\Hepha Theme Editor\templates\search.json` 控制搜索页配置（如网格尺寸、是否展示过滤等）。
    - 价格区间与筛选：`assets/price-range.*` 与 `snippets/faceted-filters.liquid`。
  - 交互与多媒体：
    - `d:\Hepha Theme Editor\sections\shop-the-look.liquid:1–13` 按需加载轮播与视频资源；倒计时块引用 `countdown-timer.js`（`d:\Hepha Theme Editor\sections\shop-the-look.liquid:10`）。
    - 轮播与滑动：`assets/slideshow.js`、`assets/slider.js`；动画可通过设置开启（`d:\Hepha Theme Editor\layout\theme.liquid:171–174`）。
  - 多语言与地区化：
    - 字典文件 `locales/*` 与 `| t` 翻译（如 `d:\Hepha Theme Editor\layout\theme.liquid:193` 的可访问性文本）。
    - Section 字段级多语言（`d:\Hepha Theme Editor\sections\Custom-Image-with-Text.liquid:629`、`:682` 使用 `title_de/title_fr/title_fi` 带回退）。
    - 地区化页面：`templates/*context.*.json` 提供不同市场的内容定制（如 `d:\Hepha Theme Editor\templates\page.payment-new.context.55f1a620-11fa-47e5-a7b3-0611f12cc0d4.json`）。

- 主题设置与外观
  - 设置定义：`config/settings_schema.json` 中包含颜色、库存、评分、页脚等设置，如：
    - 库存相关：`d:\Hepha Theme Editor\config\settings_schema.json:490–511`（在库颜色）、`:512–523`（低库存颜色）。
    - 评分样式：`d:\Hepha Theme Editor\config\settings_schema.json:540–552`（星星颜色）。
    - 页脚样式：`d:\Hepha Theme Editor\config\settings_schema.json:552` 之后（背景与文本颜色）。
  - 设置值存储：`config/settings_data.json` 保存店铺态的具体值，勿直接手工修改或提交。
  - 外观输出：
    - 动态样式片段如 `d:\Hepha Theme Editor\snippets\media-content-styles.liquid:768–779` 根据 `section.settings` 输出移动端字号与按钮大小。
    - 页面模板也可携带 `custom_css`（如 `d:\Hepha Theme Editor\templates\collection.collection-with-text.json:1`），但建议迁移到 `assets/*.css` 统一管理。

- 资源与加载策略
  - 公共资源：通知与全局组件在 `d:\Hepha Theme Editor\layout\theme.liquid:215–236` 按条件加载，避免无关页面的脚本注入。
  - 第三方集成：`d:\Hepha Theme Editor\layout\theme.liquid:243` 在德国商品页加载 Jobrad 小部件，需评估性能与隐私影响。
  - 懒加载建议：视频、倒计时、轮播等重资源在可视区域或交互时加载，减少首屏压力。

- 数据与脚本
  - 经销商数据：
    - 原始 CSV 文件位于 `assets/`（示例：`20251113_dealers-data_LCH_2.csv`）。
    - 使用脚本 `convert_csv_to_json.py`、`merge_dealers_data.py` 转换与合并，产出 `assets/dealers-data.json`。
    - 前端组件通过 `assets/dealer-search.js` 与对应 Section 渲染地图与列表。
  - 图片与媒体：统一放置 `assets/` 并通过 Shopify 图片变换 API 控制尺寸与裁剪。

- 可访问性与性能
  - 可访问性：全局跳转链接（`d:\Hepha Theme Editor\layout\theme.liquid:192–194`）、可见焦点与语义标签；组件级需遵循键盘可用与 ARIA。
  - 性能控制：动画可开关（`d:\Hepha Theme Editor\layout\theme.liquid:171–174`），建议统一资源注册、避免循环内 `script` 注入（参考 `d:\Hepha Theme Editor\sections\shop-the-look.liquid:10`）。

- 目录速览
  - `assets/`：样式、脚本、数据与媒体（如 `main.css`、`variant-picker.js`、`dealers-data.json`）。
  - `config/`：`settings_schema.json`（设置结构）与 `settings_data.json`（店铺态配置）。
  - `layout/`：`theme.liquid` 全局布局与资源管理。
  - `locales/`：多语言字典 JSON。
  - `sections/`：模块化页面组件（如 `main-product.liquid`、`adaptive-content-grid.liquid`、`shop-the-look.liquid`）。
  - `snippets/`：片段模板（如 `product-price.liquid`、`faceted-filters.liquid`、`breadcrumbs.liquid`）。
  - `templates/`：页面 JSON 模板（如 `collection.landing.json`、`search.json`）。

---
## 快速开始
> 推荐使用 Shopify CLI 进行本地开发与预览；若未安装，可在 Shopify 官方文档中获取安装指南。

1. 连接到你的开发店铺：
   ```bash
   shopify login --store <your-dev-store>
   ```
2. 本地预览主题（在项目根目录执行）：
   ```bash
   shopify theme serve
   ```
   - 该命令会启动本地服务器并将变更同步到开发主题，浏览器可实时预览。
3. 推送到远程主题（谨慎操作，建议推送到开发或未发布主题）：
   ```bash
   shopify theme push --unpublished
   ```

> 若无法使用 CLI，也可通过 Shopify 后台的主题编辑器直接上传/编辑主题文件，但不利于版本化与协作。

## 目录结构
- `assets/`：静态资源与前端脚本
  - 样式：`main.css`、`section-basestyles.css`、`unified-button-styles.css`、`swatches.css(.liquid)` 等
  - 脚本：`main.js`、`variant-picker.js`、`sticky-atc.js`、`cart-drawer.js`、`search-suggestions.js` 等
  - 数据：`dealers-data.json` 及周期性 CSV（如 `20251113_dealers-data_LCH_2.csv`）
- `config/`：主题配置
  - `settings_schema.json`：定义主题设置项与编辑器结构
  - `settings_data.json`：当前店铺的主题设置值（请勿手动提交到版本库）
- `layout/`：全局布局
  - `theme.liquid`：站点基础结构与全局脚本/样式挂载
  - `password.liquid`：密码页布局
- `locales/`：多语言字典 JSON（例如 `de.json`、`fr.json`、`fi.json` 等）
- `sections/`：可复用的页面模块（可在主题编辑器中拖拽与配置）
  - 示例：`main-product.liquid`、`main-collection.liquid`、`adaptive-content-grid.liquid`、`custom-product-tab-new.liquid`、`shop-the-look.liquid` 等
- `snippets/`：片段模板（由 Sections 或 Layout 引用）
  - 示例：`product-price.liquid`、`buy-buttons.liquid`、`media-gallery.liquid`、`breadcrumbs.liquid`、`faceted-filters.liquid` 等
- `templates/`：页面模板 JSON（自动生成，建议勿手改）
  - 示例：`collection.landing.json`、`search.json`、`page.*.json` 等
- 其它：
  - 数据/工具脚本：`convert_csv_to_json.py`、`merge_dealers_data.py`、`image_converter.py` 等
  - 合规文档：`GDPR-Documentation.md`、`Personal-Data-Function-Audit.md`

## 开发指南
- Liquid 模板约定
  - 使用 `render` 引用片段，如：`{% render 'product-price', product: product %}`
  - 在 Sections 中通过 `section.settings` 读取可配置项；遵循主题设置的命名与分组
  - 模板 JSON（`templates/*.json`）多由编辑器生成，请避免直接修改
- 样式与脚本
  - 样式优先放置 `assets/*.css`；如需动态样式可使用 `*.css.liquid`
  - 脚本放置 `assets/*.js`，与对应 Sections/页面功能一一对应（如 `sticky-atc.js`、`variant-picker.js`）
  - 引用示例：在 Section/Liquid 中按需 `link` 或 `script` 引入，注意 `defer` 与加载顺序
- 多语言
  - 通过 `{{ 'key' | t }}` 调用 `locales/*.json` 中的键；保持各语言键一致
  - 某些 Section 支持多语言字段（如 `title_de`、`title_fr`、`title_fi`），根据 `request.locale.iso_code` 切换显示
- 主题设置
  - 在 `config/settings_schema.json` 中添加设置项（颜色、文案、布尔开关、范围等），为 Section 提供可视化配置
  - 变更设置结构后，请在主题编辑器中验证表单与默认值

## 常见任务流程
- 新增一个 Section
  1. 在 `sections/` 新建 `your-section.liquid`
  2. 在文件底部定义 `schema`（`{% schema %}{...}{% endschema %}`）以暴露设置项
  3. 在模板中使用 `render` 调用所需 `snippets/`，并按需引入 `assets/*.css`/`*.js`
- 添加多语言内容
  1. 在 `locales/*.json` 中新增键值
  2. 模板内通过 `| t` 使用该键
  3. 若为 Section 的独立语言字段，遵循现有命名模式（如 `title_de`）
- 更新经销商数据
  1. 将最新 CSV 放入 `assets/`
  2. 使用脚本（如 `convert_csv_to_json.py`、`merge_dealers_data.py`）转换生成 `assets/dealers-data.json`
  3. 在前端组件（如 `dealer-search.*`）中验证显示

## 部署与环境
- 本地预览：`shopify theme serve`
- 开发/测试环境：建议推送至未发布主题或独立开发店铺进行验证
- 上线发布：在 Shopify 后台将目标主题设为已发布；或使用 CLI 推送到既有主题的草稿版本，经验证后发布

## 文件修改建议
- 保持 `sections/` 与 `snippets/` 的职责清晰：片段尽量通用、Section 负责布局与配置
- 避免直接编辑 `templates/*.json`（由编辑器生成）与 `config/settings_data.json`（店铺态配置）
- 引入新资源时命名清晰、与功能关联（例如 `sticky-atc.js`）
- 关注可访问性（ARIA、键盘导航）、响应式与性能（懒加载、样式作用域）

## 合规与隐私
- 本仓库包含 `GDPR-Documentation.md`、`Personal-Data-Function-Audit.md`；改动涉及个人数据收集/处理时需同步更新
- 前端不应暴露敏感信息（密钥、令牌）；避免在客户端日志中记录隐私数据

## 贡献与协作
- 变更前先梳理：涉及 `settings_schema.json` 的调整需同步更新相关 Section 与翻译
- 变更后验证：在编辑器中测试多语言、移动端样式、交互与可访问性
- 代码审阅：提交变更时附上影响范围与测试要点，便于审阅

## 团队规范
- 分支与发布
  - 使用 `main`（发布）与 `dev`（开发）分支；功能分支命名 `feat/<name>`、修复分支命名 `fix/<name>`。
  - 开发分支通过 Shopify CLI 推送到未发布主题进行验证；合并到 `main` 前必须在开发店铺完成全流程检查。
  - 修改 `config/settings_schema.json` 时，PR 标注“设置结构变更”，同步更新相关 Section 与 `locales/*`。
- 提交与评审
  - 提交信息格式：`<type>: <scope>: <summary>`，类型包含 `feat`/`fix`/`refactor`/`perf`/`style`/`docs`/`test`/`chore`。
  - 每个 PR 需包含影响范围、预览截图或链接、测试要点与风险评估；至少 1 名审核人通过后合并。
  - 禁止直接向 `main` 推送，禁止自我合并未经审核的变更。
- 代码与模板约定
  - Liquid 默认使用 `render` 引用片段，保证片段职责单一与可复用；Section 底部必须包含 `schema` 且设置项需有清晰 `label` 与默认值。
  - 禁止在循环内插入 `<script>`/`<link>`；公共资源统一在 `layout/theme.liquid` 或全局 snippet 挂载并做幂等控制。
  - 禁止直接编辑 `templates/*.json`（编辑器生成）与 `config/settings_data.json`（店铺态数据）。
- 样式与脚本
  - 通用样式集中在 `assets/*.css`；仅在必要场景使用 `*.css.liquid` 输出变量化样式，避免规则膨胀。
  - 组件脚本模块化组织，确保幂等初始化与解绑，避免重复绑定与内存泄漏；统一使用 `defer` 并按需加载。
  - 资源命名与功能关联（如 `sticky-atc.js`），保留简洁清晰的目录结构与引用路径。
- 多语言与文案
  - 优先使用 `locales/*.json` + `| t`；各语言键保持一致，避免硬编码文案。
  - Section 的多语言字段遵循 `*_de/*_fr/*_fi` 命名并提供回退逻辑；新增语言键同时更新各语言包。
  - 用户可见文案在上线前需经过审校流程，避免品牌与合规风险。
- 性能与可访问性
  - 首屏资源控制、重资源（视频、轮播、倒计时）懒加载或交互触发；图片根据视口与容器尺寸使用 Shopify 变换参数。
  - 全站保持键盘可达与 ARIA 语义，检查对比度与焦点可见性；动画与过渡需提供降低动效的选项。
  - 定期进行 Lighthouse 与 WebPageTest 评估，记录指标与优化计划。
- 数据与隐私
  - 经销商数据更新流程：CSV→脚本转换→JSON→前端验证；避免将含敏感信息的原始数据提交到版本库。
  - 引入第三方脚本前需评估隐私与性能影响，记录用途、加载条件与失效策略；必要时提供开关与降级方案。
  - 严禁在前端暴露密钥、令牌或可识别个人信息（PII）。
- 测试与验证
  - 核心交互（变体选择、加入购物车、搜索与过滤）必须附带验证清单；在可能情况下增加集成/端到端测试。
  - 在开发店铺验证移动端与多语言切换，至少覆盖主流浏览器最新两个版本。
- 事故与回滚
  - 遇到严重问题立即回滚到上一版本主题，记录问题原因、影响范围与修复方案；后续变更需附带预防措施。
- 文档维护
  - 新增组件、约定或流程需同步更新本 README 的相关章节；优化建议与规范变更需保留更新记录与时间戳。

## 已知缺点
- 模块体量与耦合偏大：如 `sections/Custom-Image-with-Text.liquid`（约1482行）、`sections/adaptive-content-grid.liquid`（约1615行），维护与回归风险高。
- 动态 CSS 输出过多：片段内基于 `section.settings` 生成样式导致规则重复与体量膨胀，例如 `snippets/media-content-styles.liquid:768`、`:772`、`:778`。
- 资源加载分散且可能重复：多个 Section 在循环/条件中插入脚本与样式，存在重复加载风险，例如 `sections/shop-the-look.liquid:10`。
- 缺少构建与校验工具链：未见 `package.json` 等工具配置，难以进行打包优化、lint/typecheck 与依赖管理。
- 多语言字段分散维护：大量 `title_de/title_fr/title_fi` 等字段，维护成本高且易不一致，例如 `sections/Custom-Image-with-Text.liquid:629`、`:682`。
- 模板 JSON 混入样式：`templates/collection.collection-with-text.json:1` 使用 `custom_css`，不利于样式复用与跨主题迁移。
- 第三方脚本引入需审慎：`layout/theme.liquid:243` 直接加载远程脚本，可能影响性能与隐私合规。
- 资源加载策略缺乏统一：脚本与样式由各 Section 自主决定，难以实现全局按需与幂等控制。
- 测试与回归保障不足：未见自动化测试覆盖核心交互（变体选择、购物车、搜索）。
- 可访问性一致性挑战：各 Section 的键盘导航与 ARIA 语义未形成统一规范。

## 优化建议
- 建立轻量构建链：新增 `package.json`，配置 ESLint/Stylelint/Prettier；可选 Rollup/Vite 用于打包 `assets/*.js` 与压缩 CSS。
- 统一资源注册：公共脚本/样式集中在 `layout/theme.liquid` 或全局 snippet 管理，避免循环内重复 `<script>`。
- CSS 收敛与变量化：通用样式迁移至 `assets/*.css`，仅保留必要的 `*.css.liquid` 动态变量。
- 多语言规范化：以 `locales/*.json` + `| t` 为主；为 Section 语言字段定义统一键与回退策略。
- 懒加载与条件加载：倒计时、视频、轮播等重资源按需或视口进入再加载。
- 引入最小测试集：为核心流程添加集成或端到端测试，保障回归。
- 数据脚本流程化：整理 CSV→JSON 的标准操作与自动化命令，减少人为错误。
- 审视第三方脚本：限定加载条件与时机，评估对性能与隐私影响并记录说明。

---

如需补充项目特定的开发脚本、预览地址或部署流程（例如正式店铺与测试店铺的约定），可在本 README 基础上追加团队规范。
