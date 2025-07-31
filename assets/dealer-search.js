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
    calculatingDistance: 'Calculating distance...'
  },
  de: {
    address: 'Adresse',
    phone: 'Telefon',
    email: 'E-Mail',
    website: 'Webseite',
    storeType: 'Geschäftstyp',
    more: 'Mehr',
    less: 'Weniger',
    calculatingDistance: 'Entfernung wird berechnet...'
  },
  fr: {
    address: 'Adresse',
    phone: 'Téléphone',
    email: 'E-mail',
    website: 'Site Web',
    storeType: 'Type de Magasin',
    more: 'Plus',
    less: 'Moins',
    calculatingDistance: 'Calcul de la distance...'
  },
  fi: {
    address: 'Osoite',
    phone: 'Puhelin',
    email: 'Sähköposti',
    website: 'Verkkosivusto',
    storeType: 'Myymälän Tyyppi',
    more: 'Lisää',
    less: 'Vähemmän',
    calculatingDistance: 'Lasketaan etäisyyttä...'
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
  const moreBtn = document.getElementById('more-btn');
  const searchAdvanced = document.getElementById('search-advanced');
  let isAdvancedVisible = false;

  let allLocations = Array.from(locationCards);
  let filteredLocations = [...allLocations];
  let searchHistory = JSON.parse(localStorage.getItem('dealerSearchHistory') || '[]');
  let currentSuggestionIndex = -1;
  let searchTimeout;

  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'search-suggestions';
  suggestionsContainer.style.display = 'none';

  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search-input-wrapper';

  locationSearch.parentNode.insertBefore(searchWrapper, locationSearch);
  searchWrapper.appendChild(locationSearch);
  searchWrapper.appendChild(suggestionsContainer);

  moreBtn.addEventListener('click', function() {
    isAdvancedVisible = !isAdvancedVisible;
    
    if (isAdvancedVisible) {
      searchAdvanced.style.display = 'block';
      moreBtn.querySelector('.more-btn__text').textContent = i18nLabels.less;
      moreBtn.classList.add('more-btn--expanded');
    } else {
      searchAdvanced.style.display = 'none';
      moreBtn.querySelector('.more-btn__text').textContent = i18nLabels.more;
      moreBtn.classList.remove('more-btn--expanded');
    }
  });

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

  function displayResults() {
    allLocations.forEach((card) => {
      card.classList.add('hidden');
    });

    const cardsToShow = filteredLocations;

    cardsToShow.forEach((card) => {
      card.classList.remove('hidden');
    });

    allLocations.forEach((card) => card.classList.remove('active'));
    if (cardsToShow.length > 0) {
      cardsToShow[0].classList.add('active');
      updateMapForCard(cardsToShow[0]);
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

    if (storeType) {
      content += `<div class="store-type-badge">${storeType}</div>`;
    }

    content += `</div>`;
    return content;
  }
});