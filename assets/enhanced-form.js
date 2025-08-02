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
    
    this.init();
  }
  
  loadData() {
    try {
      const dataElement = this.wrapper.querySelector(`#data-${this.fieldName}`);
      if (!dataElement) {
        console.warn('No data element found for field:', this.fieldName);
        return { level1: [], level2: [], level3: [], level4: [], level5: [] };
      }
      
      const rawData = JSON.parse(dataElement.textContent);
      
      const processedData = {
        level1: this.processDataArray(rawData.level1),
        level2: this.processDataArray(rawData.level2),
        level3: this.processDataArray(rawData.level3),
        level4: this.processDataArray(rawData.level4),
        level5: this.processDataArray(rawData.level5)
      };
      
      return processedData;
    } catch (e) {
      console.error('Error parsing data:', e);
      return { level1: [], level2: [], level3: [], level4: [], level5: [] };
    }
  }
  
  processDataArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    
    const result = [];
    dataArray.forEach(item => {
      if (typeof item === 'string' && item.trim()) {
        if (item.includes('\n')) {
          const splitItems = item.split('\n').filter(subItem => subItem.trim());
          result.push(...splitItems);
        } else {
          result.push(item);
        }
      }
    });
    
    return result;
  }
  
  init() {
    if (!this.selectionDisplay || !this.panel) {
      console.error('Required elements not found for dropdown:', this.fieldName);
      return;
    }
    
    this.bindEvents();
    this.showLevel1();
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
  }
  
  toggleDropdown() {
    if (this.panel.style.display === 'none' || this.panel.style.display === '') {
      this.openDropdown();
    } else {
      this.closeDropdown();
    }
  }
  
  openDropdown() {
    this.panel.style.display = 'block';
    this.selectionDisplay.classList.add('active');
  }
  
  closeDropdown() {
    this.panel.style.display = 'none';
    this.selectionDisplay.classList.remove('active');
  }
  
  showLevel1() {
    const level1Options = this.data.level1 || [];
    this.renderColumn(level1Options, 1);
    this.hideColumns([2, 3, 4, 5]); // 支持5栏
    this.updateBreadcrumb();
  }
  
  showNextLevel(parentValue, currentLevel) {
    const nextLevel = currentLevel + 1;
    if (nextLevel > this.maxLevels) return;
    
    const nextLevelData = this.data[`level${nextLevel}`] || [];
    const childOptions = [];
    
    nextLevelData.forEach(item => {
      if (typeof item === 'string' && item.includes('>')) {
        const parts = item.split('>');
        if (parts[0].trim() === parentValue) {
          childOptions.push(parts[1].trim());
        }
      }
    });
    
    this.renderColumn(childOptions, nextLevel);
    // 隐藏后续所有栏目
    const columnsToHide = [];
    for (let i = nextLevel + 1; i <= this.maxLevels; i++) {
      columnsToHide.push(i);
    }
    this.hideColumns(columnsToHide);
  }
  
  renderColumn(options, level) {
    const column = this.wrapper.querySelector(`.level-${level}-column`);
    const content = this.wrapper.querySelector(`#level-${level}-${this.fieldName}`);
    
    if (!column || !content) return;
    
    content.innerHTML = '';
    column.style.display = 'block';
    
    options.forEach(option => {
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
      }
    });
  }
  
  selectOption(value, level, hasChildren) {
    this.selectedPath[level - 1] = value;
    this.selectedPath = this.selectedPath.slice(0, level);
    
    this.updateSelectedStates(level, value);
    
    if (hasChildren && level < this.maxLevels) {
      this.showNextLevel(value, level);
    } else {
      this.finalizeSelection();
    }
    
    this.updateBreadcrumb();
  }
  
  hasChildrenForOption(option, level) {
    if (level >= this.maxLevels) return false;
    
    const nextLevelData = this.data[`level${level + 1}`] || [];
    return nextLevelData.some(item => {
      if (typeof item === 'string' && item.includes('>')) {
        const parts = item.split('>');
        return parts[0].trim() === option;
      }
      return false;
    });
  }
  
  hideColumns(levels) {
    levels.forEach(level => {
      const column = this.wrapper.querySelector(`.level-${level}-column`);
      if (column) {
        column.style.display = 'none';
      }
    });
  }
  
  // 添加缺少的方法
  updateSelectedStates(level, selectedValue) {
    // 清除所有列的选中状态
    for (let i = 1; i <= this.maxLevels; i++) {
      const column = this.wrapper.querySelector(`.level-${i}-column`);
      if (column) {
        const items = column.querySelectorAll('.category-item');
        items.forEach(item => item.classList.remove('selected'));
      }
    }
    
    // 设置当前选中项的状态
    const currentColumn = this.wrapper.querySelector(`.level-${level}-column`);
    if (currentColumn) {
      const items = currentColumn.querySelectorAll('.category-item');
      items.forEach(item => {
        if (item.querySelector('.category-name').textContent === selectedValue) {
          item.classList.add('selected');
        }
      });
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
    
    // 关闭下拉框
    this.closeDropdown();
  }
  
  updateBreadcrumb() {
    if (!this.breadcrumb) return;
    
    if (this.selectedPath.length === 0) {
      this.breadcrumb.textContent = 'Browse for your category';
    } else {
      this.breadcrumb.textContent = this.selectedPath.join(' > ');
    }
  }
}

// 修复初始化代码 - 移除重复和错误的初始化
document.addEventListener('DOMContentLoaded', function() {
  const dropdowns = document.querySelectorAll('.multilevel-dropdown-wrapper');
  console.log('Found five-level dropdowns:', dropdowns.length);
  
  dropdowns.forEach(dropdown => {
    new FiveLevelDropdown(dropdown);
  });
  
  // Handle form submission
  const contactForm = document.querySelector('form[action*="contact"]');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Show loading state
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      
      // Submit form using fetch
      fetch(this.action, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (response.ok) {
          showSuccessModal();
          this.reset();
        } else {
          throw new Error('Submission failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showErrorModal();
      })
      .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }
  
  function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>✅ Success!</h3>
          </div>
          <div class="modal-body">
            <p>Your form has been submitted successfully. We will contact you soon.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--primary" onclick="this.closest('.success-modal').remove()">OK</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) {
        modal.remove();
      }
    });
  }
  
  function showErrorModal() {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>❌ Error</h3>
          </div>
          <div class="modal-body">
            <p>Sorry, form submission failed. Please try again later.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--primary" onclick="this.closest('.error-modal').remove()">OK</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) {
        modal.remove();
      }
    });
  }
});
