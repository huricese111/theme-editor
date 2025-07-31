function getCurrentLanguage() {
  const htmlLang = document.documentElement.lang || 'en';
  return htmlLang.toLowerCase().substring(0, 2);
}

const translations = {
  en: {
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    storeType: 'Store Type',
    more: 'More',
    less: 'Less',
    calculatingDistance: 'Calculating distance...',
    perPage: 'Per page',
    previousPage: 'Previous',
    nextPage: 'Next',
    showingResults: 'Showing {start}-{end} of {total} results',
    dealer: 'Dealer',
    rental: 'Rental Station',
    service: 'Service Center',
    'click-collect': 'Click & Collect'
  },
  de: {
    address: 'Adresse',
    phone: 'Telefon',
    email: 'E-Mail',
    website: 'Webseite',
    storeType: 'Geschäftstyp',
    more: 'Mehr',
    less: 'Weniger',
    calculatingDistance: 'Entfernung wird berechnet...',
    perPage: 'Pro Seite',
    previousPage: 'Zurück',
    nextPage: 'Weiter',
    showingResults: 'Zeige {start}-{end} von {total} Ergebnissen',
    dealer: 'Händler',
    rental: 'Rental Station',
    service: 'Servicezentrum',
    'click-collect': 'Click & Collect'
  },
  fr: {
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'E-mail',
    website: 'Site Web',
    storeType: 'Type de Magasin',
    more: 'Plus',
    less: 'Moins',
    calculatingDistance: 'Calcul de la distance...',
    perPage: 'Par page',
    previousPage: 'Précédent',
    nextPage: 'Suivant',
    showingResults: 'Affichage de {start}-{end} sur {total} résultats',
    dealer: 'Revendeur',
    rental: 'Rental Station',
    service: 'Centre de service',
    'click-collect': 'Click & Collect'
  },
  fi: {
    address: 'Osoite',
    phone: 'Puhelin',
    email: 'Sähköposti',
    website: 'Verkkosivusto',
    storeType: 'Myymälän Tyyppi',
    more: 'Lisää',
    less: 'Vähemmän',
    calculatingDistance: 'Lasketaan etäisyyttä...',
    perPage: 'Per sivu',
    previousPage: 'Edellinen',
    nextPage: 'Seuraava',
    showingResults: 'Näytetään {start}-{end} / {total} tulosta',
    dealer: 'Jälleenmyyjä',
    rental: 'Vuokraamo',
    service: 'Huoltokeskus',
    'click-collect': 'Click & Collect'
  }
};

const currentLang = getCurrentLanguage();
const i18nLabels = translations[currentLang] || translations.en;

document.addEventListener('DOMContentLoaded', function () {
  const locationCards = document.querySelectorAll('.location-card');
  const mapContainer = document.getElementById('map-container');
  const mapIframe = document.getElementById('map-iframe');
  const searchBtn = document.getElementById('search-btn');
  const locationSearch = document.getElementById('location-search');
  const locationResults = document.getElementById('location-results');
  const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');

  let allLocations = Array.from(locationCards);
  let filteredLocations = [...allLocations];
  let searchHistory = JSON.parse(localStorage.getItem('dealerSearchHistory') || '[]');
  let currentSuggestionIndex = -1;
  let searchTimeout;

  // 分页变量
  let currentPage = 1;
  let pageSize = 10;
  let totalItems = 0;
  let totalPages = 1;
  
  // 分页元素
  const paginationContainer = document.getElementById('pagination-container');
  const paginationStats = document.getElementById('pagination-stats');
  const pageSizeSelect = document.getElementById('page-size-select');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageInput = document.getElementById('page-input');
  const totalPagesSpan = document.getElementById('total-pages');
  const pageSizeLabel = document.querySelector('.page-size-label');
  const prevText = document.querySelector('.prev-text');
  const nextText = document.querySelector('.next-text');

  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'search-suggestions';
  suggestionsContainer.style.display = 'none';

  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search-input-wrapper';

  locationSearch.parentNode.insertBefore(searchWrapper, locationSearch);
  searchWrapper.appendChild(locationSearch);
  searchWrapper.appendChild(suggestionsContainer);

  if (!mapContainer) return;

  const apiKey = mapContainer.dataset.apiKey;
  const mapType = mapContainer.dataset.mapType;
  const mapStyle = mapContainer.dataset.mapStyle;

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }
  
  // 地理编码函数
  function geocodeAddress(address, callback) {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function(results, status) {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        callback({
          lat: location.lat(),
          lng: location.lng()
        });
      } else {
        console.error('Geocoding failed: ' + status);
        callback(null);
      }
    });
  }
  
  // 更新距离显示函数
  function updateDistances(userLocation) {
    if (!userLocation) return;
    
    allLocations.forEach(card => {
      const address = card.getAttribute('data-address');
      const city = card.getAttribute('data-city');
      const country = card.getAttribute('data-country');
      
      let fullAddress = '';
      if (address) fullAddress += address;
      if (city) fullAddress += (fullAddress ? ', ' : '') + city;
      if (country) fullAddress += (fullAddress ? ', ' : '') + country;
      
      if (fullAddress) {
        geocodeAddress(fullAddress, function(storeLocation) {
          if (storeLocation) {
            const distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              storeLocation.lat, storeLocation.lng
            );
            
            const distanceElement = card.querySelector('.location-card__distance');
            const distanceValue = card.querySelector('.distance-value');
            
            if (distanceElement && distanceValue) {
              distanceValue.textContent = distance.toFixed(1) + ' KM';
              distanceElement.style.display = 'block';
              distanceElement.classList.add('has-distance');
              
              // 存储距离数据用于排序
              card.setAttribute('data-distance', distance.toFixed(1));
            }
          }
        });
      }
    });
  }
  
  function performSearch(saveToHistory = true) {
    const searchTerm = locationSearch.value.toLowerCase().trim();
    const selectedFilters = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  
    // 首先根据过滤器筛选位置（无论是否有搜索词）
    if (selectedFilters.length > 0) {
      filteredLocations = allLocations.filter(card => {
        const storeType = card.getAttribute('data-store-type');
        return selectedFilters.includes(storeType);
      });
    } else {
      filteredLocations = [...allLocations];
    }
  
    // 如果有搜索词，保存到历史记录
    if (saveToHistory && searchTerm && !searchHistory.includes(searchTerm)) {
      searchHistory.unshift(searchTerm);
      searchHistory = searchHistory.slice(0, 10);
      localStorage.setItem('dealerSearchHistory', JSON.stringify(searchHistory));
    }
  
    // 如果有搜索词，进行地理编码和距离计算
    if (searchTerm && window.google && window.google.maps) {
      showLoadingState();
      
      geocodeAddress(searchTerm, function(userLocation) {
        if (userLocation) {
          updateDistancesAndSort(userLocation);
        } else {
          // 如果地理编码失败，则进行文本搜索
          filteredLocations = filteredLocations.filter(card => {
            const storeName = card.getAttribute('data-store-name')?.toLowerCase() || '';
            const city = card.getAttribute('data-city')?.toLowerCase() || '';
            const country = card.getAttribute('data-country')?.toLowerCase() || '';
            const address = card.getAttribute('data-address')?.toLowerCase() || '';
            const province = card.getAttribute('data-province')?.toLowerCase() || '';
            const postalCode = card.getAttribute('data-postal-code')?.toLowerCase() || '';
            
            return storeName.includes(searchTerm) ||
                   city.includes(searchTerm) ||
                   country.includes(searchTerm) ||
                   address.includes(searchTerm) ||
                   province.includes(searchTerm) ||
                   postalCode.includes(searchTerm);
          });
          hideLoadingState();
          displayResults();
        }
      });
    } else if (searchTerm) {
      // 如果没有Google Maps API，只进行文本搜索
      filteredLocations = filteredLocations.filter(card => {
        const storeName = card.getAttribute('data-store-name')?.toLowerCase() || '';
        const city = card.getAttribute('data-city')?.toLowerCase() || '';
        const country = card.getAttribute('data-country')?.toLowerCase() || '';
        const address = card.getAttribute('data-address')?.toLowerCase() || '';
        const province = card.getAttribute('data-province')?.toLowerCase() || '';
        const postalCode = card.getAttribute('data-postal-code')?.toLowerCase() || '';
        
        return storeName.includes(searchTerm) ||
               city.includes(searchTerm) ||
               country.includes(searchTerm) ||
               address.includes(searchTerm) ||
               province.includes(searchTerm) ||
               postalCode.includes(searchTerm);
      });
      displayResults();
    } else {
    displayResults();
  }

    hideSuggestions();
  }
  
  function showLoadingState() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'search-loading';
    loadingIndicator.className = 'search-loading';
    loadingIndicator.innerHTML = `<div class="loading-spinner"></div><span>${i18nLabels.calculatingDistance}</span>`;
    
    const existingLoading = document.getElementById('search-loading');
    if (existingLoading) {
      existingLoading.remove();
    }
    
    locationResults.insertBefore(loadingIndicator, locationResults.firstChild);
  }
  
  function hideLoadingState() {
    const loadingIndicator = document.getElementById('search-loading');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
  
  function updateDistancesAndSort(userLocation) {
    if (!userLocation) {
      hideLoadingState();
      displayResults();
      return;
    }
    
    let completedRequests = 0;
    const totalRequests = filteredLocations.length;
    
    if (totalRequests === 0) {
      hideLoadingState();
      displayResults();
      return;
    }
    
    filteredLocations.forEach(card => {
      const address = card.getAttribute('data-address');
      const city = card.getAttribute('data-city');
      const country = card.getAttribute('data-country');
      const postalCode = card.getAttribute('data-postal-code');
      const province = card.getAttribute('data-province');
      
      let fullAddress = '';
      if (address) fullAddress += address;
      if (postalCode) fullAddress += (fullAddress ? ', ' : '') + postalCode;
      if (city) fullAddress += (fullAddress ? ', ' : '') + city;
      if (province) fullAddress += (fullAddress ? ', ' : '') + province;
      if (country) fullAddress += (fullAddress ? ', ' : '') + country;
      
      if (fullAddress) {
        geocodeAddress(fullAddress, function(storeLocation) {
          completedRequests++;
          
          if (storeLocation) {
            const distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              storeLocation.lat, storeLocation.lng
            );
            
            const distanceElement = card.querySelector('.location-card__distance');
            const distanceValue = card.querySelector('.distance-value');
            
            if (distanceElement && distanceValue) {
              distanceValue.textContent = distance.toFixed(1) + ' KM';
              distanceElement.style.display = 'block';
              distanceElement.classList.add('has-distance');
              
              card.setAttribute('data-distance', distance.toFixed(1));
            }
          }
          
          if (completedRequests === totalRequests) {
            filteredLocations.sort((a, b) => {
              const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
              const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
              return distanceA - distanceB;
            });
            
            hideLoadingState();
            displayResults();
          }
        });
      } else {
        completedRequests++;
        if (completedRequests === totalRequests) {
          hideLoadingState();
          displayResults();
        }
      }
    });
  }
  
  function generateSuggestions(query) {
    const suggestions = [];
  
    const historyMatches = searchHistory
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
  
    suggestions.push(
      ...historyMatches.map((item) => ({
        text: item,
        type: 'history',
        icon: '🕒',
      }))
    );
  
    const locationSuggestions = new Set();
    allLocations.forEach((card) => {
      const storeName = card.getAttribute('data-store-name');
      const city = card.getAttribute('data-city');
      const country = card.getAttribute('data-country');
      const address = card.getAttribute('data-address');
      const postalCode = card.getAttribute('data-postal-code');
      const province = card.getAttribute('data-province');
  
      [storeName, city, country, province, postalCode].forEach((item) => {
        if (
          item &&
          item.toLowerCase().includes(query.toLowerCase()) &&
          !locationSuggestions.has(item) &&
          item.toLowerCase() !== query.toLowerCase()
        ) {
          locationSuggestions.add(item);
        }
      });
      
      if (address) {
        const addressParts = address.split(/[,\s]+/);
        addressParts.forEach(part => {
          if (
            part &&
            part.length > 2 &&
            part.toLowerCase().includes(query.toLowerCase()) &&
            !locationSuggestions.has(part) &&
            part.toLowerCase() !== query.toLowerCase()
          ) {
            locationSuggestions.add(part);
          }
        });
      }
    });
  
    suggestions.push(
      ...Array.from(locationSuggestions)
        .slice(0, 5)
        .map((item) => ({
          text: item,
          type: 'suggestion',
          icon: '📍',
        }))
    );
  
    return suggestions.slice(0, 8);
  }

  function showSuggestions(query) {
    if (!query.trim()) {
      hideSuggestions();
      return;
    }

    const suggestions = generateSuggestions(query);

    if (suggestions.length === 0) {
      hideSuggestions();
      return;
    }

    suggestionsContainer.innerHTML = suggestions
      .map(
        (suggestion, index) => `
      <div class="suggestion-item ${index === currentSuggestionIndex ? 'highlighted' : ''}" 
           data-index="${index}" data-text="${suggestion.text}">
        <span class="suggestion-icon">${suggestion.icon}</span>
        <span class="suggestion-text">${suggestion.text}</span>
        ${
          suggestion.type === 'history'
            ? '<span class="suggestion-remove" data-text="' + suggestion.text + '">×</span>'
            : ''
        }
      </div>
    `
      )
      .join('');

    suggestionsContainer.style.display = 'block';
  }

  function hideSuggestions() {
    suggestionsContainer.style.display = 'none';
    currentSuggestionIndex = -1;
  }

  function handleKeyboardNavigation(e) {
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
        updateSuggestionHighlight();
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
        updateSuggestionHighlight();
        break;

      case 'Enter':
        e.preventDefault();
        if (currentSuggestionIndex >= 0 && suggestions[currentSuggestionIndex]) {
          const selectedText = suggestions[currentSuggestionIndex].getAttribute('data-text');
          locationSearch.value = selectedText;
        }
        performSearch();
        break;

      case 'Escape':
        hideSuggestions();
        locationSearch.blur();
        break;
    }
  }

  function updateSuggestionHighlight() {
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, index) => {
      item.classList.toggle('highlighted', index === currentSuggestionIndex);
    });
  }

  function removeFromHistory(text) {
    searchHistory = searchHistory.filter((item) => item !== text);
    localStorage.setItem('dealerSearchHistory', JSON.stringify(searchHistory));
    showSuggestions(locationSearch.value);
  }

  // 统一的displayResults函数（支持分页）
  function displayResults() {
    // 计算当前页面要显示的项目
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const cardsToShow = filteredLocations.slice(startIndex, endIndex);
    
    // 使用requestAnimationFrame确保DOM更新的正确时序
    requestAnimationFrame(() => {
      // 隐藏所有卡片
      allLocations.forEach((card) => {
        card.classList.add('pagination-hidden');
        card.classList.remove('active');
      });
      
      // 立即显示当前页面的卡片
      cardsToShow.forEach((card) => {
        card.classList.remove('pagination-hidden');
      });
      
      // 激活第一个卡片并更新地图
      if (cardsToShow.length > 0) {
        cardsToShow[0].classList.add('active');
        updateMapForCard(cardsToShow[0]);
      }
    });
    
    // 更新分页信息
    updatePagination();
  }

  // 统一的performSearch函数
  function performSearch(saveToHistory = true) {
    // 重置到第一页
    currentPage = 1;
    
    const searchTerm = locationSearch.value.toLowerCase().trim();
    const selectedFilters = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
  
    // 首先根据过滤器筛选位置
    if (selectedFilters.length > 0) {
      filteredLocations = allLocations.filter(card => {
        const storeType = card.getAttribute('data-store-type');
        return selectedFilters.includes(storeType);
      });
    } else {
      filteredLocations = [...allLocations];
    }
  
    // 如果有搜索词，保存到历史记录
    if (saveToHistory && searchTerm && !searchHistory.includes(searchTerm)) {
      searchHistory.unshift(searchTerm);
      searchHistory = searchHistory.slice(0, 10);
      localStorage.setItem('dealerSearchHistory', JSON.stringify(searchHistory));
    }
  
    // 如果有搜索词，进行地理编码和距离计算
    if (searchTerm && window.google && window.google.maps) {
      showLoadingState();
      
      geocodeAddress(searchTerm, function(userLocation) {
        if (userLocation) {
          updateDistancesAndSort(userLocation);
        } else {
          // 如果地理编码失败，则进行文本搜索
          filteredLocations = filteredLocations.filter(card => {
            const storeName = card.getAttribute('data-store-name')?.toLowerCase() || '';
            const city = card.getAttribute('data-city')?.toLowerCase() || '';
            const country = card.getAttribute('data-country')?.toLowerCase() || '';
            const address = card.getAttribute('data-address')?.toLowerCase() || '';
            const province = card.getAttribute('data-province')?.toLowerCase() || '';
            const postalCode = card.getAttribute('data-postal-code')?.toLowerCase() || '';
            
            return storeName.includes(searchTerm) ||
                   city.includes(searchTerm) ||
                   country.includes(searchTerm) ||
                   address.includes(searchTerm) ||
                   province.includes(searchTerm) ||
                   postalCode.includes(searchTerm);
          });
          hideLoadingState();
          displayResults();
        }
      });
    } else if (searchTerm) {
      // 如果没有Google Maps API，只进行文本搜索
      filteredLocations = filteredLocations.filter(card => {
        const storeName = card.getAttribute('data-store-name')?.toLowerCase() || '';
        const city = card.getAttribute('data-city')?.toLowerCase() || '';
        const country = card.getAttribute('data-country')?.toLowerCase() || '';
        const address = card.getAttribute('data-address')?.toLowerCase() || '';
        const province = card.getAttribute('data-province')?.toLowerCase() || '';
        const postalCode = card.getAttribute('data-postal-code')?.toLowerCase() || '';
        
        return storeName.includes(searchTerm) ||
               city.includes(searchTerm) ||
               country.includes(searchTerm) ||
               address.includes(searchTerm) ||
               province.includes(searchTerm) ||
               postalCode.includes(searchTerm);
      });
      displayResults();
    } else {
      displayResults();
    }
  
    hideSuggestions();
  }
  
  function showLoadingState() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'search-loading';
    loadingIndicator.className = 'search-loading';
    loadingIndicator.innerHTML = `<div class="loading-spinner"></div><span>${i18nLabels.calculatingDistance}</span>`;
    
    const existingLoading = document.getElementById('search-loading');
    if (existingLoading) {
      existingLoading.remove();
    }
    
    locationResults.insertBefore(loadingIndicator, locationResults.firstChild);
  }
  
  function hideLoadingState() {
    const loadingIndicator = document.getElementById('search-loading');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
  
  function updateDistancesAndSort(userLocation) {
    if (!userLocation) {
      hideLoadingState();
      displayResults();
      return;
    }
    
    let completedRequests = 0;
    const totalRequests = filteredLocations.length;
    
    if (totalRequests === 0) {
      hideLoadingState();
      displayResults();
      return;
    }
    
    filteredLocations.forEach(card => {
      const address = card.getAttribute('data-address');
      const city = card.getAttribute('data-city');
      const country = card.getAttribute('data-country');
      const postalCode = card.getAttribute('data-postal-code');
      const province = card.getAttribute('data-province');
      
      let fullAddress = '';
      if (address) fullAddress += address;
      if (postalCode) fullAddress += (fullAddress ? ', ' : '') + postalCode;
      if (city) fullAddress += (fullAddress ? ', ' : '') + city;
      if (province) fullAddress += (fullAddress ? ', ' : '') + province;
      if (country) fullAddress += (fullAddress ? ', ' : '') + country;
      
      if (fullAddress) {
        geocodeAddress(fullAddress, function(storeLocation) {
          completedRequests++;
          
          if (storeLocation) {
            const distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              storeLocation.lat, storeLocation.lng
            );
            
            const distanceElement = card.querySelector('.location-card__distance');
            const distanceValue = card.querySelector('.distance-value');
            
            if (distanceElement && distanceValue) {
              distanceValue.textContent = distance.toFixed(1) + ' KM';
              distanceElement.style.display = 'block';
              distanceElement.classList.add('has-distance');
              
              card.setAttribute('data-distance', distance.toFixed(1));
            }
          }
          
          if (completedRequests === totalRequests) {
            filteredLocations.sort((a, b) => {
              const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
              const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
              return distanceA - distanceB;
            });
            
            hideLoadingState();
            displayResults();
          }
        });
      } else {
        completedRequests++;
        if (completedRequests === totalRequests) {
          hideLoadingState();
          displayResults();
        }
      }
    });
  }
  
  function generateSuggestions(query) {
    const suggestions = [];
  
    const historyMatches = searchHistory
      .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
  
    suggestions.push(
      ...historyMatches.map((item) => ({
        text: item,
        type: 'history',
        icon: '🕒',
      }))
    );
  
    const locationSuggestions = new Set();
    allLocations.forEach((card) => {
      const storeName = card.getAttribute('data-store-name');
      const city = card.getAttribute('data-city');
      const country = card.getAttribute('data-country');
      const address = card.getAttribute('data-address');
      const postalCode = card.getAttribute('data-postal-code');
      const province = card.getAttribute('data-province');
  
      [storeName, city, country, province, postalCode].forEach((item) => {
        if (
          item &&
          item.toLowerCase().includes(query.toLowerCase()) &&
          !locationSuggestions.has(item) &&
          item.toLowerCase() !== query.toLowerCase()
        ) {
          locationSuggestions.add(item);
        }
      });
      
      if (address) {
        const addressParts = address.split(/[,\s]+/);
        addressParts.forEach(part => {
          if (
            part &&
            part.length > 2 &&
            part.toLowerCase().includes(query.toLowerCase()) &&
            !locationSuggestions.has(part) &&
            part.toLowerCase() !== query.toLowerCase()
          ) {
            locationSuggestions.add(part);
          }
        });
      }
    });
  
    suggestions.push(
      ...Array.from(locationSuggestions)
        .slice(0, 5)
        .map((item) => ({
          text: item,
          type: 'suggestion',
          icon: '📍',
        }))
    );
  
    return suggestions.slice(0, 8);
  }

  function showSuggestions(query) {
    if (!query.trim()) {
      hideSuggestions();
      return;
    }

    const suggestions = generateSuggestions(query);

    if (suggestions.length === 0) {
      hideSuggestions();
      return;
    }

    suggestionsContainer.innerHTML = suggestions
      .map(
        (suggestion, index) => `
      <div class="suggestion-item ${index === currentSuggestionIndex ? 'highlighted' : ''}" 
           data-index="${index}" data-text="${suggestion.text}">
        <span class="suggestion-icon">${suggestion.icon}</span>
        <span class="suggestion-text">${suggestion.text}</span>
        ${
          suggestion.type === 'history'
            ? '<span class="suggestion-remove" data-text="' + suggestion.text + '">×</span>'
            : ''
        }
      </div>
    `
      )
      .join('');

    suggestionsContainer.style.display = 'block';
  }

  function hideSuggestions() {
    suggestionsContainer.style.display = 'none';
    currentSuggestionIndex = -1;
  }

  function handleKeyboardNavigation(e) {
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
        updateSuggestionHighlight();
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
        updateSuggestionHighlight();
        break;

      case 'Enter':
        e.preventDefault();
        if (currentSuggestionIndex >= 0 && suggestions[currentSuggestionIndex]) {
          const selectedText = suggestions[currentSuggestionIndex].getAttribute('data-text');
          locationSearch.value = selectedText;
        }
        performSearch();
        break;

      case 'Escape':
        hideSuggestions();
        locationSearch.blur();
        break;
    }
  }

  function updateSuggestionHighlight() {
    const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, index) => {
      item.classList.toggle('highlighted', index === currentSuggestionIndex);
    });
  }

  function removeFromHistory(text) {
    searchHistory = searchHistory.filter((item) => item !== text);
    localStorage.setItem('dealerSearchHistory', JSON.stringify(searchHistory));
    showSuggestions(locationSearch.value);
  }

  // 初始化分页功能
  function initializePagination() {
    if (!paginationContainer) return;
  
    // 设置初始文本内容
    updatePaginationTexts();
  
    // 页面大小选择器
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', function() {
        pageSize = parseInt(this.value);
        currentPage = 1;
        displayResults();
      });
    }
  
    // 上一页按钮
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
          currentPage--;
          displayResults();
          scrollToTop();
        }
      });
    }
  
    // 下一页按钮
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
          currentPage++;
          displayResults();
          scrollToTop();
        }
      });
    }
  
    // 页面输入
    if (pageInput) {
      pageInput.addEventListener('change', function() {
        const newPage = parseInt(this.value);
        if (newPage >= 1 && newPage <= totalPages) {
          currentPage = newPage;
          displayResults();
          scrollToTop();
        } else {
          this.value = currentPage;
        }
      });
  
      pageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          this.blur();
        }
      });
    }
  }
  
  // 更新分页文本
  function updatePaginationTexts() {
    if (pageSizeLabel) {
      pageSizeLabel.textContent = i18nLabels.perPage;
    }
    if (prevText) {
      prevText.textContent = i18nLabels.previousPage;
    }
    if (nextText) {
      nextText.textContent = i18nLabels.nextPage;
    }
  }
  
  // 更新分页信息
  function updatePagination() {
    totalItems = filteredLocations.length;
    totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    // 确保当前页面在有效范围内
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }
  
    // 更新统计信息
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    if (paginationStats) {
      const statsText = i18nLabels.showingResults
        .replace('{start}', startItem)
        .replace('{end}', endItem)
        .replace('{total}', totalItems);
      paginationStats.textContent = statsText;
    }
  
    // 更新页面信息
    if (pageInput) {
      pageInput.value = currentPage;
      pageInput.max = totalPages;
    }
    if (totalPagesSpan) {
      totalPagesSpan.textContent = totalPages;
    }
  
    // 更新按钮状态
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage <= 1;
    }
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage >= totalPages;
    }
  
    // 显示/隐藏分页容器
    if (paginationContainer) {
      paginationContainer.style.display = totalItems > 0 ? 'block' : 'none';
    }
  }
  
  // 滚动到顶部
  function scrollToTop() {
    const scrollableResults = document.querySelector('.dealer-search__scrollable-results');
    if (scrollableResults) {
      scrollableResults.scrollTop = 0;
    }
  }

  function clearSearch() {
    locationSearch.value = '';
    filterCheckboxes.forEach((cb) => (cb.checked = false));
    filteredLocations = [...allLocations];
    displayResults();
    hideSuggestions();
  }

  // 在updateMapForCard函数中添加store_type参数
  function updateMapForCard(card) {
    const address = card.getAttribute('data-address');
    const city = card.getAttribute('data-city');
    const country = card.getAttribute('data-country');
    const storeType = card.getAttribute('data-store-type') || 'dealer'; // 获取store_type
  
    let fullAddress = '';
    if (address) fullAddress += address;
    if (city) fullAddress += (fullAddress ? ', ' : '') + city;
    if (country) fullAddress += (fullAddress ? ', ' : '') + country;
  
    if (!fullAddress) return;
  
    const infoContent = createInfoWindowContent(card);
  
    if (mapType === 'dynamic') {
      if (window.updateDynamicMap) {
        window.updateDynamicMap(fullAddress, storeType); // 传递storeType
        setTimeout(() => {
          if (window.updateInfoWindow) {
            console.log('Updating info window with content:', infoContent);
            window.updateInfoWindow(infoContent);
          } else {
            console.error('updateInfoWindow function not available');
          }
        }, 1000);
      }
    } else {
      if (mapIframe) {
        mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
          fullAddress
        )}&zoom=14&language=en&region=US`;
      }
    }
  }

  searchBtn.addEventListener('click', () => performSearch());

  locationSearch.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    currentSuggestionIndex = -1;

    if (this.value === '') {
      clearSearch();
    } else {
      showSuggestions(this.value);
      searchTimeout = setTimeout(() => {
        performSearch(false);
      }, 300);
    }
  });

  locationSearch.addEventListener('keydown', handleKeyboardNavigation);

  locationSearch.addEventListener('focus', function () {
    if (this.value) {
      showSuggestions(this.value);
    }
  });

  locationSearch.addEventListener('blur', function () {
    setTimeout(() => hideSuggestions(), 150);
  });

  suggestionsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('suggestion-remove')) {
      e.stopPropagation();
      removeFromHistory(e.target.getAttribute('data-text'));
    } else if (e.target.closest('.suggestion-item')) {
      const suggestionItem = e.target.closest('.suggestion-item');
      const selectedText = suggestionItem.getAttribute('data-text');
      locationSearch.value = selectedText;
      performSearch();
    }
  });

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => performSearch(false));
  });

  locationCards.forEach(function (card) {
    card.addEventListener('click', function () {
      locationCards.forEach((c) => c.classList.remove('active'));
      this.classList.add('active');
      updateMapForCard(this);
    });
  });

  // 初始化
  initializePagination();
  displayResults();

  function createInfoWindowContent(card) {
    const storeName = card.getAttribute('data-store-name') || '';
    const address = card.getAttribute('data-address') || '';
    const city = card.getAttribute('data-city') || '';
    const country = card.getAttribute('data-country') || '';
    const postalCode = card.getAttribute('data-postal-code') || '';
    const phone = card.getAttribute('data-phone') || '';
    const email = card.getAttribute('data-email') || '';
    const website = card.getAttribute('data-website') || '';
    const hours = card.getAttribute('data-hours') || '';
    const storeType = card.getAttribute('data-store-type') || '';
    const province = card.getAttribute('data-province') || '';

    let content = `<div class="info-window">`;

    if (storeName) {
      content += `<h4>${storeName}</h4>`;
    }

    if (address || city || postalCode || province || country) {
      content += `<div class="info-section">`;
      content += `<div class="contact-item">`;
      content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>`;
      content += `<div class="address-text">`;
      
      let addressParts = [];
      if (address) addressParts.push(address);
      if (city && postalCode) {
        addressParts.push(`${city} ${postalCode}`);
      } else {
        if (city) addressParts.push(city);
        if (postalCode) addressParts.push(postalCode);
      }
      if (province) addressParts.push(province);
      if (country) addressParts.push(country);
      
      content += addressParts.join(', ');
      content += `</div></div></div>`;
    }

    if (phone || email) {
      content += `<div class="info-section">`;
      
      if (phone) {
        content += `<div class="contact-item">`;
        content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>`;
        content += `<div class="contact-content">`;
        content += `<div class="contact-label">${i18nLabels.phone}</div>`;
        content += `<div class="contact-value"><a href="tel:${phone}">${phone}</a></div>`;
        content += `</div></div>`;
      }
      
      if (email) {
        content += `<div class="contact-item">`;
        content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>`;
        content += `<div class="contact-content">`;
        content += `<div class="contact-label">${i18nLabels.email}</div>`;
        content += `<div class="contact-value"><a href="mailto:${email}">${email}</a></div>`;
        content += `</div></div>`;
      }
      
      content += `</div>`;
    }

    if (website) {
    content += `<div class="info-section">`;
    content += `<div class="contact-item">`;
    content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.499-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.499.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.497-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.148.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg>`;
    content += `<div class="contact-content">`;
    content += `<div class="contact-label">${i18nLabels.website}</div>`;
    content += `<div class="contact-value"><a href="${website}" target="_blank">${website}</a></div>`;
    content += `</div></div></div>`;
  }

  // 添加 Hours of Operations 显示
  if (hours) {
    content += `<div class="info-section">`;
    content += `<div class="contact-item">`;
    content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>`;
    content += `<div class="contact-content">`;
    
    // 根据当前语言设置Hours of Operations标签
    let hoursLabel = 'Hours of Operations';
    const currentLang = getCurrentLanguage();
    switch(currentLang) {
      case 'de':
        hoursLabel = 'Öffnungszeiten';
        break;
      case 'fr':
        hoursLabel = 'Heures d\'ouverture';
        break;
      case 'fi':
        hoursLabel = 'Aukioloajat';
        break;
      default:
        hoursLabel = 'Hours of Operations';
    }
    
    content += `<div class="contact-label">${hoursLabel}</div>`;
    content += `<div class="contact-value">${hours.replace(/\n/g, '<br>')}</div>`;
    content += `</div></div></div>`;
  }

    if (storeType) {
      const translatedStoreType = i18nLabels[storeType] || storeType;
      content += `<div class="store-type-badge">${translatedStoreType}</div>`;
    }

    content += `</div>`;
    return content;
  }
});