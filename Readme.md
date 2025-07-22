# 🚲 Hepha Bicycle Theme Editor

[![Shopify](https://img.shields.io/badge/Shopify-Theme-7AB55C?style=for-the-badge&logo=shopify&logoColor=white)](https://shopify.com)
[![Liquid](https://img.shields.io/badge/Liquid-Template-2670E8?style=for-the-badge&logo=shopify&logoColor=white)](https://shopify.dev/docs/themes/liquid/reference)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/Design-Responsive-8A2BE2?style=for-the-badge&logo=google-chrome&logoColor=white)](https://en.wikipedia.org/wiki/Responsive_web_design)
[![Multi-Language](https://img.shields.io/badge/Support-Multi--Language-FF6C37?style=for-the-badge&logo=translate&logoColor=white)](https://shopify.dev/docs/themes/internationalization)

> A premium Shopify theme crafted specifically for bicycle e-commerce, featuring interactive geometry visualization, multi-language support, and specialized cycling industry functionality.

![Bicycle Theme Preview](https://via.placeholder.com/1200x600/0A2463/FFFFFF?text=Hepha+Bicycle+Theme)

## ⚡ Quick Links

- [Core Features](#-core-features)
- [Project Structure](#-project-structure)
- [Sections Documentation](#-sections-documentation)
- [Snippets Documentation](#-snippets-documentation)
- [Technical Implementation](#-technical-implementation)
- [Internationalization](#-internationalization)
- [Getting Started](#-getting-started)
- [Performance & SEO](#-performance--seo)

## 🚀 Overview

Hepha Theme Editor is a sophisticated Shopify theme tailored for bicycle retailers and manufacturers. It combines modern e-commerce functionality with specialized features for the cycling industry, including frame geometry visualization, financing options, and advanced product comparison tools.

## ✨ Core Features

### 🌍 Multi-Language Support

<table>
  <tr>
    <td><img src="https://img.shields.io/badge/🇩🇪-German-red?style=flat-square" alt="German"></td>
    <td><img src="https://img.shields.io/badge/🇬🇧-English-blue?style=flat-square" alt="English"></td>
    <td><img src="https://img.shields.io/badge/🇫🇷-French-blue?style=flat-square" alt="French"></td>
  </tr>
</table>

- **Complete Internationalization**: Fully localized for German, English, and French markets
- **Content Management**: Seamless localized content through Liquid templates
- **Regional Options**: Market-specific financing and payment methods

### 🚴 Advanced Product Showcase

<table>
  <tr>
    <td width="50%"><strong>📐 Frame Geometry Visualization</strong><br>Interactive bike frame specifications with detailed measurements and visual guides</td>
    <td width="50%"><strong>⚖️ Product Comparison</strong><br>Comprehensive side-by-side comparison tool for multiple bike models</td>
  </tr>
  <tr>
    <td width="50%"><strong>📑 Tabbed Product Collections</strong><br>Organized product browsing with intuitive category tabs</td>
    <td width="50%"><strong>🎬 Video Integration</strong><br>Firework video playlist integration for immersive product demonstrations</td>
  </tr>
</table>

### 💳 E-commerce Optimization

<table>
  <tr>
    <td colspan="3"><strong>💰 Financing Options</strong></td>
  </tr>
  <tr>
    <td><img src="https://img.shields.io/badge/PayPal-blue?style=flat-square&logo=paypal" alt="PayPal"></td>
    <td><img src="https://img.shields.io/badge/Klarna-pink?style=flat-square" alt="Klarna"></td>
    <td><img src="https://img.shields.io/badge/Zinia-green?style=flat-square" alt="Zinia"></td>
  </tr>
  <tr>
    <td width="33%"><strong>🛒 Cart Drawer</strong><br>Slide-out shopping cart with real-time updates</td>
    <td width="33%"><strong>🎨 Product Variants</strong><br>Advanced variant selection with swatches and size guides</td>
    <td width="33%"><strong>⏰ Countdown Timers</strong><br>Promotional urgency elements to drive conversions</td>
  </tr>
</table>

## 📁 Project Structure
Hepha theme editor/
├── Readme.md                 # Project documentation
├── assets/                   # Static assets and JavaScript files
│   ├── .png                 # Frame geometry images
│   ├── cart-drawer.js        # Shopping cart functionality
│   ├── countdown-timer.js    # Timer components
│   └── custom.js             # Custom theme JavaScript
├── layout/
│   └── theme.liquid          # Main theme layout template
├── sections/                 # Shopify sections for page building
│   ├── header.liquid         # Site header and navigation
│   ├── footer.liquid         # Site footer
│   ├── main-product-new.liquid    # Product page layout
│   ├── frame_geometry_sheet.liquid # Bike geometry visualization
│   ├── custom-product-tab.liquid   # Product collection tabs
│   ├── custom_firework_video.liquid # Video integration
│   └── [other sections]      # Additional page sections
└── snippets/                 # Reusable template components
├── product- .liquid      # Product-related components
├── financing-options.liquid # Payment options
├── product-compare.liquid  # Product comparison
├── icon-*.liquid         # Brand and UI icons
└── [other snippets]      # Utility components


## 📂 Sections Documentation

### 🏗️ Core Layout

<table>
  <thead>
    <tr>
      <th>Section</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>header.liquid</code></td>
      <td>Main navigation, search, cart, and mobile menu</td>
      <td>🧭 Navigation, 🔍 Search, 🛒 Cart, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>footer.liquid</code></td>
      <td>Site footer with links and information</td>
      <td>🔗 Links, ℹ️ Info, 📞 Contact</td>
    </tr>
    <tr>
      <td><code>announcement-bar.liquid</code></td>
      <td>Top-of-page promotional messages</td>
      <td>📢 Promotions, 🎯 Announcements</td>
    </tr>
  </tbody>
</table>

### 🛍️ Product & Collections

<table>
  <thead>
    <tr>
      <th>Section</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>main-product-new.liquid</code></td>
      <td>Enhanced product page layout</td>
      <td>🖼️ Gallery, 📝 Details, 🛒 Purchase</td>
    </tr>
    <tr>
      <td><code>main-collection.liquid</code></td>
      <td>Collection page with filtering</td>
      <td>🔍 Filter, 📊 Sort, 📱 Responsive</td>
    </tr>
    <tr>
      <td><code>custom-product-tab.liquid</code></td>
      <td>Tabbed interface for product collections</td>
      <td>📑 Tabs, 🎨 Interactive, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>adaptive-content-grid.liquid</code></td>
      <td>Flexible content grid system</td>
      <td>📐 Grid, 🎨 Flexible, 📱 Adaptive</td>
    </tr>
  </tbody>
</table>

### 🚴 Specialized Bike Features

<table>
  <thead>
    <tr>
      <th>Section</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>frame_geometry_sheet.liquid</code></td>
      <td>Interactive bike geometry visualization</td>
      <td>📐 Geometry, 🎨 Interactive, 📊 Specs</td>
    </tr>
    <tr>
      <td><code>specifcation_sheet.liquid</code></td>
      <td>Detailed product specifications</td>
      <td>📋 Specs, 📊 Details, 📱 Mobile</td>
    </tr>
  </tbody>
</table>

### 🎬 Interactive & Media

<table>
  <thead>
    <tr>
      <th>Section</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>custom_firework_video.liquid</code></td>
      <td>Video playlist integration</td>
      <td>🎬 Video, 📱 Responsive, 🎮 Interactive</td>
    </tr>
    <tr>
      <td><code>custom-slideshow.liquid</code></td>
      <td>Hero image carousel</td>
      <td>🖼️ Carousel, 🎨 Hero, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>Custom-Image-with-Text.liquid</code></td>
      <td>Content blocks with imagery</td>
      <td>🖼️ Images, 📝 Text, 🎨 Layout</td>
    </tr>
  </tbody>
</table>

### 🔧 Utility & Enhancement

<table>
  <thead>
    <tr>
      <th>Section</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>cart-drawer.liquid</code></td>
      <td>Slide-out shopping cart</td>
      <td>🛒 Cart, 🎨 Drawer, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>go-to-top.liquid</code></td>
      <td>Scroll-to-top functionality</td>
      <td>⬆️ Scroll, 🎯 Navigation, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>custom-stickybar.liquid</code></td>
      <td>Persistent promotional bar</td>
      <td>📌 Sticky, 📢 Promo, 📱 Mobile</td>
    </tr>
  </tbody>
</table>

## 🧩 Snippets Documentation

### 🛒 Product Related

<details>
<summary><strong>View Product Snippets</strong></summary>

<table>
  <thead>
    <tr>
      <th>Snippet</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>product-block.liquid</code></td>
      <td>Individual product display component</td>
      <td>🖼️ Display, 🎨 Card, 📱 Responsive</td>
    </tr>
    <tr>
      <td><code>product-card-detail.liquid</code></td>
      <td>Product card with detailed information</td>
      <td>📝 Details, 🎨 Card, 💰 Price</td>
    </tr>
    <tr>
      <td><code>product-price.liquid</code></td>
      <td>Price display with formatting</td>
      <td>💰 Price, 🎨 Format, 💱 Currency</td>
    </tr>
    <tr>
      <td><code>product-compare.liquid</code></td>
      <td>Comparison functionality</td>
      <td>⚖️ Compare, 🎨 Interactive, 📊 Table</td>
    </tr>
    <tr>
      <td><code>buy-buttons.liquid</code></td>
      <td>Add to cart and purchase buttons</td>
      <td>🛒 Cart, 💳 Buy, 🎨 Buttons</td>
    </tr>
    <tr>
      <td><code>variant-picker.liquid</code></td>
      <td>Product variant selection interface</td>
      <td>🎨 Variants, 🔄 Selection, 📱 Mobile</td>
    </tr>
  </tbody>
</table>
</details>

### 🚴 Bike-Specific

<details>
<summary><strong>View Bike-Specific Snippets</strong></summary>

<table>
  <thead>
    <tr>
      <th>Snippet</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>block-bike-tab.liquid</code></td>
      <td>Bike category tab styling</td>
      <td>📑 Tabs, 🚴 Bikes, 🎨 Style</td>
    </tr>
    <tr>
      <td><code>frame-size-table.liquid</code></td>
      <td>Size guide tables</td>
      <td>📏 Sizes, 📊 Table, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>used-bike.liquid</code></td>
      <td>Pre-owned bike listings</td>
      <td>🔄 Used, 📝 Listings, 💰 Price</td>
    </tr>
    <tr>
      <td><code>spec-module.liquid</code></td>
      <td>Technical specifications display</td>
      <td>🔧 Specs, 📊 Technical, 📱 Mobile</td>
    </tr>
  </tbody>
</table>
</details>

### 💳 Financial & Business

<details>
<summary><strong>View Financial Snippets</strong></summary>

<table>
  <thead>
    <tr>
      <th>Snippet</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>financing-options.liquid</code></td>
      <td>Payment and financing display</td>
      <td>💰 Finance, 💳 Payment, 🌍 Regional</td>
    </tr>
    <tr>
      <td><code>finance-leasing-accordion.liquid</code></td>
      <td>Expandable financing information</td>
      <td>📋 Accordion, 💰 Leasing, ℹ️ Info</td>
    </tr>
    <tr>
      <td><code>leasing-partner.liquid</code></td>
      <td>Business leasing options</td>
      <td>🏢 Business, 💰 Leasing, 🤝 Partners</td>
    </tr>
    <tr>
      <td><code>custom-discount-info.liquid</code></td>
      <td>Promotional pricing information</td>
      <td>🎯 Discount, 💰 Promo, 📢 Info</td>
    </tr>
  </tbody>
</table>
</details>

### 🎨 UI & Interaction

<details>
<summary><strong>View UI Snippets</strong></summary>

<table>
  <thead>
    <tr>
      <th>Snippet</th>
      <th>Description</th>
      <th>Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>gallery-viewer.liquid</code></td>
      <td>Image gallery component</td>
      <td>🖼️ Gallery, 🔍 Zoom, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>block-countdown-timer.liquid</code></td>
      <td>Promotional countdown elements</td>
      <td>⏰ Timer, 🎯 Promo, 🎨 Animation</td>
    </tr>
    <tr>
      <td><code>popup-block.liquid</code></td>
      <td>Modal and popup functionality</td>
      <td>🪟 Modal, 🎨 Popup, 📱 Mobile</td>
    </tr>
    <tr>
      <td><code>sharing-block.liquid</code></td>
      <td>Social media sharing</td>
      <td>📱 Social, 🔗 Share, 🎨 Icons</td>
    </tr>
  </tbody>
</table>
</details>

## 🛠 Technical Implementation

### 📜 JavaScript Features

<div style="display: flex; flex-wrap: wrap; gap: 20px;">
  <div style="flex: 1; min-width: 250px;">
    <h4>🧭 Custom Navigation</h4>
    <ul>
      <li>Responsive header behavior on scroll</li>
      <li>Smart mobile menu with nested categories</li>
      <li>Automatic active state detection</li>
    </ul>
  </div>
  <div style="flex: 1; min-width: 250px;">
    <h4>🛒 Cart Management</h4>
    <ul>
      <li>Dynamic cart updates without page refresh</li>
      <li>Slide-out drawer with animation</li>
      <li>Real-time inventory checking</li>
    </ul>
  </div>
  <div style="flex: 1; min-width: 250px;">
    <h4>🎨 Product Interaction</h4>
    <ul>
      <li>Synchronized add-to-cart buttons</li>
      <li>Smart variant selection with availability</li>
      <li>Dynamic price updates based on options</li>
    </ul>
  </div>
  <div style="flex: 1; min-width: 250px;">
    <h4>⏰ Timer Components</h4>
    <ul>
      <li>Countdown functionality for promotions</li>
      <li>Timezone-aware scheduling</li>
      <li>Animated visual feedback</li>
    </ul>
  </div>
</div>

### 🎨 CSS & Styling

- <img src="https://img.shields.io/badge/Design-Responsive-purple?style=flat-square" alt="Responsive"> Fully responsive design optimized for all devices
- 🚴 Custom styling for bike industry-specific components
- 📐 Flexible grid systems for content layout
- 🎨 CSS custom properties for easy theme customization
- 📱 Mobile-first approach with progressive enhancement

### 🛍️ Shopify Integration

- <img src="https://img.shields.io/badge/Shopify-Compatible-green?style=flat-square&logo=shopify" alt="Shopify"> Full compatibility with Shopify's section and block system
- 📊 Metafield support for extended product information
- ⚙️ Theme settings for easy customization
- 🔌 App integration points for extended functionality
- 🛒 Optimized checkout flow

## 🌐 Internationalization

### 🗺️ Supported Markets

<table>
  <thead>
    <tr>
      <th>Country</th>
      <th>Language</th>
      <th>Currency</th>
      <th>Payment Methods</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>🇩🇪 Germany</td>
      <td>German</td>
      <td>EUR</td>
      <td>PayPal, Klarna, Zinia</td>
    </tr>
    <tr>
      <td>🇦🇹 Austria</td>
      <td>German</td>
      <td>EUR</td>
      <td>PayPal, Klarna</td>
    </tr>
    <tr>
      <td>🇫🇷 France</td>
      <td>French</td>
      <td>EUR</td>
      <td>PayPal, Zinia</td>
    </tr>
  </tbody>
</table>

### 🌍 Localization Features

- 🗣️ **Multi-language Content**: Complete translation system for all customer-facing content
- 💳 **Regional Payment Options**: Market-specific payment and financing methods
- 📊 **Localized Product Information**: Region-specific specifications and compliance details
- 🌐 **Currency Conversion**: Automatic currency formatting based on locale
- 📅 **Date & Time Formatting**: Locale-aware date and time display

## 🚀 Getting Started

### 📥 Installation

1. **Upload Theme Files**
   ```bash
   theme deploy --env=production