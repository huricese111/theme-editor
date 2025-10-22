const MainSearch = class extends HTMLElement {
  constructor() {
    super();

    // Clicking close button
    this.querySelectorAll('.main-search__close').forEach((el) => {
      el.addEventListener('click', (evt) => {
        evt.preventDefault();
        document.body.classList.remove('show-search');
      });
    });

    // Pressing escape key
    this.querySelector('.main-search__input').addEventListener('keyup', (evt) => {
      if (evt.key === 'Escape') {
        this.querySelector('.main-search__close').dispatchEvent(new Event('click'));
      }
    });

    // Search as you type
    if (this.dataset.quickSearch === 'true') {
      this.initQuickSearch();
    }

    // 注入搜索模块特定的CSS样式
    this.injectSearchSpecificStyles();
  }

  initQuickSearch() {
    const searchInput = this.querySelector('.main-search__input');
    const searchTimeoutThrottle = 500;
    const resultLimit = 8;
    const includeMeta = this.dataset.quickSearchMeta === 'true';
    let searchTimeoutID = -1;
    let searchAbortController = null;

    const handleInputChange = () => {
      const resultsBox = this.querySelector('.main-search__results');
      const valueToSearch = searchInput.value;

      // Only search if search string longer than 2, and it has changed
      if (valueToSearch.length && valueToSearch !== this.oldSearchValue) {
        // Save previous value
        this.oldSearchValue = valueToSearch;

        // Kill outstanding ajax request
        if (searchAbortController !== null) {
          searchAbortController.abort('Existing request not needed');
          searchAbortController = null;
        }

        // Kill previous search
        clearTimeout(searchTimeoutID);

        // Create URL for full search results
        const form = searchInput.closest('form');
        const linkURL = new URL(form.action);
        const formParams = new URLSearchParams(new FormData(form));
        formParams.forEach((value, key) => { linkURL.searchParams.set(key, value); });

        // Show loading
        this.classList.remove('main-search--has-results', 'main-search--results-on-multiple-lines', 'main-search--no-results');
        this.classList.add('main-search--loading');
        if (!this.querySelector('.main-search__results-spinner')) {
          resultsBox.innerHTML = '<div class="main-search__results-spinner"><div class="loading-spinner"></div></div>';
        }

        // Do next search (in X milliseconds)
        searchTimeoutID = setTimeout(() => {
          searchAbortController = new AbortController();
          let ajaxUrl;

          if (theme.Shopify.features.predictiveSearch) {
            // use the API
            ajaxUrl = new URL(theme.routes.base + theme.routes.predictiveSearch);
            ajaxUrl.searchParams.set('q', valueToSearch);
            ajaxUrl.searchParams.set('section_id', 'predictive-search');
            ajaxUrl.searchParams.set('resources[limit]', resultLimit);
            ajaxUrl.searchParams.set('resources[options][fields]', includeMeta ? 'title,product_type,variants.title,vendor,tag,variants.sku' : 'title,product_type,variants.title,vendor');
          } else {
            // use the theme template fallback
            ajaxUrl = new URL(linkURL);
            ajaxUrl.searchParams.set('section_id', 'main-search');
          }

          fetch(ajaxUrl, { method: 'get', signal: searchAbortController.signal })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.text();
            })
            .then((response) => {
              const template = document.createElement('template');
              template.innerHTML = response;
              let resultsList = null;
              if (theme.Shopify.features.predictiveSearch) {
                resultsList = template.content.querySelector('.product-grid');
              } else {
                resultsList = template.content.querySelector('.section-search-template .product-grid');
              }

              // reset previous contents
              searchAbortController = null;
              this.classList.remove('main-search--has-results', 'main-search--results-on-multiple-lines', 'main-search--no-results');
              resultsBox.innerHTML = '';

              const resultsProducts = document.createElement('div');
              resultsProducts.className = 'main-search__results__products collection-listing';
              resultsProducts.innerHTML = '<div></div>';
              const resultsPages = document.createElement('div');
              resultsPages.className = 'main-search__results__pages';

              resultsProducts.firstElementChild.className = resultsList.className;
              
              // 动态设置2列布局样式
              const productGrid = resultsProducts.firstElementChild;
              productGrid.style.display = 'grid';
              productGrid.style.gridTemplateColumns = 'repeat(2, minmax(280px, 1fr))'; // 增加最小宽度以容纳黄色标签
              productGrid.style.gap = 'var(--gutter, 20px)';
              productGrid.style.justifyContent = 'center';
              productGrid.style.maxWidth = '800px'; // 增加最大宽度
              productGrid.style.margin = '0 auto';

              // Convert standard blocks into quick search result format
              resultsList.querySelectorAll('.product-block:not(.collection-block):not(.page-block)').forEach((block, index) => {
                if (index <= resultLimit) {
                  block.classList.add('main-search-result');
                  block.querySelectorAll('.btn.quickbuy-toggle').forEach((el) => el.remove());
                  block.querySelectorAll('.quickbuy-toggle').forEach((el) => el.classList.remove('quickbuy-toggle'));
                  
                  // 设置整个产品块为垂直布局
                  block.style.display = 'flex';
                  block.style.flexDirection = 'column';
                  
                  // 设置产品图片4:3比例（宽4，长3）
                  const productImage = block.querySelector('.product-block__image img, .product-block__image picture img');
                  const imageContainer = block.querySelector('.product-block__image');
                  if (productImage) {
                    productImage.style.aspectRatio = '4/3'; // 宽4，长3
                    productImage.style.objectFit = 'contain';
                    productImage.style.width = '100%';
                    productImage.style.height = 'auto';
                  }
                  if (imageContainer) {
                    imageContainer.style.aspectRatio = '4/3';
                    imageContainer.style.width = '100%';
                  }
                  
                  // 找到所有相关元素
                  const titleElement = block.querySelector('.product-block__title, .product-title, h3, h4');
                  const priceElement = block.querySelector('.product-block__price, .price');
                  const compareWidget = block.querySelector('.product-compare-widget');
                  const compareCheckbox = block.querySelector('.compare-checkbox');
                  const compareCheckboxInput = block.querySelector('.compare-checkbox-input');
                  const productInfo = block.querySelector('.product-block__info');
                  const describeContent = block.querySelector('.custom-description-box, .product-description, .description');
                  const financingInfo = block.querySelector('.financing-info, [class*="financing"], [class*="leasing"]');
                  
                  // 如果存在product-info容器，设置其样式
                  if (productInfo) {
                    productInfo.style.display = 'flex';
                    productInfo.style.flexDirection = 'column';
                    productInfo.style.alignItems = 'flex-start';
                    productInfo.style.width = '100%';
                  }
                  
                  // 修复checkbox和文本的间距
                  if (compareCheckbox) {
                    compareCheckbox.style.display = 'flex';
                    compareCheckbox.style.alignItems = 'center';
                    compareCheckbox.style.gap = '6px'; // 紧密间距
                    compareCheckbox.style.cursor = 'pointer';
                  }
                  
                  // 为describe内容添加左右padding
                  if (describeContent) {
                    describeContent.style.paddingLeft = '15px';
                    describeContent.style.paddingRight = '15px';
                  }
                  
                  // 确保compare widget在financing信息下面
                  if (compareWidget) {
                    compareWidget.style.marginTop = '10px';
                    compareWidget.style.order = '999'; // 确保在最后
                    compareWidget.style.width = '100%';
                    
                    // 查找financing/leasing相关的元素
                    const financingElements = block.querySelectorAll('[class*="financing"], [class*="leasing"], .custom-description-box');
                    let insertAfter = null;
                    
                    // 找到最后一个financing相关元素
                    financingElements.forEach(el => {
                      if (el.textContent.toLowerCase().includes('financing') || 
                          el.textContent.toLowerCase().includes('leasing') ||
                          el.textContent.toLowerCase().includes('finanzierung')) {
                        insertAfter = el;
                      }
                    });
                    
                    // 如果找到了financing元素，在其后插入compare widget
                    if (insertAfter && insertAfter.parentNode) {
                      insertAfter.parentNode.insertBefore(compareWidget, insertAfter.nextSibling);
                    } else {
                      // 否则添加到产品块的最后
                      block.appendChild(compareWidget);
                    }
                  }
                  
                  resultsProducts.firstElementChild.appendChild(block);
                }
              });

              resultsList.querySelectorAll('.product-block.page-block').forEach((block) => {
                const item = document.createElement('a');
                item.className = 'main-search-result main-search-result--page';
                item.href = block.querySelector('a').href;
                item.innerHTML = '<div class="main-search-result__text"></div>';
                item.firstElementChild.innerText = block.querySelector('.page-block__title').innerText;
                resultsPages.appendChild(item);
              });

              this.classList.remove('main-search--loading');

              const areProducts = !!resultsProducts.querySelector('.main-search-result');
              const arePages = !!resultsPages.querySelector('.main-search-result');
              if (areProducts || arePages) {
                // Numerous results
                this.classList.add('main-search--has-results');
                // 调整为2列布局，当超过2个产品时显示多行
                this.classList.toggle('main-search--results-on-multiple-lines', resultsProducts.querySelectorAll('.product-block').length > 2);
                if (areProducts) {
                  resultsBox.appendChild(resultsProducts);
                }
                if (arePages) {
                  const heading = document.createElement('h6');
                  heading.className = 'main-search-result__heading';
                  heading.innerHTML = theme.strings.generalSearchPages;
                  resultsPages.insertAdjacentElement('afterbegin', heading);
                  resultsBox.appendChild(resultsPages);
                }

                const allLink = document.createElement('a');
                allLink.className = 'main-search__results-all-link btn btn--secondary';
                allLink.href = linkURL;
                allLink.innerHTML = theme.strings.generalSearchViewAll;
                resultsBox.appendChild(allLink);
              } else {
                // No results - show nothing
                this.classList.add('main-search--no-results');
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'main-search__empty-message';
                emptyMessage.innerHTML = theme.strings.generalSearchNoResultsWithoutTerms;
                resultsBox.appendChild(emptyMessage);
              }
            })
            .catch((error) => {
              console.warn(error);
            });
        }, searchTimeoutThrottle);
      } else if (!valueToSearch.length) {
        // Abandon current search
        this.oldSearchValue = valueToSearch;
        if (searchAbortController !== null) {
          searchAbortController.abort('Existing request not needed');
          searchAbortController = null;
        }
        clearTimeout(searchTimeoutID);

        // Clear results
        this.classList.remove('main-search--has-results', 'main-search--results-on-multiple-lines', 'main-search--loading');
        resultsBox.innerHTML = '';
      }
    };

    searchInput.addEventListener('keyup', handleInputChange.bind(this));
    searchInput.addEventListener('change', handleInputChange.bind(this));
  }

  injectSearchSpecificStyles() {
    // 检查是否已经注入过样式，避免重复注入
    if (document.getElementById('search-specific-styles')) {
      return;
    }

    // 创建style元素
    const style = document.createElement('style');
    style.id = 'search-specific-styles';
    style.textContent = `
      /* 仅针对搜索模块的样式 */
      main-search .product-grid .product-block__detail {
        margin-bottom: 0;
        padding: 0 20px;
      }
      
      main-search .compare-checkbox {
        padding-left: 18px;
      }
      
      /* 修复产品图片在hover时的居中显示问题 */
      main-search .product-block__image .theme-img {
        object-position: center center !important;
      }
      
      main-search .image-cont--with-secondary-image .product-block__image--secondary .theme-img {
        object-position: center center !important;
      }
    `;

    // 将样式添加到head中
    document.head.appendChild(style);
  }
};

window.customElements.define('main-search', MainSearch);
