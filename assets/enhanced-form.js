class FiveLevelDropdown {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.selectionDisplay = wrapper.querySelector('.current-selection');
    this.panel = wrapper.querySelector('.dropdown-panel');
    this.breadcrumb = wrapper.querySelector('.breadcrumb-nav .breadcrumb-text');
    this.hiddenInput = wrapper.querySelector('input[type="hidden"]');
    
    this.fieldName = wrapper.dataset.fieldName;
    this.data = this.loadData();
    this.selectedPath = [];
    this.currentLevel = 1;
    this.maxLevels = 5; // 支持5级
    
    // 将实例保存到wrapper元素上，以便后续访问
    this.wrapper.fiveLevelDropdownInstance = this;
    
    this.init();
  }
  
  loadData() {
    try {
      const dataElement = this.wrapper.querySelector(`#data-${this.fieldName}`);
      if (!dataElement) {
        console.warn('No data element found for field:', this.fieldName);
        return this.createEmptyHierarchy();
      }
      
      const config = JSON.parse(dataElement.textContent);
      
      // Load multilingual text settings
      this.clearText = config.clearText || this.wrapper.dataset.clearText || 'Clear';
      this.okText = config.okText || this.wrapper.dataset.okText || 'OK';
      this.separator = config.separator || this.wrapper.dataset.separator || '|';
      
      // Add multilingual UI text support
      this.selectCategoryText = config.selectCategoryText || 'Select Category';
      this.backText = config.backText || 'Back';
      this.doneText = config.doneText || 'Done';
      this.noOptionsText = config.noOptionsText || 'No options available';
      this.checkConfigText = config.checkConfigText || 'Please check the configuration';
      
      return this.buildHierarchyFromStructured(config.structuredOptions || [], this.separator);
    } catch (e) {
      console.error('Error parsing data:', e);
      return this.createEmptyHierarchy();
    }
  }
  
  createEmptyHierarchy() {
    return {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: []
    };
  }
  
  buildHierarchyFromStructured(structuredOptions, separator) {
    console.log('=== Building hierarchy data ===');
    console.log('Raw data:', structuredOptions);
    console.log('Separator:', separator);

    const hierarchy = {
        level1: [],
        relationMap: new Map()
    };

    if (!Array.isArray(structuredOptions) || structuredOptions.length === 0) {
        console.log('Invalid data format or empty data');
        return hierarchy;
    }

    const level1Array = []; // Use array to maintain order
    const level1Seen = new Set(); // For deduplication check
    
    // Process data - if first element contains newlines, it's a merged string
    let dataLines = [];
    if (structuredOptions.length === 1 && typeof structuredOptions[0] === 'string' && structuredOptions[0].includes('\n')) {
        // Data is merged into one string, need to split by lines
        dataLines = structuredOptions[0].split('\n').filter(line => line.trim());
        console.log('Detected merged data, split into lines:', dataLines.length, 'lines');
    } else {
        // Data is already in array format
        dataLines = structuredOptions;
    }

    dataLines.forEach((line, index) => {
        console.log(`Processing line ${index + 1}:`, line);
        
        if (typeof line !== 'string' || !line.trim()) {
            console.log(`Skipping line ${index + 1}: not a valid string`);
            return;
        }

        const trimmedLine = line.trim();
        const parts = trimmedLine.split(separator).map(part => part.trim()).filter(part => part);
        
        console.log(`Line ${index + 1} split result:`, parts);
        
        if (parts.length === 0) {
            console.log(`Skipping line ${index + 1}: no valid data after split`);
            return;
        }

        // Add first level option (maintain order)
        const firstLevel = parts[0];
        if (firstLevel && !level1Seen.has(firstLevel)) {
            level1Array.push(firstLevel);
            level1Seen.add(firstLevel);
            console.log(`Added first level option: ${firstLevel}`);
        }

        // Build hierarchy relationships (maintain order)
        for (let i = 0; i < parts.length - 1; i++) {
            const parentPath = parts.slice(0, i + 1).join('>');
            const childValue = parts[i + 1];
            
            if (!hierarchy.relationMap.has(parentPath)) {
                hierarchy.relationMap.set(parentPath, []);
            }
            
            const childArray = hierarchy.relationMap.get(parentPath);
            if (!childArray.includes(childValue)) {
                childArray.push(childValue);
            }
            
            console.log(`Established relationship: ${parentPath} -> ${childValue}`);
        }
    });

    // Set final result (maintain original order)
    hierarchy.level1 = level1Array;

    console.log('=== Build completed ===');
    console.log('First level options count:', hierarchy.level1.length);
    console.log('First level options:', hierarchy.level1);
    console.log('Relation mapping:', hierarchy.relationMap);
    
    return hierarchy;
  }
  
  init() {
    if (!this.selectionDisplay || !this.panel) {
      console.error('Required elements not found for dropdown:', this.fieldName);
      return;
    }
    
    // 添加创建列结构的代码
    this.createColumnStructure();
    this.bindEvents();
    this.showLevel1();
  }
  
  // 新增：创建列结构的方法
  createColumnStructure() {
    const container = this.panel.querySelector('.dynamic-column-container');
    if (!container) {
      console.error('Dynamic column container not found');
      return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建5个列
    for (let i = 1; i <= this.maxLevels; i++) {
      const column = document.createElement('div');
      column.className = `category-column level-${i}-column`;
      column.style.display = 'none';
      
      const content = document.createElement('div');
      content.id = `level-${i}-${this.fieldName}`;
      content.className = 'column-content';
      
      column.appendChild(content);
      container.appendChild(column);
    }
  }
  
  bindEvents() {
    // Toggle dropdown
    this.selectionDisplay.addEventListener('click', () => {
      this.toggleDropdown();
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.closeDropdown();
      }
    });
    
    // Cancel button 
    const cancelBtn = this.panel.querySelector('.btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeDropdown();
      });
    }
    
    // Clear button - 清除选择
    const clearBtn = this.panel.querySelector('.btn-clear');
    if (clearBtn) {
      clearBtn.textContent = this.clearText;
      clearBtn.addEventListener('click', () => {
        this.clearSelection();
      });
    }
    
    // OK button - 确认选择
    const okBtn = this.panel.querySelector('.btn-ok');
    if (okBtn) {
      okBtn.textContent = this.okText;
      okBtn.addEventListener('click', () => {
        this.confirmSelection();
      });
      
      // 初始化确认按钮状态
      this.updateOkButtonState();
    }
  }
  
  toggleDropdown() {
    if (this.panel.style.display === 'none' || this.panel.style.display === '') {
      this.openDropdown();
    } else {
      this.closeDropdown();
    }
  }
    
  // Check if mobile view
  isMobile() {
    return window.innerWidth <= 768;
  }
  
  // Modify openDropdown method
  openDropdown() {
    this.selectionDisplay.classList.add('active');
    
    if (this.isMobile()) {
      this.panel.style.display = 'block';
      this.initMobileColumnView();
      this.bindMobileButtons();
      this.addMobileHeaderButtons();
    } else {
      this.panel.style.display = 'block';
      this.showLevel1();
    }
    
    // 绑定点击外部关闭事件
    this.bindOutsideClickClose();
    
    // 初始化OK按钮状态
    this.updateOkButtonState();
  }
  
  // 新增移动端按钮事件绑定方法
  bindMobileButtons() {
    // 清除按钮事件绑定
    const clearBtn = this.panel.querySelector('.btn-clear');
    if (clearBtn && !clearBtn.hasAttribute('data-bound')) {
      clearBtn.textContent = this.clearText;
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearSelection();
      });
      clearBtn.setAttribute('data-bound', 'true');
    }
    
    // 确定按钮事件绑定
    const okBtn = this.panel.querySelector('.btn-ok');
    if (okBtn && !okBtn.hasAttribute('data-bound')) {
      okBtn.textContent = this.okText;
      okBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.confirmSelection();
      });
      okBtn.setAttribute('data-bound', 'true');
    }
  }
  
  // 新增移动端头部按钮功能
  addMobileHeaderButtons() {
    // 如果移动端头部不存在，创建它
    if (!this.panel.querySelector('.mobile-header')) {
      const mobileHeader = document.createElement('div');
      mobileHeader.className = 'mobile-header';
      mobileHeader.innerHTML = `
        <button type="button" class="mobile-back-btn" style="display: none;">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${this.backText}
        </button>
        <div class="mobile-header-title">${this.selectCategoryText}</div>
        <button type="button" class="mobile-close-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      `;
      
      // 插入到面板顶部
      this.panel.insertBefore(mobileHeader, this.panel.firstChild);
    }
    
    // 绑定返回按钮事件
    const backBtn = this.panel.querySelector('.mobile-back-btn');
    if (backBtn && !backBtn.hasAttribute('data-bound')) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.goBackLevel();
      });
      backBtn.setAttribute('data-bound', 'true');
    }
    
    // 绑定关闭按钮事件
    const closeBtn = this.panel.querySelector('.mobile-close-btn');
    if (closeBtn && !closeBtn.hasAttribute('data-bound')) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeDropdown();
      });
      closeBtn.setAttribute('data-bound', 'true');
    }
  }
  
  // 新增返回上一级功能
  goBackLevel() {
    if (this.selectedPath.length > 0) {
      // 移除最后一级选择
      this.selectedPath.pop();
      
      // 显示上一级
      const currentLevel = this.selectedPath.length + 1;
      if (currentLevel > 1) {
        const parentValue = this.selectedPath[currentLevel - 2];
        this.showLevel(currentLevel, parentValue);
      } else {
        this.showLevel(1);
      }
      
      // 更新返回按钮显示状态
      this.updateBackButtonVisibility();
      
      // 更新OK按钮状态
      this.updateOkButtonState();
    }
  }
  
  // 更新返回按钮显示状态
  updateBackButtonVisibility() {
    const backBtn = this.panel.querySelector('.mobile-back-btn');
    if (backBtn) {
      if (this.selectedPath.length > 0) {
        backBtn.style.display = 'flex';
      } else {
        backBtn.style.display = 'none';
      }
    }
  }
  
  // 绑定点击外部关闭事件
  bindOutsideClickClose() {
    // 移除之前的事件监听器（如果存在）
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
    }
    
    // 创建新的事件处理器
    this.outsideClickHandler = (e) => {
      if (!this.wrapper.contains(e.target) && !this.panel.contains(e.target)) {
        this.closeDropdown();
      }
    };
    
    // 延迟绑定，避免立即触发
    setTimeout(() => {
      document.addEventListener('click', this.outsideClickHandler);
    }, 100);
  }
  
  // 新增移动端栏目视图初始化方法
  initMobileColumnView() {
    // 隐藏所有栏目
    const columns = this.panel.querySelectorAll('.category-column');
    columns.forEach(col => {
      col.classList.remove('active');
      col.style.display = 'none';
    });
    
    // 显示第一级栏目
    const level1Column = this.panel.querySelector('.level-1-column');
    if (level1Column) {
      level1Column.style.display = 'block';
      level1Column.classList.add('active');
    }
    
    // 确保显示第一级数据
    this.showLevel1();
  }

  // 修改showLevel方法以支持移动端单栏显示
  showLevel(level, parentValue = null) {
    if (this.isMobile()) {
      this.showMobileLevel(level, parentValue);
    } else {
      this.showDesktopLevel(level, parentValue);
    }
  }

  // 移动端显示指定级别
  showMobileLevel(level, parentValue = null) {
    // 隐藏所有栏目
    const columns = this.panel.querySelectorAll('.category-column');
    columns.forEach(col => {
      col.classList.remove('active');
      col.style.display = 'none';
    });
    
    // 显示指定级别的栏目
    const targetColumn = this.panel.querySelector(`.level-${level}-column`);
    if (targetColumn) {
      targetColumn.style.display = 'block';
      targetColumn.classList.add('active');
      
      // 填充数据
      this.populateColumn(level, parentValue);
    }
  }

  // 桌面端显示指定级别（保持原有逻辑）
  showDesktopLevel(level, parentValue = null) {
    // 原有的桌面端逻辑
    this.populateColumn(level, parentValue);
    
    // 显示对应的栏目
    for (let i = 1; i <= this.maxLevels; i++) {
      const column = this.panel.querySelector(`.level-${i}-column`);
      if (column) {
        if (i <= level) {
          column.style.display = 'block';
        } else {
          column.style.display = 'none';
        }
      }
    }
  }

  // 填充栏目数据的通用方法
  populateColumn(level, parentValue = null) {
    if (level === 1) {
      this.showLevel1();
    } else {
      this.showNextLevel(parentValue, level - 1);
    }
  }
  
  // 创建独立的移动端面板
  createMobilePanel() {
    // 移除已存在的移动端面板
    const existingPanel = document.getElementById('mobile-dropdown-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // 创建新的移动端面板
    const mobilePanel = document.createElement('div');
    mobilePanel.id = 'mobile-dropdown-panel';
    mobilePanel.innerHTML = `
        <div class="mobile-overlay"></div>
        <div class="mobile-panel-content">
            <div class="mobile-drag-indicator"></div>
            <div class="mobile-header">
                <button type="button" class="mobile-back-btn" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="mobile-header-title">${this.selectCategoryText}</div>
                <button type="button" class="mobile-close-btn">${this.doneText}</button>
            </div>
            <div class="mobile-content">
                <div class="mobile-page-container"></div>
            </div>
            <div class="mobile-actions">
                <button type="button" class="btn-clear">${this.clearText}</button>
                <button type="button" class="btn-ok">${this.okText}</button>
            </div>
        </div>
    `;
    
    // 添加样式
    mobilePanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: flex-end;
        animation: fadeIn 0.3s ease;
    `;
    
    // 添加到 body
    document.body.appendChild(mobilePanel);
    
    // 绑定事件
    this.bindMobilePanelEvents(mobilePanel);
    
    // 初始化内容
    this.initMobilePanelContent(mobilePanel);
    
    // 存储引用
    this.mobilePanel = mobilePanel;
  }
  
  // 绑定移动端面板事件
  bindMobilePanelEvents(panel) {
    const overlay = panel.querySelector('.mobile-overlay');
    const closeBtn = panel.querySelector('.mobile-close-btn');
    const clearBtn = panel.querySelector('.btn-clear');
    const okBtn = panel.querySelector('.btn-ok');
    
    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
        this.closeMobilePanel();
    });
    
    // 关闭按钮
    closeBtn.addEventListener('click', () => {
        this.closeMobilePanel();
    });
    
    // 清除按钮
    clearBtn.textContent = this.clearText;
    clearBtn.addEventListener('click', () => {
        this.clearSelection();
        this.closeMobilePanel();
    });
    
    // 确认按钮
    okBtn.textContent = this.okText;
    okBtn.addEventListener('click', () => {
        this.closeMobilePanel();
    });
  }
  
  // 关闭移动端面板
  closeMobilePanel() {
    if (this.mobilePanel) {
        this.mobilePanel.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (this.mobilePanel) {
                this.mobilePanel.remove();
                this.mobilePanel = null;
            }
        }, 300);
    }
    this.selectionDisplay.classList.remove('active');
  }
  
  // 初始化移动端面板内容
  initMobilePanelContent(panel) {
    const pageContainer = panel.querySelector('.mobile-page-container');
    
    // 获取数据
    const level1Data = this.data.level1 || [];
    
    if (level1Data.length > 0) {
        this.renderMobilePage(pageContainer, level1Data, 1);
    } else {
        pageContainer.innerHTML = '<div class="mobile-empty-state">No options available</div>';
    }
  }
  
  // 渲染移动端页面
  renderMobilePage(container, options, level) {
    const page = document.createElement('div');
    page.className = 'mobile-page';
    
    options.forEach(option => {
        const item = document.createElement('div');
        item.className = 'mobile-category-item';
        item.innerHTML = `
            <div class="mobile-item-content">
                <div class="mobile-item-name">${option}</div>
            </div>
            <div class="mobile-item-arrow">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectMobileOption(option, level);
        });
        
        page.appendChild(item);
    });
    
    container.innerHTML = '';
    container.appendChild(page);
  }
  
  // 选择移动端选项
  selectMobileOption(option, level) {
    // 更新选择路径
    this.selectedPath[level - 1] = option;
    
    // 更新显示
    this.updateSelectionDisplay();
    
    // 关闭面板
    this.closeMobilePanel();
  }
  
  // Initialize mobile view - 修改为显示面板
  initMobileView() {
    this.panel.style.display = 'block';
    
    // 创建移动端结构
    this.createMobileStructure();
    
    // 初始化页面栈
    this.pageStack = [];
    this.currentPageLevel = 1;
    
    // 显示第一页
    const level1Data = this.data.level1 || [];
    
    if (level1Data.length > 0) {
      this.showMobilePage(1, level1Data, 'Select Category');
    } else {
      this.showEmptyState();
    }
  }
  
  // Create mobile HTML structure
  createMobileStructure() {
    // 如果移动端结构已创建，清空内容并返回
    if (this.panel.querySelector('.mobile-page-container')) {
      const existingContainer = this.panel.querySelector('.mobile-page-container');
      existingContainer.innerHTML = '';
      this.mobilePageContainer = existingContainer;
      return;
    }
    
    // 创建移动端头部
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';
    mobileHeader.innerHTML = `
      <button type="button" class="mobile-back-btn" style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${this.backText}
      </button>
      <div class="mobile-header-title">${this.selectCategoryText}</div>
      <button type="button" class="mobile-close-btn">${this.doneText}</button>
    `;
    
    // 创建页面容器
    const pageContainer = document.createElement('div');
    pageContainer.className = 'mobile-page-container';
    
    // 在面板开头插入移动端头部
    this.panel.insertBefore(mobileHeader, this.panel.firstChild);
    
    // 在dynamic-column-container之前插入页面容器
    const dynamicColumnContainer = this.panel.querySelector('.dynamic-column-container');
    this.panel.insertBefore(pageContainer, dynamicColumnContainer);
    
    // 绑定事件
    const backBtn = mobileHeader.querySelector('.mobile-back-btn');
    const closeBtn = mobileHeader.querySelector('.mobile-close-btn');
    
    backBtn.addEventListener('click', () => {
      this.goBackMobilePage();
    });
    
    closeBtn.addEventListener('click', () => {
      this.closeDropdown();
    });
    
    // 存储引用
    this.mobileHeader = mobileHeader;
    this.mobilePageContainer = pageContainer;
    this.mobileBackBtn = backBtn;
    this.mobileTitle = mobileHeader.querySelector('.mobile-header-title');
  }
  
  // Add empty state method
  showEmptyState() {
    const pageContainer = this.panel.querySelector('.mobile-page-container') || 
                         this.panel.querySelector('#level-1-' + this.fieldName);
    
    if (pageContainer) {
      pageContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-message">${this.noOptionsText}</div>
          <div class="empty-submessage">${this.checkConfigText}</div>
        </div>
      `;
    }
  }
  
  // Show mobile page with better error handling
  showMobilePage(level, options, title = null) {
    if (!this.mobilePageContainer) {
      console.error('Mobile page container not found');
      return;
    }
    
    const pageContainer = this.mobilePageContainer;
    
    // Create new page
    const page = document.createElement('div');
    page.className = 'mobile-page';
    page.dataset.level = level;
    
    // Add debug info
    console.log('Creating mobile page for level:', level, 'with options:', options);
    
    // Render options
    if (options && options.length > 0) {
      options.forEach((option, index) => {
        if (option && typeof option === 'string' && option.trim()) {
          const hasChildren = this.hasChildrenForOption(option, level);
          const isSelected = this.selectedPath[level - 1] === option;
          
          const item = document.createElement('div');
          item.className = `mobile-category-item ${isSelected ? 'selected' : ''}`;
          
          item.innerHTML = `
            <div class="mobile-item-content">
              <div class="mobile-item-name">${option}</div>
            </div>
            ${hasChildren ? `
              <div class="mobile-item-arrow">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            ` : `
              <div class="mobile-item-check">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            `}
          `;
          
          item.addEventListener('click', () => {
            this.selectMobileOption(option, level, hasChildren);
          });
          
          page.appendChild(item);
          console.log(`Added item ${index + 1}: ${option}`);
        }
      });
    } else {
      // Show empty state
      const emptyItem = document.createElement('div');
      emptyItem.className = 'mobile-category-item';
      emptyItem.innerHTML = `
        <div class="mobile-item-content">
          <div class="mobile-item-name">${this.noOptionsText}</div>
        </div>
      `;
      page.appendChild(emptyItem);
      console.log('Added empty state item');
    }
    
    // Add to container
    pageContainer.appendChild(page);
    console.log('Page added to container');
    
    // Update page stack
    this.pageStack.push({
      level: level,
      title: title || this.getLevelTitle(level),
      page: page
    });
    
    // Show page with animation
    setTimeout(() => {
      // Hide previous pages
      const prevPages = pageContainer.querySelectorAll('.mobile-page.active');
      prevPages.forEach(p => {
        p.classList.remove('active');
        p.classList.add('prev');
      });
      
      // Show new page
      page.classList.add('active');
      console.log('Page activated with class:', page.className);
    }, 10);
    
    // Update header
    this.updateMobileHeader();
  }
  
  // Select mobile option
  selectMobileOption(value, level, hasChildren) {
    // 更新选择路径
    this.selectedPath[level - 1] = value;
    
    // 清除后续级别的选择
    for (let i = level; i < this.maxLevels; i++) {
      this.selectedPath[i] = undefined;
    }
    
    // 更新显示
    this.updateSelectionDisplay();
    
    if (hasChildren && level < this.maxLevels) {
      // 获取下一级数据
      const nextLevelData = this.getMobileChildOptions(value, level);
      if (nextLevelData && nextLevelData.length > 0) {
        this.showMobilePage(level + 1, nextLevelData, value);
      }
    } else {
      // 没有子级，关闭面板
      this.closeDropdown();
    }
  }
  
  // Go back to previous page
  goBackMobilePage() {
    if (this.pageStack.length <= 1) return;
    
    // 移除当前页
    const currentPageData = this.pageStack.pop();
    if (currentPageData && currentPageData.page) {
      currentPageData.page.remove();
    }
    
    // 显示上一页
    const prevPageData = this.pageStack[this.pageStack.length - 1];
    if (prevPageData && prevPageData.page) {
      prevPageData.page.classList.remove('prev');
      prevPageData.page.classList.add('active');
    }
    
    // 更新头部
    this.updateMobileHeader();
  }
  
  // Update mobile header
  updateMobileHeader() {
    if (!this.mobileTitle || !this.mobileBackBtn) return;
    
    const currentPage = this.pageStack[this.pageStack.length - 1];
    if (currentPage) {
      this.mobileTitle.textContent = currentPage.title;
      
      // 显示/隐藏返回按钮
      if (this.pageStack.length > 1) {
        this.mobileBackBtn.style.display = 'flex';
      } else {
        this.mobileBackBtn.style.display = 'none';
      }
    }
  }
  
  // Get child options for mobile view
  getMobileChildOptions(parentValue, currentLevel) {
    const nextLevel = currentLevel + 1;
    if (nextLevel > this.maxLevels) return [];

    // 构建父级路径
    const parentPath = [...this.selectedPath.slice(0, currentLevel - 1), parentValue].join('>');
    
    // 使用统一的数据获取方法
    return this.getChildOptions(parentPath, nextLevel);
  }
  
  // Get level title
  getLevelTitle(level) {
    const titles = {
      1: this.selectCategoryText,
      2: 'Select Subcategory',
      3: 'Select Details',
      4: 'Select Model',
      5: 'Select Option'
    };
    return titles[level] || `Level ${level} Selection`;
  }
  
  // Update selection display
  updateSelectionDisplay() {
    if (this.selectedPath.length > 0) {
      const selectedText = this.selectedPath.join(' > ');
      const placeholder = this.selectionDisplay.querySelector('.placeholder');
      if (placeholder) {
        placeholder.textContent = selectedText;
        placeholder.classList.add('has-selection');
      }
      
      // Update hidden input
      if (this.hiddenInput) {
        this.hiddenInput.value = this.selectedPath.join('|');
      }
    }
  }
  
  // Modify clearSelection method to support mobile
  clearSelection() {
    this.selectedPath = [];
    
    const placeholder = this.selectionDisplay.querySelector('.placeholder');
    if (placeholder) {
      const originalPlaceholder = this.wrapper.querySelector('.current-selection').dataset.placeholder || 'Select an option';
      placeholder.textContent = originalPlaceholder;
      placeholder.classList.remove('has-selection');
    }
    
    if (this.hiddenInput) {
      this.hiddenInput.value = '';
    }
    
    if (this.isMobile()) {
      // 重置到第一级显示
      this.initMobileColumnView();
    } else {
      this.showLevel1();
      this.updateBreadcrumb();
    }
    
    // 清除所有选中状态
    for (let i = 1; i <= this.maxLevels; i++) {
      const column = this.wrapper.querySelector(`.level-${i}-column`);
      if (column) {
        const items = column.querySelectorAll('.category-item');
        items.forEach(item => item.classList.remove('selected'));
      }
    }
    
    // 更新确认按钮状态
    this.updateOkButtonState();
  }
  
  // Reset to first page (for mobile)
  resetToFirstPage() {
    if (this.mobilePageContainer) {
      this.mobilePageContainer.innerHTML = '';
    }
    
    // Don't remove mobile header and container references
    // Just reset the page stack
    this.pageStack = [];
    
    console.log('Mobile pages reset, structure preserved');
  }
  
  // 新增：更新确认按钮状态的方法
  updateOkButtonState() {
    const okBtn = this.panel.querySelector('.btn-ok');
    if (!okBtn) return;
    
    // 获取当前下拉菜单的实际最大层级数
    const actualMaxLevels = this.getActualMaxLevels();
    
    // 检查用户是否选择了所有必要的层级
    if (this.selectedPath.length > 0 && this.selectedPath.length >= actualMaxLevels) {
      // 用户已选择所有必要层级，启用按钮
      okBtn.disabled = false;
      okBtn.style.opacity = '1';
    } else {
      // 用户未选择所有必要层级，禁用按钮
      okBtn.disabled = true;
      okBtn.style.opacity = '0.5';
    }
  }
  
  // Modify confirmSelection method
  confirmSelection() {
    if (this.selectedPath.length > 0) {
      // 获取当前下拉菜单的实际最大层级数
      const actualMaxLevels = this.getActualMaxLevels();
      
      // 检查用户是否选择了所有必要的层级
      if (this.selectedPath.length >= actualMaxLevels) {
        this.finalizeSelection();
      }
      // 移除了弹窗提示部分
    } else {
      this.closeDropdown();
    }
  }
  
  // Modify closeDropdown method
  closeDropdown() {
    this.panel.style.display = 'none';
    this.selectionDisplay.classList.remove('active');
    
    // 移除点击外部关闭事件监听器
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
  }
  
  showLevel1() {
    console.log('=== 显示第一级 ===');
    console.log('数据对象:', this.data);
    
    const level1Options = this.data.level1 || [];
    console.log('第一级选项:', level1Options);
    console.log('第一级选项数量:', level1Options.length);
    
    this.renderColumn(level1Options, 1);
    this.currentLevel = 1;
    
    if (!this.isMobile()) {
      this.hideColumns([2, 3, 4, 5]);
    }
    
    this.updateBreadcrumb();
    console.log('第一级显示完成');
  }
  
  showNextLevel(parentValue, currentLevel) {
    const nextLevel = currentLevel + 1;
    if (nextLevel > this.maxLevels) return;
    
    // 构建父级路径
    const parentPath = this.selectedPath.slice(0, currentLevel).join('>');
    
    console.log('showNextLevel called:', {
      parentValue,
      currentLevel,
      nextLevel,
      parentPath,
      selectedPath: this.selectedPath
    });
    
    // 使用新的数据获取方法
    const childOptions = this.getChildOptions(parentPath, nextLevel);
    
    console.log('Final childOptions for level', nextLevel, ':', childOptions);
    
    this.renderColumn(childOptions, nextLevel);
    this.currentLevel = nextLevel;
    
    if (!this.isMobile()) {
      // 隐藏后续所有栏目
      const columnsToHide = [];
      for (let i = nextLevel + 1; i <= this.maxLevels; i++) {
        columnsToHide.push(i);
      }
      this.hideColumns(columnsToHide);
    }
  }
  
  // 获取指定父级路径下的子选项
  getChildOptions(parentPath, level) {
    if (!this.data.relationMap) return [];
    
    if (level === 1) {
      return this.data.level1 || [];
    }
    
    return this.data.relationMap.get(parentPath) || [];
  }
  
  renderColumn(options, level) {
    console.log(`=== 渲染第 ${level} 级 ===`);
    console.log('选项数据:', options);
    
    const column = this.wrapper.querySelector(`.level-${level}-column`);
    const content = this.wrapper.querySelector(`#level-${level}-${this.fieldName}`);
    
    if (!column || !content) {
      console.error(`找不到第 ${level} 级的列元素`);
      return;
    }
    
    // 清空内容
    content.innerHTML = '';
    column.style.display = 'block';
    
    // 确保options是数组
    if (!Array.isArray(options)) {
      console.error('选项不是数组:', options);
      return;
    }
    
    console.log(`开始渲染 ${options.length} 个选项`);
    
    options.forEach((option, index) => {
      console.log(`渲染选项 ${index + 1}: ${option}`);
      
      if (option && typeof option === 'string' && option.trim()) {
        const item = document.createElement('div');
        item.className = 'category-item';
        
        const hasChildren = this.hasChildrenForOption(option, level);
        if (hasChildren) {
          item.classList.add('has-children');
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'category-name';
        nameSpan.textContent = option;
        
        item.appendChild(nameSpan);
        
        item.addEventListener('click', () => {
          this.selectOption(option, level, hasChildren);
        });
        
        content.appendChild(item);
        console.log(`成功渲染选项: ${option}`);
      } else {
        console.log(`跳过无效选项:`, option);
      }
    });
    
    console.log(`第 ${level} 级渲染完成，共 ${content.children.length} 个项目`);
  }
  
  selectOption(value, level, hasChildren) {
    this.selectedPath[level - 1] = value;
    this.selectedPath = this.selectedPath.slice(0, level);
    
    this.updateSelectedStates(level, value);
    
    if (hasChildren && level < this.maxLevels) {
      if (this.isMobile()) {
        this.showLevel(level + 1, value);
        // 更新返回按钮显示状态
        this.updateBackButtonVisibility();
      } else {
        this.showNextLevel(value, level);
      }
    } else {
      this.finalizeSelection();
    }
    
    this.updateBreadcrumb();
    
    // 更新确认按钮状态
    this.updateOkButtonState();
  }
  
  hasChildrenForOption(option, level) {
    if (level >= this.maxLevels) return false;
    
    // 构建当前选项的路径
    const currentPath = [...this.selectedPath.slice(0, level - 1), option].join('>');
    
    // 检查是否有子选项
    const childOptions = this.getChildOptions(currentPath, level + 1);
    return childOptions.length > 0;
  }
  
  // 添加一个新方法来获取当前下拉菜单的实际最大层级数
  getActualMaxLevels() {
    // 如果没有选择任何选项，返回默认最大层级
    if (this.selectedPath.length === 0) {
      return 1; // 至少需要选择第一级
    }
    
    // 构建当前选择的路径
    const currentPath = this.selectedPath.join('>');
    
    // 检查是否有下一级选项
    let currentLevel = this.selectedPath.length;
    const nextLevelOptions = this.data.relationMap.get(currentPath);
    
    // 如果没有下一级选项，则当前级别就是最大级别
    if (!nextLevelOptions || nextLevelOptions.length === 0) {
      return currentLevel;
    }
    
    // 递归检查下一级
    return this._getMaxLevelsRecursive(currentPath, currentLevel);
  }
  
  // 递归辅助方法来确定最大层级数
  _getMaxLevelsRecursive(parentPath, currentLevel) {
    if (currentLevel >= this.maxLevels) {
      return currentLevel;
    }
    
    const childOptions = this.data.relationMap.get(parentPath);
    if (!childOptions || childOptions.length === 0) {
      return currentLevel;
    }
    
    // 检查所有子选项的最大层级数
    let maxLevel = currentLevel;
    for (const child of childOptions) {
      const childPath = parentPath + '>' + child;
      const grandchildren = this.data.relationMap.get(childPath);
      
      if (grandchildren && grandchildren.length > 0) {
        const childMaxLevel = this._getMaxLevelsRecursive(childPath, currentLevel + 1);
        maxLevel = Math.max(maxLevel, childMaxLevel);
      } else {
        maxLevel = Math.max(maxLevel, currentLevel + 1);
      }
    }
    
    return maxLevel;
  }
  
  hideColumns(levels) {
    levels.forEach(level => {
      const column = this.wrapper.querySelector(`.level-${level}-column`);
      if (column) {
        column.style.display = 'none';
      }
    });
  }
  
  hideColumnsAfter(level) {
    const columnsToHide = [];
    for (let i = level + 1; i <= this.maxLevels; i++) {
      columnsToHide.push(i);
    }
    this.hideColumns(columnsToHide);
  }
  
  updateSelectedStates(level, selectedValue) {
    // 清除所有列的选中状态
    for (let i = 1; i <= this.maxLevels; i++) {
      const column = this.wrapper.querySelector(`.level-${i}-column`);
      if (column) {
        const items = column.querySelectorAll('.category-item');
        items.forEach(item => item.classList.remove('selected'));
      }
    }
    
    // 高亮整个选择路径上的所有项目
    for (let i = 0; i < this.selectedPath.length; i++) {
      const levelNum = i + 1;
      const selectedValueAtLevel = this.selectedPath[i];
      const column = this.wrapper.querySelector(`.level-${levelNum}-column`);
      
      if (column) {
        const items = column.querySelectorAll('.category-item');
        items.forEach(item => {
          const categoryName = item.querySelector('.category-name');
          if (categoryName && categoryName.textContent === selectedValueAtLevel) {
            item.classList.add('selected');
          }
        });
      }
    }
  }
  
  finalizeSelection() {
    const selectedText = this.selectedPath.join(' > ');
    const selectedValue = this.selectedPath.join('|');
    
    // 更新显示文本
    const placeholder = this.selectionDisplay.querySelector('.placeholder');
    if (placeholder) {
      placeholder.textContent = selectedText;
      placeholder.classList.add('has-selection');
    }
    
    // 更新隐藏输入的值
    if (this.hiddenInput) {
      this.hiddenInput.value = selectedValue;
    }
    
    // 清除验证错误（如果存在）
    clearDropdownError(this.wrapper);
    
    // 触发 change 事件
    const changeEvent = new Event('change', { bubbles: true });
    this.hiddenInput.dispatchEvent(changeEvent);
    
    // 关闭下拉框
    this.closeDropdown();
  }
  
  updateBreadcrumb() {
    if (!this.breadcrumb) return;
    
    // Clear existing content
    this.breadcrumb.innerHTML = '';
    
    if (this.selectedPath.length === 0) {
      const span = document.createElement('span');
      span.textContent = 'Browse for your category';
      span.className = 'breadcrumb-text';
      this.breadcrumb.appendChild(span);
    } else {
      // Create non-clickable breadcrumb items
      this.selectedPath.forEach((pathItem, index) => {
        // Create a non-clickable span for each breadcrumb item
        const span = document.createElement('span');
        span.textContent = pathItem;
        span.className = 'breadcrumb-text';
        
        this.breadcrumb.appendChild(span);
        
        // Add separator if not the last item
        if (index < this.selectedPath.length - 1) {
          const separator = document.createElement('span');
          separator.textContent = ' > ';
          separator.className = 'breadcrumb-separator';
          this.breadcrumb.appendChild(separator);
        }
      });
    }
  }
  
  // Add new method to handle returning to a specific level
  returnToLevel(targetLevel) {
    console.log(`Returning to level ${targetLevel}`);
    
    // Truncate selectedPath to the target level
    this.selectedPath = this.selectedPath.slice(0, targetLevel);
    
    // Update hidden input value
    if (this.hiddenInput) {
      this.hiddenInput.value = this.selectedPath.join('|');
    }
    
    // Update display text
    const placeholder = this.selectionDisplay.querySelector('.placeholder');
    if (placeholder) {
      if (this.selectedPath.length > 0) {
        placeholder.textContent = this.selectedPath.join(' > ');
        placeholder.classList.add('has-selection');
      } else {
        const originalPlaceholder = this.wrapper.querySelector('.current-selection').dataset.placeholder || 'Select an option';
        placeholder.textContent = originalPlaceholder;
        placeholder.classList.remove('has-selection');
      }
    }
    
    // Show the appropriate level
    this.currentLevel = targetLevel;
    if (targetLevel === 1) {
      this.showLevel1();
    } else {
      this.showLevel(targetLevel, this.selectedPath.slice(0, targetLevel - 1));
    }
    
    // Update breadcrumb
    this.updateBreadcrumb();
    
    // Clear selection states for levels beyond the target
    for (let i = targetLevel + 1; i <= this.maxLevels; i++) {
      const column = this.wrapper.querySelector(`.level-${i}-column`);
      if (column) {
        column.style.display = 'none';
        const items = column.querySelectorAll('.category-item');
        items.forEach(item => item.classList.remove('selected'));
      }
    }
    
    // 更新确认按钮状态
    this.updateOkButtonState();
  }
  
  // 添加恢复选择状态的方法
  restoreSelection(selectedPath) {
    if (!selectedPath || selectedPath.length === 0) return;
    
    this.selectedPath = selectedPath;
    
    // 更新显示文本
    const selectedText = selectedPath.join(' > ');
    const placeholder = this.selectionDisplay.querySelector('.placeholder');
    if (placeholder) {
      placeholder.textContent = selectedText;
      placeholder.classList.add('has-selection');
    }
    
    // 更新隐藏输入的值
    if (this.hiddenInput) {
      this.hiddenInput.value = selectedPath.join('|');
    }
    
    // 更新面包屑
    this.updateBreadcrumb();
    
    // 更新确认按钮状态
    this.updateOkButtonState();
  }
  

}

class CustomDatePicker {
  constructor(input, options = {}) {
    this.input = input;
    this.picker = input.parentElement.querySelector('.custom-date-picker');
    this.options = {
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      ...options
    };
    this.currentDate = new Date();
    this.selectedDate = null;
    this.isOpen = false;
    this.viewMode = 'days'; // 'days', 'months', 'years'
    
    // 获取当前语言设置
    this.locale = this.getLocale();
    
    // 绑定事件处理函数到实例
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    
    this.init();
  }
  
  getLocale() {
    // 从HTML lang属性或其他方式获取语言设置
    const htmlLang = document.documentElement.lang || 'en';
    return htmlLang.toLowerCase();
  }
  
  getLocalizedText() {
    const texts = {
      en: {
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        clear: 'Clear',
        today: 'Today',
        ok: 'OK'
      },
      de: {
        monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        clear: 'Löschen',
        today: 'Heute',
        ok: 'OK'
      },
      fr: {
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
                          'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        dayNames: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        clear: 'Effacer',
        today: 'Aujourd\'hui',
        ok: 'OK'
      },
      fi: {
        monthNames: ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
                    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'],
        monthNamesShort: ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes',
                          'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'],
        dayNames: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
        clear: 'Tyhjennä',
        today: 'Tänään',
        ok: 'OK'
      }
    };
    
    return texts[this.locale] || texts.en;
  }
  
  init() {
    this.input.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });
    
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
    
    document.addEventListener('click', (e) => {
      if (!this.input.parentElement.contains(e.target)) {
        this.close();
      }
    });
    
    this.render();
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.picker.style.display = 'block';
      this.viewMode = 'days';
      this.render();
    }
  }
  
  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.picker.style.display = 'none';
    }
  }
  
  render() {
    const localizedText = this.getLocalizedText();
    
    if (this.viewMode === 'days') {
      this.renderDaysView(localizedText);
    } else if (this.viewMode === 'months') {
      this.renderMonthsView(localizedText);
    } else if (this.viewMode === 'years') {
      this.renderYearsView(localizedText);
    }
  }
  
  renderDaysView(localizedText) {
    const monthNames = localizedText.monthNames;
    const dayNames = localizedText.dayNames;
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    let html = `
      <div class="custom-date-picker-header">
        <button type="button" class="custom-date-picker-nav" data-action="prev-month">‹</button>
        <div class="custom-date-picker-month-year-selector">
          <select class="month-dropdown" data-action="change-month">
            ${monthNames.map((name, index) => 
              `<option value="${index}" ${index === month ? 'selected' : ''}>${name}</option>`
            ).join('')}
          </select>
          <select class="year-dropdown" data-action="change-year">
            ${this.generateYearOptions(year)}
          </select>
        </div>
        <button type="button" class="custom-date-picker-nav" data-action="next-month">›</button>
      </div>
      <div class="custom-date-picker-grid">
    `;
    
    // 添加星期标题
    dayNames.forEach(day => {
      html += `<div class="custom-date-picker-day-header">${day}</div>`;
    });
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 生成日期网格
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = this.isToday(date);
      const isSelected = this.selectedDate && this.isSameDate(date, this.selectedDate);
      const isDisabled = this.isDateDisabled(date);
      
      let classes = 'custom-date-picker-day';
      if (!isCurrentMonth) classes += ' other-month';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';
      if (isDisabled) classes += ' disabled';
      
      html += `<div class="${classes}" data-date="${this.formatDate(date)}" ${isDisabled ? '' : 'data-action="select-date"'}>${date.getDate()}</div>`;
    }
    
    html += `
      </div>
      <div class="custom-date-picker-actions">
        <button type="button" class="custom-date-picker-btn" data-action="clear">${localizedText.clear}</button>
        <button type="button" class="custom-date-picker-btn" data-action="today">${localizedText.today}</button>
        <button type="button" class="custom-date-picker-btn primary" data-action="close">${localizedText.ok}</button>
      </div>
    `;
    
    this.picker.innerHTML = html;
    this.bindEvents();
  }
  
  renderMonthsView(localizedText) {
    const monthNames = localizedText.monthNames;
    const year = this.currentDate.getFullYear();
    
    let html = `
      <div class="custom-date-picker-header">
        <button type="button" class="custom-date-picker-nav" data-action="prev-year">‹</button>
        <div class="custom-date-picker-year-title">
          <button type="button" class="year-selector" data-action="show-years">${year}</button>
        </div>
        <button type="button" class="custom-date-picker-nav" data-action="next-year">›</button>
      </div>
      <div class="custom-date-picker-months-grid">
    `;
    
    monthNames.forEach((monthName, index) => {
      const isCurrentMonth = index === this.currentDate.getMonth();
      const classes = `custom-date-picker-month ${isCurrentMonth ? 'current' : ''}`;
      html += `<div class="${classes}" data-month="${index}" data-action="select-month">${monthName}</div>`;
    });
    
    html += `
      </div>
      <div class="custom-date-picker-actions">
        <button type="button" class="custom-date-picker-btn" data-action="back-to-days">Back</button>
      </div>
    `;
    
    this.picker.innerHTML = html;
    this.bindEvents();
  }
  
  renderYearsView(localizedText) {
    const currentYear = this.currentDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    
    let html = `
      <div class="custom-date-picker-header">
        <button type="button" class="custom-date-picker-nav" data-action="prev-decade">‹</button>
        <div class="custom-date-picker-decade-title">${startYear} - ${startYear + 9}</div>
        <button type="button" class="custom-date-picker-nav" data-action="next-decade">›</button>
      </div>
      <div class="custom-date-picker-years-grid">
    `;
    
    for (let i = 0; i < 10; i++) {
      const year = startYear + i;
      const isCurrentYear = year === currentYear;
      const classes = `custom-date-picker-year ${isCurrentYear ? 'current' : ''}`;
      html += `<div class="${classes}" data-year="${year}" data-action="select-year">${year}</div>`;
    }
    
    html += `
      </div>
      <div class="custom-date-picker-actions">
        <button type="button" class="custom-date-picker-btn" data-action="back-to-months">Back</button>
      </div>
    `;
    
    this.picker.innerHTML = html;
    this.bindEvents();
  }
  
  generateYearOptions(currentYear) {
    const startYear = currentYear - 50;
    const endYear = currentYear + 50;
    let options = '';
    
    for (let year = startYear; year <= endYear; year++) {
      const selected = year === currentYear ? 'selected' : '';
      options += `<option value="${year}" ${selected}>${year}</option>`;
    }
    
    return options;
  }
  
  bindEvents() {
    // 移除之前的事件监听器
    this.picker.removeEventListener('click', this.handleClick);
    this.picker.removeEventListener('change', this.handleChange);
    
    // 重新绑定事件监听器
    this.picker.addEventListener('click', this.handleClick);
    this.picker.addEventListener('change', this.handleChange);
  }
  
  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const action = e.target.dataset.action;
    const date = e.target.dataset.date;
    const month = e.target.dataset.month;
    const year = e.target.dataset.year;
    
    console.log('Click detected:', action, e.target); // 调试日志
    
    switch (action) {
      case 'prev-month':
        console.log('Previous month clicked');
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        break;
      case 'next-month':
        console.log('Next month clicked');
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        break;
      case 'prev-year':
        this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
        this.render();
        break;
      case 'next-year':
        this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
        this.render();
        break;
      case 'prev-decade':
        this.currentDate.setFullYear(this.currentDate.getFullYear() - 10);
        this.render();
        break;
      case 'next-decade':
        this.currentDate.setFullYear(this.currentDate.getFullYear() + 10);
        this.render();
        break;
      case 'show-months':
        this.viewMode = 'months';
        this.render();
        break;
      case 'show-years':
        this.viewMode = 'years';
        this.render();
        break;
      case 'select-month':
        this.currentDate.setMonth(parseInt(month));
        this.viewMode = 'days';
        this.render();
        break;
      case 'select-year':
        this.currentDate.setFullYear(parseInt(year));
        this.viewMode = 'months';
        this.render();
        break;
      case 'back-to-days':
        this.viewMode = 'days';
        this.render();
        break;
      case 'back-to-months':
        this.viewMode = 'months';
        this.render();
        break;
      case 'select-date':
        if (date && !e.target.classList.contains('disabled')) {
          this.selectedDate = new Date(date);
          this.input.value = this.formatDate(this.selectedDate);
          this.render();
        }
        break;
      case 'clear':
        this.selectedDate = null;
        this.input.value = '';
        this.close();
        break;
      case 'today':
        this.selectedDate = new Date();
        this.currentDate = new Date();
        this.input.value = this.formatDate(this.selectedDate);
        this.viewMode = 'days';
        this.render();
        break;
      case 'close':
        this.close();
        break;
    }
  }
  
  handleChange(e) {
    const action = e.target.dataset.action;
    
    if (action === 'change-month') {
      this.currentDate.setMonth(parseInt(e.target.value));
      this.render();
    } else if (action === 'change-year') {
      this.currentDate.setFullYear(parseInt(e.target.value));
      this.render();
    }
  }
  
  isDateDisabled(date) {
    if (this.options.minDate) {
      const minDate = new Date(this.options.minDate);
      if (date < minDate) return true;
    }
    
    if (this.options.maxDate) {
      const maxDate = new Date(this.options.maxDate);
      if (date > maxDate) return true;
    }
    
    return false;
  }
  
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  isToday(date) {
    const today = new Date();
    return this.isSameDate(date, today);
  }
  
  isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}

// 全局成功弹窗函数
function showSuccessModal() {
  // 获取页面语言
  const locale = document.documentElement.lang || 'en';
  
  // 从全局变量获取自定义文本
  let customTitle = '';
  let customMessage = '';
  
  if (window.enhancedFormSettings) {
    customTitle = window.enhancedFormSettings.successTitle[locale] || window.enhancedFormSettings.successTitle.en;
    customMessage = window.enhancedFormSettings.successMessage[locale] || window.enhancedFormSettings.successMessage.en;
  }
  
  // 多语言文本配置（作为fallback）
  const translations = {
    en: {
      title: customTitle || 'Thank you!',
      message: customMessage || 'Your form has been submitted successfully.',
      notification: 'A notification has been sent to our team.',
      button: 'Close'
    },
    de: {
      title: customTitle || 'Vielen Dank!',
      message: customMessage || 'Ihr Formular wurde erfolgreich übermittelt.',
      notification: 'Eine Benachrichtigung wurde an unser Team gesendet.',
      button: 'Schließen'
    },
    fr: {
      title: customTitle || 'Merci!',
      message: customMessage || 'Votre formulaire a été soumis avec succès.',
      notification: 'Une notification a été envoyée à notre équipe.',
      button: 'Fermer'
    },
    fi: {
      title: customTitle || 'Kiitos!',
      message: customMessage || 'Lomakkeesi on lähetetty onnistuneesti.',
      notification: 'Ilmoitus on lähetetty tiimillemme.',
      button: 'Sulje'
    }
  };
  
  // 获取当前语言的文本，如果找不到则使用英语
  const texts = translations[locale.toLowerCase()] || translations.en;
  
  // 使用自定义文本或默认文本
  const finalTitle = texts.title;
  const finalMessage = texts.message;
  
  // 创建正确的模态框结构
  const modal = document.createElement('modal-dialog');
  modal.className = 'modal';
  modal.setAttribute('open', '');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: visible;
    background-color: rgba(0, 0, 0, 0.5);
  `;
  
  modal.innerHTML = `
    <div class="modal__window" style="
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      transform: scale(1);
      opacity: 1;
      position: relative;
    ">
      <button type="button" class="modal__close-btn js-close-modal" aria-label="Close" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        z-index: 1;
      ">&times;</button>
      <div class="modal__content" style="
        padding: 40px 30px 30px 30px;
        text-align: center;
      ">
        <div class="feedback-success-message" style="
          display: block;
        ">
          <h3 style="
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 1rem 0;
          ">${finalTitle}</h3>
          <p style="
            color: #64748b;
            line-height: 1.6;
            margin: 0 0 1rem 0;
            font-size: 1rem;
          ">${finalMessage}</p>
          <div style="
            background: #e3f2fd;
            padding: 1rem;
            border-radius: 8px;
            margin: 1.5rem 0;
            color: #1565c0;
            font-size: 0.95rem;
          ">
            ${texts.notification}
          </div>
          <button class="feedback-success-close" onclick="this.closest('.modal').remove()" style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
          ">${texts.button}</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 添加事件监听器
  const closeBtn = modal.querySelector('.modal__close-btn');
  
  closeBtn.addEventListener('click', function() {
    modal.remove();
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      modal.remove();
    }
  });
  
  // ESC键关闭
  const handleEscape = function(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  
  // 添加悬停效果
  const successBtn = modal.querySelector('.feedback-success-close');
  successBtn.addEventListener('mouseenter', function() {
    this.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    this.style.transform = 'translateY(-1px)';
    this.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
  });
  
  successBtn.addEventListener('mouseleave', function() {
    this.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  });
}

// 初始化自定义日期选择器
document.addEventListener('DOMContentLoaded', function() {
  // 添加表单验证功能
  initFormValidation();
  
  // 初始化日期输入框
  document.querySelectorAll('.custom-date-input').forEach(input => {
    const wrapper = input.parentElement;
    const minDate = input.dataset.minDate;
    const maxDate = input.dataset.maxDate;
    
    new CustomDatePicker(input, {
      minDate: minDate,
      maxDate: maxDate
    });
  });
  
  document.querySelectorAll('.custom-time-input').forEach(input => {
    input.addEventListener('click', function() {
      const locale = document.documentElement.lang || 'en';
      const prompts = {
        en: 'Please enter time (HH:MM):',
        de: 'Bitte geben Sie die Zeit ein (HH:MM):',
        fr: 'Veuillez saisir l\'heure (HH:MM):',
        fi: 'Anna aika (HH:MM):'
      };
      
      const prompt_text = prompts[locale.toLowerCase()] || prompts.en;
      const time = prompt(prompt_text, this.value || '12:00');
      if (time && /^\d{2}:\d{2}$/.test(time)) {
        this.value = time;
      }
    });
  });

  document.querySelectorAll('.custom-datetime-input').forEach(input => {
    input.addEventListener('click', function() {
      const locale = document.documentElement.lang || 'en';
      const prompts = {
        en: 'Please enter date and time (YYYY-MM-DD HH:MM):',
        de: 'Bitte geben Sie Datum und Zeit ein (YYYY-MM-DD HH:MM):',
        fr: 'Veuillez saisir la date et l\'heure (YYYY-MM-DD HH:MM):',
        fi: 'Anna päivämäärä ja aika (YYYY-MM-DD HH:MM):'
      };
      
      const prompt_text = prompts[locale.toLowerCase()] || prompts.en;
      const datetime = prompt(prompt_text, this.value || '2025-01-01 12:00');
      if (datetime && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(datetime)) {
        this.value = datetime;
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const dropdowns = document.querySelectorAll('.multilevel-dropdown-wrapper');
  console.log('Found five-level dropdowns:', dropdowns.length);
  
  dropdowns.forEach(dropdown => {
    new FiveLevelDropdown(dropdown);
  });
  
  // 在页面加载时保存表单数据
  const contactForm = document.querySelector('form[action*="contact"]');
  let savedFormData = {};
  
  if (contactForm) {
    // 保存当前表单数据
    const formData = new FormData(contactForm);
    for (let [key, value] of formData.entries()) {
      savedFormData[key] = value;
    }
  }
  
  // 检查URL参数，如果表单提交成功则显示弹窗
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('enhanced_form_posted') === 'true') {
    // 不要隐藏表单，只隐藏页面上的成功消息
    const successMessage = document.querySelector('.enhanced-form-section .enhanced-form-success-message');
    if (successMessage) {
      successMessage.style.display = 'none';
    }
    
    // 显示成功弹窗
    showSuccessModal();
    
    // 清理URL参数，避免刷新页面时重复显示弹窗
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
    
    // 恢复表单数据
    if (contactForm && Object.keys(savedFormData).length > 0) {
      // 从localStorage获取保存的数据
      const storedData = localStorage.getItem('formData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // 恢复表单字段值
        Object.keys(parsedData).forEach(key => {
          const field = contactForm.querySelector(`[name="${key}"]`);
          if (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
              field.checked = parsedData[key] === field.value;
            } else {
              field.value = parsedData[key];
            }
          }
        });
        
        // 清除localStorage中的数据
        localStorage.removeItem('formData');
      }
    }
    
    // 确保表单保持可见
    if (contactForm) {
      contactForm.style.display = 'block';
    }
  }
  
  // 在表单提交前保存数据到localStorage
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // 阻止默认的 Shopify 重定向行为
      e.preventDefault();
      
      // 先进行表单验证
      if (!validateForm(contactForm)) {
        return; // 如果验证失败，不提交表单
      }
      
      // 保存表单数据
      const formData = new FormData(contactForm);
      const dataToSave = {};
      
      for (let [key, value] of formData.entries()) {
        dataToSave[key] = value;
      }
      
      localStorage.setItem('formData', JSON.stringify(dataToSave));
      
      // 显示提交中状态
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }
      
      // 添加标志位防止重复提交
    let isSubmitted = false;
    
    // 手动提交表单数据到 Shopify
    fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })
    .then(response => {
      // 恢复按钮状态
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
      
      if (response.ok || response.status === 302) {
        // 提交成功（包括重定向响应），显示成功弹窗
        isSubmitted = true;
        showSuccessModal();
        // 重置表单
        contactForm.reset();
        // 清除保存的数据
        localStorage.removeItem('formData');
        // 清除所有错误信息
        clearAllErrors(contactForm);
      } else {
        // 提交失败，显示错误信息
        throw new Error(`Form submission failed with status: ${response.status}`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      
      // 恢复按钮状态
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
      
      // 只有在确实没有成功提交的情况下才显示错误
      if (!isSubmitted) {
        // 显示错误信息给用户
        showFormError(contactForm, 'There was an error submitting your form. Please try again.');
        
        // 移除传统提交的回退机制，避免页面跳转
        // 注释掉以下代码：
        // if (error.name === 'TypeError' && error.message.includes('fetch')) {
        //   console.log('Falling back to traditional form submission');
        //   contactForm.removeEventListener('submit', arguments.callee);
        //   contactForm.submit();
        // }
      }
    });
    });
  }
  

});

// 表单验证功能
function initFormValidation() {
  const forms = document.querySelectorAll('form[action*="contact"]');
  
  forms.forEach(form => {
    let isMouseClick = false;
    
    // 监听submit按钮的鼠标点击事件
    const submitBtn = form.querySelector('.enhanced-form-submit-btn, button[type="submit"]');
    
    // 添加动态按钮状态控制函数
    function updateSubmitButtonState() {
      if (!submitBtn) return;
      
      const isFormValid = checkFormValidity(form);
      
      if (isFormValid) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.removeAttribute('title');
      } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.setAttribute('title', getLocalizedText('form_incomplete'));
      }
    }
    
    // 检查表单完整性的函数
    function checkFormValidity(form) {
      // 检查所有必填的普通字段
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      for (let field of requiredFields) {
        if (!field.value.trim()) {
          return false;
        }
        // 特殊验证邮箱格式
        if (field.type === 'email' && field.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            return false;
          }
        }
      }
      
      // 检查所有必填的多级下拉框
      const requiredDropdowns = form.querySelectorAll('.multilevel-dropdown-wrapper');
      for (let wrapper of requiredDropdowns) {
        const hiddenInput = wrapper.querySelector('input[type="hidden"][required]');
        if (hiddenInput && !hiddenInput.value.trim()) {
          return false;
        }
      }
      
      return true;
    }
    
    // 初始化按钮状态
    updateSubmitButtonState();
    
    if (submitBtn) {
      submitBtn.addEventListener('mousedown', function(event) {
        // 只有鼠标左键点击才标记为有效
        if (event.button === 0) {
          isMouseClick = true;
        }
      });
      
      submitBtn.addEventListener('mouseup', function(event) {
        // 鼠标抬起后重置标记
        setTimeout(() => {
          isMouseClick = false;
        }, 100);
      });
      
      // 阻止键盘事件触发按钮点击
      submitBtn.addEventListener('keydown', function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
      
      submitBtn.addEventListener('keyup', function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      });
    }
    
    // 为表单添加提交验证
    form.addEventListener('submit', function(event) {
      // 严格检查：只有鼠标点击才允许提交
      if (!isMouseClick) {
        event.preventDefault();
        event.stopPropagation();
        console.log('表单提交被阻止：只允许鼠标点击submit按钮提交');
        return false;
      }
      
      if (!validateForm(this)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });
    
    // 阻止键盘Enter键提交表单
    form.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });
    
    // 阻止键盘Enter键在输入框中触发提交
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });
    });
    
    // 为必填字段添加实时验证
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
      // 失去焦点时验证
      field.addEventListener('blur', function() {
        validateField(this);
        updateSubmitButtonState();
      });
      
      // 输入时清除错误状态
      field.addEventListener('input', function() {
        clearFieldError(this);
        updateSubmitButtonState();
      });
    });
    
    // 为必填的多级下拉框添加验证
    const requiredDropdowns = form.querySelectorAll('.multilevel-dropdown-wrapper');
    requiredDropdowns.forEach(wrapper => {
      const hiddenInput = wrapper.querySelector('input[type="hidden"][required]');
      if (hiddenInput) {
        // 监听下拉框选择变化
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
              clearDropdownError(wrapper);
              updateSubmitButtonState();
            }
          });
        });
        observer.observe(hiddenInput, { attributes: true });
        
        // 监听下拉框点击事件来清除错误
        wrapper.addEventListener('click', function() {
          clearDropdownError(this);
        });
      }
    });
  });
}

// 验证整个表单
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  // 清除之前的错误提示
  clearAllErrors(form);
  
  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });
  
  // 添加 multilevel_dropdown 验证
  const requiredDropdowns = form.querySelectorAll('.multilevel-dropdown-wrapper');
  requiredDropdowns.forEach(wrapper => {
    const hiddenInput = wrapper.querySelector('input[type="hidden"][required]');
    if (hiddenInput && !validateMultilevelDropdown(wrapper, hiddenInput)) {
      isValid = false;
    }
  });
  
  // 如果有错误，滚动到第一个错误字段
  if (!isValid) {
    const firstError = form.querySelector('.field-error, .dropdown-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // 显示总体错误提示
    showFormError(form, getLocalizedText('form_validation_error'));
  }
  
  return isValid;
}

// 验证单个字段
function validateField(field) {
  const value = field.value.trim();
  const fieldType = field.type;
  const fieldName = field.name;
  
  // 检查是否为空
  if (!value) {
    showFieldError(field, getLocalizedText('field_required'));
    return false;
  }
  
  // 邮箱格式验证
  if (fieldType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, getLocalizedText('email_invalid'));
      return false;
    }
  }
  
  // 电话号码验证（如果是电话字段）
  if (fieldName.includes('phone') || fieldName.includes('tel')) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      showFieldError(field, getLocalizedText('phone_invalid'));
      return false;
    }
  }
  
  clearFieldError(field);
  return true;
}

// 显示字段错误
function showFieldError(field, message) {
  // 添加错误样式
  field.classList.add('field-error');
  
  // 移除现有错误消息
  const existingError = field.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // 创建错误消息元素
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  `;
  
  // 插入错误消息
  field.parentNode.appendChild(errorElement);
}

// 清除字段错误
function clearFieldError(field) {
  field.classList.remove('field-error');
  const errorMessage = field.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// 清除所有错误
function clearAllErrors(form) {
  const errorFields = form.querySelectorAll('.field-error');
  const errorMessages = form.querySelectorAll('.error-message');
  const formErrors = form.querySelectorAll('.form-error-message');
  const dropdownErrors = form.querySelectorAll('.dropdown-error');
  
  errorFields.forEach(field => field.classList.remove('field-error'));
  errorMessages.forEach(msg => msg.remove());
  formErrors.forEach(msg => msg.remove());
  dropdownErrors.forEach(dropdown => dropdown.classList.remove('dropdown-error'));
}

// 显示表单总体错误
function showFormError(form, message) {
  const existingError = form.querySelector('.form-error-message');
  if (existingError) {
    existingError.remove();
  }
  
  const errorElement = document.createElement('div');
  errorElement.className = 'form-error-message';
  errorElement.innerHTML = `
    <div style="
      background-color: #fee;
      border: 1px solid #e74c3c;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 16px;
      color: #e74c3c;
      font-weight: 500;
    ">
      ⚠️ ${message}
    </div>
  `;
  
  form.insertBefore(errorElement, form.firstChild);
}

// 验证多级下拉框
function validateMultilevelDropdown(wrapper, hiddenInput) {
  const value = hiddenInput.value.trim();
  const selectionDisplay = wrapper.querySelector('.current-selection');
  
  // 检查是否为空
  if (!value) {
    showDropdownError(wrapper, getLocalizedText('field_required'));
    return false;
  }
  
  // 获取下拉菜单实例
  const dropdownInstance = wrapper.fiveLevelDropdownInstance;
  if (dropdownInstance) {
    // 获取当前选择的路径
    const selectedPath = dropdownInstance.selectedPath;
    
    // 获取当前下拉菜单的实际最大层级数
    const actualMaxLevels = dropdownInstance.getActualMaxLevels();
    
    // 检查用户是否选择了所有必要的层级
    if (selectedPath.length < actualMaxLevels) {
      showDropdownError(wrapper, getLocalizedText('incomplete_selection'));
      return false;
    }
  }
  
  clearDropdownError(wrapper);
  return true;
}

// 显示下拉框错误
function showDropdownError(wrapper, message) {
  // 添加错误样式
  const selectionDisplay = wrapper.querySelector('.current-selection');
  if (selectionDisplay) {
    selectionDisplay.classList.add('dropdown-error');
  }
  
  // 移除现有错误消息
  const existingError = wrapper.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // 创建错误消息元素
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    color: #e74c3c;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  `;
  
  // 插入错误消息
  wrapper.appendChild(errorElement);
}

// 清除下拉框错误
function clearDropdownError(wrapper) {
  const selectionDisplay = wrapper.querySelector('.current-selection');
  if (selectionDisplay) {
    selectionDisplay.classList.remove('dropdown-error');
  }
  const errorMessage = wrapper.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

// 获取本地化文本
function getLocalizedText(key) {
  const locale = document.documentElement.lang || 'en';
  
  const translations = {
    en: {
      field_required: 'This field is required',
      email_invalid: 'Please enter a valid email address',
      phone_invalid: 'Please enter a valid phone number',
      form_validation_error: 'Please fill in all required fields correctly',
      dropdown_required: 'Please select an option',
      form_incomplete: 'Please fill in all required fields before submitting',
      incomplete_selection: 'Please complete all levels of selection'
    },
    de: {
      field_required: 'Dieses Feld ist erforderlich',
      email_invalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      phone_invalid: 'Bitte geben Sie eine gültige Telefonnummer ein',
      form_validation_error: 'Bitte füllen Sie alle Pflichtfelder korrekt aus',
      dropdown_required: 'Bitte wählen Sie eine Option',
      form_incomplete: 'Bitte füllen Sie alle Pflichtfelder aus, bevor Sie das Formular absenden',
      incomplete_selection: 'Bitte wählen Sie alle Ebenen aus'
    },
    fr: {
      field_required: 'Ce champ est obligatoire',
      email_invalid: 'Veuillez saisir une adresse e-mail valide',
      phone_invalid: 'Veuillez saisir un numéro de téléphone valide',
      form_validation_error: 'Veuillez remplir correctement tous les champs obligatoires',
      dropdown_required: 'Veuillez sélectionner une option',
      form_incomplete: 'Veuillez remplir tous les champs obligatoires avant de soumettre',
      incomplete_selection: 'Veuillez compléter tous les niveaux de sélection'
    },
    fi: {
      field_required: 'Tämä kenttä on pakollinen',
      email_invalid: 'Syötä kelvollinen sähköpostiosoite',
      phone_invalid: 'Syötä kelvollinen puhelinnumero',
      form_validation_error: 'Täytä kaikki pakolliset kentät oikein',
      dropdown_required: 'Valitse vaihtoehto',
      form_incomplete: 'Täytä kaikki pakolliset kentät ennen lähettämistä',
      incomplete_selection: 'Valitse kaikki tasot'
    }
  };
  
  return translations[locale.toLowerCase()]?.[key] || translations.en[key];
}

// 添加CSS样式
function addValidationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .field-error {
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }
    
    .field-error:focus {
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3) !important;
    }
    
    .dropdown-error .current-selection {
      border-color: #e74c3c !important;
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
    }
    
    .error-message, .dropdown-error-message {
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .required-asterisk {
      color: #e74c3c;
      margin-left: 2px;
    }
  `;
  document.head.appendChild(style);
}

// 初始化样式
addValidationStyles();
