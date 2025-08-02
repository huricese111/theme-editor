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

// 自定义日期选择器功能
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
    
    // 获取当前语言设置
    this.locale = this.getLocale();
    
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
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        clear: 'Clear',
        today: 'Today',
        ok: 'OK'
      },
      de: {
        monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        clear: 'Löschen',
        today: 'Heute',
        ok: 'OK'
      },
      fr: {
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        dayNames: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        clear: 'Effacer',
        today: 'Aujourd\'hui',
        ok: 'OK'
      },
      fi: {
        monthNames: ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
                    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'],
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
    const monthNames = localizedText.monthNames;
    const dayNames = localizedText.dayNames;
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    let html = `
      <div class="custom-date-picker-header">
        <button type="button" class="custom-date-picker-nav" data-action="prev-month">‹</button>
        <div class="custom-date-picker-month-year">${monthNames[month]} ${year}</div>
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
      
      let classes = 'custom-date-picker-day';
      if (!isCurrentMonth) classes += ' other-month';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';
      
      html += `<div class="${classes}" data-date="${this.formatDate(date)}">${date.getDate()}</div>`;
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
  
  bindEvents() {
    this.picker.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const date = e.target.dataset.date;
      
      if (action === 'prev-month') {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      } else if (action === 'next-month') {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      } else if (action === 'clear') {
        this.selectedDate = null;
        this.input.value = '';
        this.close();
      } else if (action === 'today') {
        this.selectedDate = new Date();
        this.input.value = this.formatDate(this.selectedDate);
        this.close();
      } else if (action === 'close') {
        this.close();
      } else if (date) {
        this.selectedDate = new Date(date);
        this.input.value = this.formatDate(this.selectedDate);
        this.render();
      }
    });
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

// 初始化自定义日期选择器
document.addEventListener('DOMContentLoaded', function() {
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
  if (urlParams.get('contact_posted') === 'true') {
    // 不要隐藏表单，只隐藏页面上的成功消息
    const successMessage = document.querySelector('.form-success-message');
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
    contactForm.addEventListener('submit', function() {
      const formData = new FormData(contactForm);
      const dataToSave = {};
      
      for (let [key, value] of formData.entries()) {
        dataToSave[key] = value;
      }
      
      localStorage.setItem('formData', JSON.stringify(dataToSave));
    });
  }
  
  function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>✅ Thank you!</h3>
          </div>
          <div class="modal-body">
            <p>Your form has been submitted successfully.</p>
            <p class="email-notification-info">A notification has been sent to our team.</p>
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
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        modal.remove();
      }
    });
  }
});
