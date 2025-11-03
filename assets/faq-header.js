/**
 * Returns a function that as long as it continues to be invoked, won't be triggered.
 * @param {Function} fn - Callback function.
 * @param {number} [wait=300] - Delay (in milliseconds).
 * @returns {Function}
 */
function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

if (!customElements.get('faq-header')) {
  const FaqHeader = class extends HTMLElement {
    connectedCallback() {
      this.classNames = {
        questionContainerInactive: 'faq-search-item-inactive',
        sectionWithIndexStatus: 'section-faq-header--with-index'
      };

      this.searchInput = this.querySelector('.faq-search__input');
      if (this.searchInput) {
        this.searchInput.addEventListener('change', this.performSearch.bind(this));
        this.searchInput.addEventListener('keyup', this.performSearch.bind(this));
        this.searchInput.addEventListener('paste', this.performSearch.bind(this));
      }

      this.debouncedBuildIndex = debounce(this.buildIndex.bind(this), 100);
      document.addEventListener('theme:faq-header-update', this.debouncedBuildIndex);
      this.debouncedBuildIndex();

      if (this.querySelector('.faq-index')) {
        this.addEventListener('click', FaqHeader.handleIndexClick.bind(this));
        this.closest('.section-faq-header').classList.add(this.classNames.sectionWithIndexStatus);
        
        // Initialize index with proper timing
        requestAnimationFrame(() => {
          this.resizeIndex.call(this);
        });
        
        this.debouncedResizeIndex = debounce(this.resizeIndex.bind(this), 100);
        window.addEventListener('resize', this.debouncedResizeIndex);
      }
    }

    disconnectedCallback() {
      document.removeEventListener('theme:faq-header-update', this.debouncedBuildIndex);
      window.removeEventListener('resize', this.debouncedResizeIndex);
    }

    buildIndex() {
      const faqHeaderSection = this.closest('.section-faq-header');
      const indexContainer = this.querySelector('.faq-index__item-container');

      if (indexContainer) {
        indexContainer.querySelectorAll('.faq-index-item').forEach((el) => {
          el.parentNode.removeChild(el);
        });
      }

      this.linkedCollapsibleTabs = [];
      this.linkedQuestionContainers = [];
      this.linkedContent = [];
      this.linkedHeadings = []; // Add array to track section headings

      let currentElement = faqHeaderSection;
      while (currentElement.nextElementSibling && currentElement.nextElementSibling.classList.contains('section-collapsible-tabs')) {
        currentElement = currentElement.nextElementSibling;

        // build list of searchable content
        this.linkedCollapsibleTabs.push(currentElement);
        currentElement.querySelectorAll('.collapsible-tabs__question').forEach((el) => this.linkedQuestionContainers.push(el));
        currentElement.querySelectorAll('.collapsible-tabs__content-block, .collapsible-tabs__button-wrapper').forEach((el) => this.linkedContent.push(el));
        
        // Collect section headings to hide during search
        const currentElementHeading = currentElement.querySelector('.collapsible-tabs__heading');
        if (currentElementHeading) {
          this.linkedHeadings.push(currentElementHeading);
        }

        // build index UI
        if (indexContainer) {
          const currentElementHeading = currentElement.querySelector('.collapsible-tabs__heading');
          if (currentElementHeading) {
            const html = `
              <div class="faq-index-item">
                <a class="faq-index-item__link"></a>
              </div>`;
            const htmlFragment = document.createRange().createContextualFragment(html);
            const link = htmlFragment.querySelector('.faq-index-item__link');
            link.href = `#${currentElementHeading.id}`;
            link.innerHTML = currentElementHeading.innerHTML;
            indexContainer.appendChild(htmlFragment);
          }
        }
      }

      // Delay resizeIndex to prevent layout jumping
      if (indexContainer) {
        requestAnimationFrame(() => {
          this.resizeIndex.call(this);
        });
      }
    }

    resizeIndex() {
      const stickyContainer = this.querySelector('.faq-index__sticky-container');
      const faqHeaderSection = this.closest('.section-faq-header');

      if (!stickyContainer || !faqHeaderSection) {
        return;
      }

      let currentElement = faqHeaderSection;
      while (currentElement.nextElementSibling && currentElement.nextElementSibling.classList.contains('section-collapsible-tabs')) {
        currentElement = currentElement.nextElementSibling;
      }

      // Use setTimeout to ensure DOM is fully rendered before calculating dimensions
      setTimeout(() => {
        const stickyContainerRect = stickyContainer.getBoundingClientRect();
        const currentElementRect = currentElement.getBoundingClientRect();

        if (stickyContainerRect.top && currentElementRect.bottom) {
          const calculatedHeight = currentElementRect.bottom - stickyContainerRect.top;
          if (calculatedHeight > 0) {
            stickyContainer.style.height = `${calculatedHeight}px`;
          }
        }
      }, 0);
    }

    performSearch() {
      // defer to avoid input lag
      setTimeout(() => {
        const splitValue = this.searchInput.value.split(' ');

        // sanitise terms
        const terms = [];
        splitValue.forEach((t) => {
          if (t.length > 0) {
            terms.push(t.toLowerCase());
          }
        });

        // Add/remove searching class for styling and apply inline styles
        this.linkedCollapsibleTabs.forEach((section) => {
          const blocksContainer = section.querySelector('.collapsible-tabs__blocks');
          const blocks = section.querySelectorAll('.collapsible-tabs__block');
          const details = section.querySelectorAll('.collapsible-tabs__details');
          
          if (terms.length) {
            section.classList.add('faq-searching');
            
            // Apply tight spacing styles when searching
            if (blocksContainer) {
              blocksContainer.style.gap = '0.125rem';
            }
            
            blocks.forEach(block => {
              block.style.marginBottom = '0.125rem';
              block.style.marginTop = '0';
            });
            
            details.forEach(detail => {
              detail.style.marginBottom = '0.125rem';
              detail.style.marginTop = '0';
            });

            // Reduce spacing between sections during search
            section.style.marginBottom = '0.5rem';
            section.style.marginTop = '0.5rem';
            
            // Also reduce spacing on the collapsible-tabs container within the section
            const collapsibleTabsContainer = section.querySelector('.collapsible-tabs');
            if (collapsibleTabsContainer) {
              collapsibleTabsContainer.style.marginTop = '0';
              collapsibleTabsContainer.style.marginBottom = '0';
            }
          } else {
            section.classList.remove('faq-searching');
            
            // Reset to original spacing when not searching
            if (blocksContainer) {
              blocksContainer.style.gap = '';
            }
            
            blocks.forEach(block => {
              block.style.marginBottom = '';
              block.style.marginTop = '';
            });
            
            details.forEach(detail => {
              detail.style.marginBottom = '';
              detail.style.marginTop = '';
            });

            // Reset section spacing
            section.style.marginBottom = '';
            section.style.marginTop = '';
            
            // Reset collapsible-tabs container spacing
            const collapsibleTabsContainer = section.querySelector('.collapsible-tabs');
            if (collapsibleTabsContainer) {
              collapsibleTabsContainer.style.marginTop = '';
              collapsibleTabsContainer.style.marginBottom = '';
            }
          }
        });

        // search
        this.linkedQuestionContainers.forEach((el) => {
          if (terms.length) {
            let termFound = false;
            // Search in both question title and answer content
            const questionTitle = el.querySelector('.collapsible-tabs__question-title, .collapsible-tabs__summary');
            const answerContent = el.querySelector('.collapsible-tabs__answer, .collapsible-tabs__text');
            
            let matchContent = '';
            if (questionTitle) {
              matchContent += questionTitle.textContent.toLowerCase() + ' ';
            }
            if (answerContent) {
              matchContent += answerContent.textContent.toLowerCase();
            }
            
            // Fallback to element's full text content if specific elements not found
            if (!matchContent.trim()) {
              matchContent = el.textContent.toLowerCase();
            }
            
            terms.forEach((term) => {
              if (matchContent.indexOf(term) >= 0) {
                termFound = true;
              }
            });
            if (termFound) {
              el.classList.remove(this.classNames.questionContainerInactive);
            } else {
              el.classList.add(this.classNames.questionContainerInactive);
            }
          } else {
            el.classList.remove(this.classNames.questionContainerInactive);
          }
        });

        // hide non-question content if doing a search
        this.linkedContent.forEach((el) => {
          if (terms.length) {
            el.classList.add(this.classNames.questionContainerInactive);
          } else {
            el.classList.remove(this.classNames.questionContainerInactive);
          }
        });

        // hide section headings during search
        this.linkedHeadings.forEach((el) => {
          if (terms.length) {
            el.classList.add(this.classNames.questionContainerInactive);
          } else {
            el.classList.remove(this.classNames.questionContainerInactive);
          }
        });
      }, 10);
    }

    static handleIndexClick(evt) {
      if (evt.target.classList.contains('faq-index-item__link')) {
        evt.preventDefault();
        const id = evt.target.href.split('#')[1];
        const scrollTarget = document.getElementById(id);
        let scrollTargetY = scrollTarget.getBoundingClientRect().top + window.pageYOffset - 50;

        // sticky header offset
        const stickyHeight = getComputedStyle(document.documentElement).getPropertyValue('--theme-sticky-header-height');
        if (stickyHeight) {
          scrollTargetY -= parseInt(stickyHeight, 10);
        }

        window.scrollTo({
          top: scrollTargetY,
          behavior: 'smooth'
        });
      }
    }
  };

  window.customElements.define('faq-header', FaqHeader);
}
