# Hepha Theme Editor

![Shopify](https://img.shields.io/badge/Shopify-Theme-green?style=flat-square&logo=shopify)
![Liquid](https://img.shields.io/badge/Liquid-Template-blue?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript)
![Responsive](https://img.shields.io/badge/Design-Responsive-purple?style=flat-square)
![Multi-Language](https://img.shields.io/badge/Support-Multi--Language-orange?style=flat-square)

A comprehensive Shopify theme designed specifically for bicycle e-commerce, featuring advanced product visualization, multi-language support, and specialized bike industry functionality.

## 🚀 Overview

Hepha Theme Editor is a sophisticated Shopify theme tailored for bicycle retailers and manufacturers. It combines modern e-commerce functionality with specialized features for the cycling industry, including frame geometry visualization, financing options, and advanced product comparison tools.

## 📁 Project Structure
Hepha theme editor/
├── Readme.md                 # Project documentation
├── assets/                   # Static assets and JavaScript files
│   ├── *.png                # Frame geometry images
│   ├── cart-drawer.js       # Shopping cart functionality
│   ├── countdown-timer.js   # Timer components
│   └── custom.js            # Custom theme JavaScript
├── layout/
│   └── theme.liquid         # Main theme layout template
├── sections/                # Shopify sections for page building
│   ├── header.liquid       # Site header and navigation
│   ├── footer.liquid       # Site footer
│   ├── main-product-new.liquid # Product page layout
│   ├── frame_geometry_sheet.liquid # Bike geometry visualization
│   ├── custom-product-tab.liquid # Product collection tabs
│   ├── custom_firework_video.liquid # Video integration
│   └── [other sections]    # Additional page sections
└── snippets/                # Reusable template components
    ├── product-*.liquid     # Product-related components
    ├── financing-options.liquid # Payment options
    ├── product-compare.liquid # Product comparison
    ├── icon-*.liquid       # Brand and UI icons
    └── [other snippets]    # Utility components

## ✨ Core Features

### 🌍 Multi-Language Support
- ![German](https://img.shields.io/badge/🇩🇪-German-red?style=flat-square) ![English](https://img.shields.io/badge/🇬🇧-English-blue?style=flat-square) ![French](https://img.shields.io/badge/🇫🇷-French-blue?style=flat-square)
- Comprehensive internationalization for German, English, and French markets
- Localized content management through Liquid templates
- Region-specific financing and payment options

### 🚴 Advanced Product Showcase
- **📐 Frame Geometry Visualization**: Interactive bike frame specifications with detailed measurements
- **⚖️ Product Comparison**: Side-by-side comparison tool for multiple bike models
- **📑 Tabbed Product Collections**: Organized product browsing with category tabs
- **🎬 Video Integration**: Firework video playlist integration for product demonstrations

### 💳 E-commerce Optimization
- **💰 Financing Options**: Integration with ![PayPal](https://img.shields.io/badge/PayPal-blue?style=flat-square&logo=paypal) ![Klarna](https://img.shields.io/badge/Klarna-pink?style=flat-square) ![Zinia](https://img.shields.io/badge/Zinia-green?style=flat-square)
- **🛒 Cart Drawer**: Slide-out shopping cart with real-time updates
- **🎨 Product Variants**: Advanced variant selection with swatches and size guides
- **⏰ Countdown Timers**: Promotional urgency elements

## 📂 Sections Documentation

### 🏗️ Core Layout
| Section | Description | Features |
|---------|-------------|----------|
| `header.liquid` | Main navigation, search, cart, and mobile menu | 🧭 Navigation, 🔍 Search, 🛒 Cart, 📱 Mobile |
| `footer.liquid` | Site footer with links and information | 🔗 Links, ℹ️ Info, 📞 Contact |
| `announcement-bar.liquid` | Top-of-page promotional messages | 📢 Promotions, 🎯 Announcements |

### 🛍️ Product & Collections
| Section | Description | Features |
|---------|-------------|----------|
| `main-product-new.liquid` | Enhanced product page layout | 🖼️ Gallery, 📝 Details, 🛒 Purchase |
| `main-collection.liquid` | Collection page with filtering | 🔍 Filter, 📊 Sort, 📱 Responsive |
| `custom-product-tab.liquid` | Tabbed interface for product collections | 📑 Tabs, 🎨 Interactive, 📱 Mobile |
| `adaptive-content-grid.liquid` | Flexible content grid system | 📐 Grid, 🎨 Flexible, 📱 Adaptive |

### 🚴 Specialized Bike Features
| Section | Description | Features |
|---------|-------------|----------|
| `frame_geometry_sheet.liquid` | Interactive bike geometry visualization | 📐 Geometry, 🎨 Interactive, 📊 Specs |
| `specifcation_sheet.liquid` | Detailed product specifications | 📋 Specs, 📊 Details, 📱 Mobile |

### 🎬 Interactive & Media
| Section | Description | Features |
|---------|-------------|----------|
| `custom_firework_video.liquid` | Video playlist integration | 🎬 Video, 📱 Responsive, 🎮 Interactive |
| `custom-slideshow.liquid` | Hero image carousel | 🖼️ Carousel, 🎨 Hero, 📱 Mobile |
| `Custom-Image-with-Text.liquid` | Content blocks with imagery | 🖼️ Images, 📝 Text, 🎨 Layout |

### 🔧 Utility & Enhancement
| Section | Description | Features |
|---------|-------------|----------|
| `cart-drawer.liquid` | Slide-out shopping cart | 🛒 Cart, 🎨 Drawer, 📱 Mobile |
| `go-to-top.liquid` | Scroll-to-top functionality | ⬆️ Scroll, 🎯 Navigation, 📱 Mobile |
| `custom-stickybar.liquid` | Persistent promotional bar | 📌 Sticky, 📢 Promo, 📱 Mobile |

## 🧩 Snippets Documentation

### 🛒 Product Related
| Snippet | Description | Features |
|---------|-------------|----------|
| `product-block.liquid` | Individual product display component | 🖼️ Display, 🎨 Card, 📱 Responsive |
| `product-card-detail.liquid` | Product card with detailed information | 📝 Details, 🎨 Card, 💰 Price |
| `product-price.liquid` | Price display with formatting | 💰 Price, 🎨 Format, 💱 Currency |
| `product-compare.liquid` | Comparison functionality | ⚖️ Compare, 🎨 Interactive, 📊 Table |
| `buy-buttons.liquid` | Add to cart and purchase buttons | 🛒 Cart, 💳 Buy, 🎨 Buttons |
| `variant-picker.liquid` | Product variant selection interface | 🎨 Variants, 🔄 Selection, 📱 Mobile |

### 🚴 Bike-Specific
| Snippet | Description | Features |
|---------|-------------|----------|
| `block-bike-tab.liquid` | Bike category tab styling | 📑 Tabs, 🚴 Bikes, 🎨 Style |
| `frame-size-table.liquid` | Size guide tables | 📏 Sizes, 📊 Table, 📱 Mobile |
| `used-bike.liquid` | Pre-owned bike listings | 🔄 Used, 📝 Listings, 💰 Price |
| `spec-module.liquid` | Technical specifications display | 🔧 Specs, 📊 Technical, 📱 Mobile |

### 💳 Financial & Business
| Snippet | Description | Features |
|---------|-------------|----------|
| `financing-options.liquid` | Payment and financing display | 💰 Finance, 💳 Payment, 🌍 Regional |
| `finance-leasing-accordion.liquid` | Expandable financing information | 📋 Accordion, 💰 Leasing, ℹ️ Info |
| `leasing-partner.liquid` | Business leasing options | 🏢 Business, 💰 Leasing, 🤝 Partners |
| `custom-discount-info.liquid` | Promotional pricing information | 🎯 Discount, 💰 Promo, 📢 Info |

### 🎨 UI & Interaction
| Snippet | Description | Features |
|---------|-------------|----------|
| `gallery-viewer.liquid` | Image gallery component | 🖼️ Gallery, 🔍 Zoom, 📱 Mobile |
| `block-countdown-timer.liquid` | Promotional countdown elements | ⏰ Timer, 🎯 Promo, 🎨 Animation |
| `popup-block.liquid` | Modal and popup functionality | 🪟 Modal, 🎨 Popup, 📱 Mobile |
| `sharing-block.liquid` | Social media sharing | 📱 Social, 🔗 Share, 🎨 Icons |

### 📝 Content & Layout
| Snippet | Description | Features |
|---------|-------------|----------|
| `content-column.liquid` | Flexible content columns | 📐 Columns, 🎨 Flexible, 📱 Responsive |
| `media-gallery.liquid` | Media display components | 🖼️ Media, 📱 Gallery, 🎨 Display |
| `richtext-block.liquid` | Rich text content areas | 📝 Rich Text, 🎨 Format, 📱 Mobile |
| `text-block.liquid` | Simple text components | 📝 Text, 🎨 Simple, 📱 Mobile |

### 🎯 Icons & Branding
| Snippet | Description | Features |
|---------|-------------|----------|
| `icon-*.liquid` | Various brand and UI icons | 🎯 Icons, 🏢 Brand, 🎨 UI |
| `list-icon.liquid` | Icon list components | 📋 List, 🎯 Icons, 🎨 Display |

## 🛠 Technical Implementation

### 📜 JavaScript Features
- **🧭 Custom Navigation**: Responsive header behavior on scroll
- **🛒 Cart Management**: Dynamic cart updates and drawer functionality
- **🎨 Product Interaction**: Mirror add-to-cart buttons and variant selection
- **⏰ Timer Components**: Countdown functionality for promotions

### 🎨 CSS & Styling
- ![Responsive](https://img.shields.io/badge/Design-Responsive-purple?style=flat-square) Responsive design optimized for mobile and desktop
- 🚴 Custom styling for bike industry-specific components
- 📐 Flexible grid systems for content layout

### 🛍️ Shopify Integration
- ![Shopify](https://img.shields.io/badge/Shopify-Compatible-green?style=flat-square&logo=shopify) Full compatibility with Shopify's section and block system
- 📊 Metafield support for extended product information
- ⚙️ Theme settings for easy customization

## 🌐 Internationalization

### 🗺️ Supported Markets
| Country | Language | Currency | Payment Methods |
|---------|----------|----------|----------------|
| 🇩🇪 Germany | German | EUR | PayPal, Klarna, Zinia |
| 🇦🇹 Austria | German | EUR | PayPal, Klarna |
| 🇫🇷 France | French | EUR | PayPal, Zinia |

### 🌍 Localization Features
- 🗣️ Multi-language content management
- 💳 Region-specific payment and financing options
- 📊 Localized product information and specifications

## 🚀 Getting Started

### 📥 Installation
1. 📤 Upload theme files to your Shopify store
2. ⚙️ Configure theme settings in the Shopify admin
3. 🎨 Customize sections and blocks as needed
4. 💳 Set up payment and financing integrations

### ⚙️ Configuration
- 🧭 Configure header navigation and branding
- 📦 Set up product collections and categories
- 💰 Enable financing options for your region
- 🎨 Customize color schemes and typography

### 🎨 Customization
- 📝 Modify section settings through the theme editor
- 🎨 Add custom CSS for brand-specific styling
- 📊 Configure product metafields for enhanced information
- 🎯 Set up promotional campaigns and countdown timers

## 📊 Performance & SEO

- ⚡ Optimized loading times
- 📱 Mobile-first responsive design
- 🔍 SEO-friendly structure
- 🖼️ Optimized image delivery
- 📈 Analytics integration ready

## 🔧 Development

### 📋 Requirements
- ![Shopify](https://img.shields.io/badge/Shopify-Store-green?style=flat-square&logo=shopify) Shopify store
- ![Liquid](https://img.shields.io/badge/Liquid-Knowledge-blue?style=flat-square) Basic Liquid templating knowledge
- ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=flat-square&logo=javascript) JavaScript for customizations

### 🛠️ Tools
- Shopify CLI for development
- Theme Inspector for debugging
- Browser developer tools

## 📄 License

![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

This theme is proprietary software. All rights reserved.

---