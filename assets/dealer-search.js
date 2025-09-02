function getCurrentLanguage() {
  const htmlLang = document.documentElement.lang || 'en';
  return htmlLang.toLowerCase().substring(0, 2);
}

// 使用命名空间避免全局变量冲突
const DealerSearchTranslations = {
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
    rental: 'Rental',
    service: 'Service Center',
    'click-collect': 'Click & Collect',
    directions: 'Directions',
    useMyLocation: 'Use My Location',
    gettingLocation: 'Getting your location...',
    locationError: 'Unable to get your location',
    locationPermissionDenied: 'Location access denied',
    locationNotSupported: 'Geolocation not supported',
    radius: 'Radius',
    locationPermissionTitle: 'Use Your Location',
    locationPermissionMessage: 'We would like to use your location to show nearby stores and sort them by distance. This will help you find the closest service points.',
    locationPermissionAllow: 'Allow Location Access',
    locationPermissionDeny: 'Don\'t Allow'
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
    rental: 'Vermietung',
    service: 'Service Center',
    'click-collect': 'Click & Collect',
    directions: 'Wegbeschreibung',
    useMyLocation: 'Meinen Standort verwenden',
    gettingLocation: 'Standort wird ermittelt...',
    locationError: 'Standort konnte nicht ermittelt werden',
    locationPermissionDenied: 'Standortzugriff verweigert',
    locationNotSupported: 'Geolokalisierung nicht unterstützt',
    radius: 'Umkreis',
    locationPermissionTitle: 'Ihren Standort verwenden',
    locationPermissionMessage: 'Wir möchten Ihren Standort verwenden, um nahegelegene Geschäfte anzuzeigen und nach Entfernung zu sortieren. Dies hilft Ihnen, die nächstgelegenen Servicepunkte zu finden.',
    locationPermissionAllow: 'Standortzugriff erlauben',
    locationPermissionDeny: 'Nicht erlauben'
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
    dealer: 'Concessionnaire',
    rental: 'Location',
    service: 'Centre de Service',
    'click-collect': 'Click & Collect',
    directions: 'Itinéraire',
    useMyLocation: 'Utiliser ma position',
    gettingLocation: 'Obtention de votre position...',
    locationError: 'Impossible d\'obtenir votre position',
    locationPermissionDenied: 'Accès à la position refusé',
    locationNotSupported: 'Géolocalisation non prise en charge',
    radius: 'Rayon',
    locationPermissionTitle: 'Utiliser votre position',
    locationPermissionMessage: 'Nous aimerions utiliser votre position pour afficher les magasins à proximité et les trier par distance. Cela vous aidera à trouver les points de service les plus proches.',
    locationPermissionAllow: 'Autoriser l\'accès à la position',
    locationPermissionDeny: 'Ne pas autoriser'
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
    rental: 'Vuokraus',
    service: 'Huoltokeskus',
    'click-collect': 'Click & Collect',
    directions: 'Reittiohjeet',
    useMyLocation: 'Käytä sijaintiani',
    gettingLocation: 'Haetaan sijaintiasi...',
    locationError: 'Sijaintia ei voitu hakea',
    locationPermissionDenied: 'Sijaintiin pääsy evätty',
    locationNotSupported: 'Paikannusta ei tueta',
    radius: 'Säde',
    locationPermissionTitle: 'Käytä sijaintiasi',
    locationPermissionMessage: 'Haluaisimme käyttää sijaintiasi näyttääksemme lähellä olevat myymälät ja järjestääksemme ne etäisyyden mukaan. Tämä auttaa sinua löytämään lähimmät palvelupisteet.',
    locationPermissionAllow: 'Salli sijaintiin pääsy',
    locationPermissionDeny: 'Älä salli'
  }
};

const currentLang = getCurrentLanguage();
const i18nLabels = DealerSearchTranslations[currentLang] || DealerSearchTranslations.en;

document.addEventListener('DOMContentLoaded', function () {
  const mapContainer = document.getElementById('map-container');
  const mapIframe = document.getElementById('map-iframe');
  const searchBtn = document.getElementById('search-btn');
  const locationSearch = document.getElementById('location-search');
  const locationResults = document.getElementById('location-results');
  const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  const useLocationBtn = document.getElementById('use-location-btn');
  const distanceFilter = document.getElementById('distance-filter');

  let allLocations = [];
  let filteredLocations = [];
  let searchHistory = JSON.parse(localStorage.getItem('dealerSearchHistory') || '[]');
  let currentSuggestionIndex = -1;
  let searchTimeout;
  let userCurrentLocation = null; // 存储用户当前位置
  let locationPermissionModal = null;
  let hasAskedForLocation = false;

  // 坐标缓存相关变量
  const COORDINATES_CACHE_KEY = 'dealer_coordinates_cache';
  const CACHE_EXPIRY_DAYS = 30;
  let coordinatesCache = {};

  // 初始化时加载缓存
  function loadCoordinatesCache() {
    const cached = localStorage.getItem(COORDINATES_CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
          coordinatesCache = data.coordinates;
          return true;
        }
      } catch (e) {
        console.error('Error loading coordinates cache:', e);
      }
    }
    return false;
  }

  // 保存坐标缓存
  function saveCoordinatesCache() {
    try {
      const data = {
        coordinates: coordinatesCache,
        timestamp: Date.now()
      };
      localStorage.setItem(COORDINATES_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving coordinates cache:', e);
    }
  }

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
  const dealersUrl = mapContainer.dataset.dealersUrl;

  // 创建位置权限询问弹窗
  function createLocationPermissionModal() {
    const modal = document.createElement('div');
    modal.className = 'location-permission-modal';
    modal.innerHTML = `
      <div class="location-permission-overlay"></div>
      <div class="location-permission-content">
        <div class="location-permission-header">
          <h3>${i18nLabels.locationPermissionTitle || 'Use Your Location'}</h3>
          <button class="location-permission-close" aria-label="Close">&times;</button>
        </div>
        <div class="location-permission-body">
          <div class="location-permission-icon">📍</div>
          <p>${i18nLabels.locationPermissionMessage || 'We would like to use your location to show nearby stores and sort them by distance. This will help you find the closest service points.'}</p>
        </div>
        <div class="location-permission-actions">
          <button class="location-permission-deny">${i18nLabels.locationPermissionDeny || 'Don\'t Allow'}</button>
          <button class="location-permission-allow">${i18nLabels.locationPermissionAllow || 'Allow Location Access'}</button>
        </div>
      </div>
    `;
    
    return modal;
  }

  // 显示位置权限弹窗
  function showLocationPermissionModal() {
    if (hasAskedForLocation || !navigator.geolocation) {
      return;
    }
    
    // 检查是否已经有位置权限
    if (navigator.permissions) {
      navigator.permissions.query({name: 'geolocation'}).then(function(result) {
        if (result.state === 'granted') {
          // 已经有权限，直接获取位置
          getCurrentLocation();
          return;
        } else if (result.state === 'denied') {
          // 权限被拒绝，不显示弹窗
          return;
        }
        // 权限状态为 'prompt'，显示自定义弹窗
        displayLocationModal();
      }).catch(function() {
        // 如果 permissions API 不支持，直接显示弹窗
        displayLocationModal();
      });
    } else {
      // 浏览器不支持 permissions API，直接显示弹窗
      displayLocationModal();
    }
  }

  // 显示弹窗的具体实现
  function displayLocationModal() {
    locationPermissionModal = createLocationPermissionModal();
    document.body.appendChild(locationPermissionModal);
    
    // 添加事件监听器
    const allowBtn = locationPermissionModal.querySelector('.location-permission-allow');
    const denyBtn = locationPermissionModal.querySelector('.location-permission-deny');
    const closeBtn = locationPermissionModal.querySelector('.location-permission-close');
    const overlay = locationPermissionModal.querySelector('.location-permission-overlay');
    
    allowBtn.addEventListener('click', handleLocationAllow);
    denyBtn.addEventListener('click', handleLocationDeny);
    closeBtn.addEventListener('click', handleLocationDeny);
    overlay.addEventListener('click', handleLocationDeny);
    
    // 显示动画
    requestAnimationFrame(() => {
      locationPermissionModal.classList.add('show');
    });
    
    hasAskedForLocation = true;
  }

  // 处理用户允许位置访问
  function handleLocationAllow() {
    hideLocationPermissionModal();
    getCurrentLocation();
    
    // Save user preference to local storage
    localStorage.setItem('dealerSearchLocationPreference', 'allowed');
  }

  // 处理用户拒绝位置访问
  function handleLocationDeny() {
    hideLocationPermissionModal();
    
    // Save user preference to local storage
    localStorage.setItem('dealerSearchLocationPreference', 'denied');
  }

  // 隐藏位置权限弹窗
  function hideLocationPermissionModal() {
    if (locationPermissionModal) {
      locationPermissionModal.classList.add('hide');
      setTimeout(() => {
        if (locationPermissionModal && locationPermissionModal.parentNode) {
          locationPermissionModal.parentNode.removeChild(locationPermissionModal);
        }
        locationPermissionModal = null;
      }, 300);
    }
  }

  // 检查用户之前的位置偏好设置
  function checkLocationPreference() {
    const preference = localStorage.getItem('dealerSearchLocationPreference');
    const lastAsked = localStorage.getItem('dealerSearchLocationLastAsked');
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 一周的毫秒数
    
    // 如果用户之前允许了，直接获取位置
    if (preference === 'allowed') {
      getCurrentLocation();
      return;
    }
    
    // 如果用户之前拒绝了，但已经过了一周，重新询问
    if (preference === 'denied' && lastAsked && (now - parseInt(lastAsked)) > oneWeek) {
      localStorage.removeItem('dealerSearchLocationPreference');
      localStorage.removeItem('dealerSearchLocationLastAsked');
    }
    
    // 如果没有偏好设置或者已经过了一周，显示弹窗
    if (!preference || (preference === 'denied' && (!lastAsked || (now - parseInt(lastAsked)) > oneWeek))) {
      // 延迟1秒显示，让页面完全加载
      setTimeout(() => {
        showLocationPermissionModal();
        localStorage.setItem('dealerSearchLocationLastAsked', now.toString());
      }, 1000);
    }
  }

  // 加载dealer数据
  async function loadDealersData() {
    try {
      const response = await fetch(dealersUrl);
      const data = await response.json();
      return data.dealers || [];
    } catch (error) {
      console.error('Error loading dealers data:', error);
      return [];
    }
  }

  // 创建location card HTML
  function createLocationCard(dealer) {
    const directionText = i18nLabels.directions || 'Directions';
    const phoneLabel = i18nLabels.phone || 'Phone';
    const emailLabel = i18nLabels.email || 'Email';
    
    let storeType = Array.isArray(dealer.store_type) ? dealer.store_type[0] : dealer.store_type;
    let storeTypeDisplay = i18nLabels[storeType] || storeType;
    
    return `
    <div class="map-section__content map-section__text location-card" 
         data-block-id="${dealer.id}" 
         data-store-name="${dealer.store_name || ''}" 
         data-address="${dealer.address || ''}" 
         data-city="${dealer.city || ''}" 
         data-country="${dealer.country || ''}" 
         data-postal-code="${dealer.postal_code || ''}" 
         data-phone="${dealer.phone || ''}" 
         data-email="${dealer.email || ''}" 
         data-website="${dealer.website || ''}" 
         data-hours="${dealer.hours_of_operation || ''}" 
         data-province="${dealer.province_state || ''}" 
         data-fax="${dealer.fax || ''}" 
         data-latitude="${dealer.latitude || ''}" 
         data-longitude="${dealer.longitude || ''}" 
         data-store-type="${storeType}">
        
        <!-- 左侧 Marker Icon -->
        <div class="location-card__marker">
          ${getMarkerIcon(dealer.store_type, 'large')}
        </div>
        
        <div class="location-card__content">
          ${dealer.store_name ? `<h3 class="location-card__title">${dealer.store_name}</h3>` : ''}
          
          ${dealer.address ? `
            <div class="location-card__address">
              ${dealer.address}${dealer.city ? ', ' + dealer.city : ''}${dealer.postal_code ? ' ' + dealer.postal_code : ''}
            </div>
          ` : ''}
          
          ${dealer.phone ? `
            <div class="location-card__phone">
              <strong>${phoneLabel}:</strong> <a href="tel:${dealer.phone}" class="location-card__phone-link">${dealer.phone}</a>
            </div>
          ` : ''}
          
          ${dealer.email ? `
            <div class="location-card__email">
              <strong>${emailLabel}:</strong> <a href="mailto:${dealer.email}" class="location-card__email-link">${dealer.email}</a>
            </div>
          ` : ''}
        </div>

        <!-- 右侧距离和方向按钮 -->
        <div class="location-card__actions">
          <div class="location-card__distance" style="display: none;">
            <span class="distance-value">-- KM</span>
          </div>
          
          ${dealer.address ? `
            <div class="location-card__direction">
              <a href="https://maps.google.com?daddr=${dealer.address}${dealer.city ? ', ' + dealer.city : ''}${dealer.country ? ', ' + dealer.country : ''}" target="_blank" class="btn btn--secondary direction-btn">
                ${dealer.show_pin !== false ? '<span class="icon">' + getLocationIcon() + '</span>' : ''}
                <span>${directionText}</span>
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 获取marker图标
  function getMarkerIcon(storeType, size = 'medium') {
    // 根据尺寸设置宽高
    let width, height, scaleFactor;
    switch (size) {
      case 'small':
        width = 32;
        height = 32;
        scaleFactor = 0.112;
        break;
      case 'large':
        width = 44;
        height = 44;
        scaleFactor = 0.154;
        break;
      default: // medium
        width = 40;
        height = 40;
        scaleFactor = 0.140;
        break;
    }

    // 处理单一商店类型
    const singleStoreType = Array.isArray(storeType) ? storeType[0] : storeType;
    
    // 根据单一类型设置颜色
    let markerColor;
    switch (singleStoreType) {
      case 'dealer':
        markerColor = '#2b7dde';
        break;
      case 'rental':
        markerColor = '#66ad78';
        break;
      case 'service':
        markerColor = '#fa6959';
        break;
      case 'click-collect':
        markerColor = '#FF9933';
        break;
      default:
        markerColor = '#2b7dde';
        break;
    }

    // 生成唯一ID
    const uniqueId = `${singleStoreType}-${size}-${Date.now()}`;

    // 计算路径坐标
    const coords = {
      // 主体路径坐标计算
      mainPath: {
        start: { x: (width * 0.861).toFixed(3), y: (height * 0.332).toFixed(3) },
        c1: { x1: (width * 0.841).toFixed(3), y1: (height * 0.151).toFixed(3), x2: (width * 0.686).toFixed(3), y2: (height * 0.014).toFixed(3), x: (width * 0.5).toFixed(3), y: (height * 0.014).toFixed(3) },
        c2: { x1: (width * 0.314).toFixed(3), y1: (height * 0.014).toFixed(3), x2: (width * 0.158).toFixed(3), y2: (height * 0.151).toFixed(3), x: (width * 0.139).toFixed(3), y: (height * 0.332).toFixed(3) },
        c3: { x1: (width * 0.137).toFixed(3), y1: (height * 0.346).toFixed(3), x2: (width * 0.136).toFixed(3), y2: (height * 0.360).toFixed(3), x: (width * 0.136).toFixed(3), y: (height * 0.375).toFixed(3) },
        c4: { x1: (width * 0.136).toFixed(3), y1: (height * 0.438).toFixed(3), x2: (width * 0.150).toFixed(3), y2: (height * 0.500).toFixed(3), x: (width * 0.178).toFixed(3), y: (height * 0.558).toFixed(3) },
        c5: { x1: (width * 0.190).toFixed(3), y1: (height * 0.583).toFixed(3), x2: (width * 0.204).toFixed(3), y2: (height * 0.608).toFixed(3), x: (width * 0.220).toFixed(3), y: (height * 0.632).toFixed(3) },
        l1: { x: (width * 0.448).toFixed(3), y: (height * 0.971).toFixed(3) },
        c6: { x1: (width * 0.459).toFixed(3), y1: (height * 0.988).toFixed(3), x2: (width * 0.478).toFixed(3), y2: (height * 0.999).toFixed(3), x: (width * 0.499).toFixed(3), y: (height * 0.999).toFixed(3) },
        c7: { x1: (width * 0.521).toFixed(3), y1: (height * 0.999).toFixed(3), x2: (width * 0.540).toFixed(3), y2: (height * 0.988).toFixed(3), x: (width * 0.551).toFixed(3), y: (height * 0.971).toFixed(3) },
        l2: { x: (width * 0.780).toFixed(3), y: (height * 0.633).toFixed(3) },
        c8: { x1: (width * 0.796).toFixed(3), y1: (height * 0.608).toFixed(3), x2: (width * 0.810).toFixed(3), y2: (height * 0.583).toFixed(3), x: (width * 0.822).toFixed(3), y: (height * 0.557).toFixed(3) },
        c9: { x1: (width * 0.857).toFixed(3), y1: (height * 0.487).toFixed(3), x2: (width * 0.870).toFixed(3), y2: (height * 0.409).toFixed(3), x: (width * 0.861).toFixed(3), y: (height * 0.332).toFixed(3) }
      },
      // Hepha图标路径坐标
      iconPath: {
        start: { x: (width * 0.677).toFixed(3), y: (width * 0.316).toFixed(3) },
        // 简化的Hepha图标路径
        points: [
          `M${(width * 0.677).toFixed(3)} ${(width * 0.316).toFixed(3)}`,
          `C${(width * 0.677).toFixed(3)} ${(width * 0.315).toFixed(3)} ${(width * 0.675).toFixed(3)} ${(width * 0.314).toFixed(3)} ${(width * 0.674).toFixed(3)} ${(width * 0.315).toFixed(3)}`,
          `C${(width * 0.657).toFixed(3)} ${(width * 0.332).toFixed(3)} ${(width * 0.531).toFixed(3)} ${(width * 0.456).toFixed(3)} ${(width * 0.531).toFixed(3)} ${(width * 0.456).toFixed(3)}`,
          `C${(width * 0.513).toFixed(3)} ${(width * 0.474).toFixed(3)} ${(width * 0.484).toFixed(3)} ${(width * 0.474).toFixed(3)} ${(width * 0.466).toFixed(3)} ${(width * 0.456).toFixed(3)}`,
          `C${(width * 0.448).toFixed(3)} ${(width * 0.439).toFixed(3)} ${(width * 0.448).toFixed(3)} ${(width * 0.410).toFixed(3)} ${(width * 0.466).toFixed(3)} ${(width * 0.392).toFixed(3)}`,
          `C${(width * 0.466).toFixed(3)} ${(width * 0.392).toFixed(3)} ${(width * 0.519).toFixed(3)} ${(width * 0.340).toFixed(3)} ${(width * 0.553).toFixed(3)} ${(width * 0.306).toFixed(3)}`,
          `C${(width * 0.570).toFixed(3)} ${(width * 0.289).toFixed(3)} ${(width * 0.581).toFixed(3)} ${(width * 0.266).toFixed(3)} ${(width * 0.581).toFixed(3)} ${(width * 0.242).toFixed(3)}`,
          `L${(width * 0.581).toFixed(3)} ${(width * 0.132).toFixed(3)}`,
          `C${(width * 0.581).toFixed(3)} ${(width * 0.130).toFixed(3)} ${(width * 0.579).toFixed(3)} ${(width * 0.129).toFixed(3)} ${(width * 0.577).toFixed(3)} ${(width * 0.130).toFixed(3)}`,
          `L${(width * 0.456).toFixed(3)} ${(width * 0.249).toFixed(3)}`,
          `C${(width * 0.454).toFixed(3)} ${(width * 0.251).toFixed(3)} ${(width * 0.452).toFixed(3)} ${(width * 0.249).toFixed(3)} ${(width * 0.452).toFixed(3)} ${(width * 0.248).toFixed(3)}`,
          `V${(width * 0.182).toFixed(3)}`,
          `C${(width * 0.452).toFixed(3)} ${(width * 0.180).toFixed(3)} ${(width * 0.450).toFixed(3)} ${(width * 0.179).toFixed(3)} ${(width * 0.449).toFixed(3)} ${(width * 0.180).toFixed(3)}`,
          `L${(width * 0.347).toFixed(3)} ${(width * 0.280).toFixed(3)}`,
          `H${(width * 0.348).toFixed(3)}`,
          `C${(width * 0.267).toFixed(3)} ${(width * 0.361).toFixed(3)} ${(width * 0.268).toFixed(3)} ${(width * 0.491).toFixed(3)} ${(width * 0.350).toFixed(3)} ${(width * 0.572).toFixed(3)}`,
          `C${(width * 0.432).toFixed(3)} ${(width * 0.652).toFixed(3)} ${(width * 0.566).toFixed(3)} ${(width * 0.651).toFixed(3)} ${(width * 0.647).toFixed(3)} ${(width * 0.571).toFixed(3)}`,
          `C${(width * 0.718).toFixed(3)} ${(width * 0.501).toFixed(3)} ${(width * 0.728).toFixed(3)} ${(width * 0.395).toFixed(3)} ${(width * 0.677).toFixed(3)} ${(width * 0.316).toFixed(3)}`,
          'Z'
        ].join(' ')
      }
    };

    // 构建主体路径
    const mainPath = [
      `M${coords.mainPath.start.x} ${coords.mainPath.start.y}`,
      `C${coords.mainPath.c1.x1} ${coords.mainPath.c1.y1} ${coords.mainPath.c1.x2} ${coords.mainPath.c1.y2} ${coords.mainPath.c1.x} ${coords.mainPath.c1.y}`,
      `C${coords.mainPath.c2.x1} ${coords.mainPath.c2.y1} ${coords.mainPath.c2.x2} ${coords.mainPath.c2.y2} ${coords.mainPath.c2.x} ${coords.mainPath.c2.y}`,
      `C${coords.mainPath.c3.x1} ${coords.mainPath.c3.y1} ${coords.mainPath.c3.x2} ${coords.mainPath.c3.y2} ${coords.mainPath.c3.x} ${coords.mainPath.c3.y}`,
      `C${coords.mainPath.c4.x1} ${coords.mainPath.c4.y1} ${coords.mainPath.c4.x2} ${coords.mainPath.c4.y2} ${coords.mainPath.c4.x} ${coords.mainPath.c4.y}`,
      `C${coords.mainPath.c5.x1} ${coords.mainPath.c5.y1} ${coords.mainPath.c5.x2} ${coords.mainPath.c5.y2} ${coords.mainPath.c5.x} ${coords.mainPath.c5.y}`,
      `L${coords.mainPath.l1.x} ${coords.mainPath.l1.y}`,
      `C${coords.mainPath.c6.x1} ${coords.mainPath.c6.y1} ${coords.mainPath.c6.x2} ${coords.mainPath.c6.y2} ${coords.mainPath.c6.x} ${coords.mainPath.c6.y}`,
      `C${coords.mainPath.c7.x1} ${coords.mainPath.c7.y1} ${coords.mainPath.c7.x2} ${coords.mainPath.c7.y2} ${coords.mainPath.c7.x} ${coords.mainPath.c7.y}`,
      `L${coords.mainPath.l2.x} ${coords.mainPath.l2.y}`,
      `C${coords.mainPath.c8.x1} ${coords.mainPath.c8.y1} ${coords.mainPath.c8.x2} ${coords.mainPath.c8.y2} ${coords.mainPath.c8.x} ${coords.mainPath.c8.y}`,
      `C${coords.mainPath.c9.x1} ${coords.mainPath.c9.y1} ${coords.mainPath.c9.x2} ${coords.mainPath.c9.y2} ${coords.mainPath.c9.x} ${coords.mainPath.c9.y}`,
      'Z'
    ].join(' ');

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" class="custom-marker custom-marker--${singleStoreType}">
        <g clip-path="url(#clip${uniqueId})">
          <!-- 主体路径 -->
          <path d="${mainPath}" fill="${markerColor}"/>
          
          <!-- Hepha图标 -->
          <path d="${coords.iconPath.points}" fill="white"/>
        </g>
        
        <defs>
          <clipPath id="clip${uniqueId}">
            <rect width="${width}" height="${height}" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `;
  }

  // 获取location图标
  function getLocationIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
  }

  // 渲染locations
  function renderLocations(dealers) {
    const html = dealers.map(dealer => createLocationCard(dealer)).join('');
    locationResults.innerHTML = html;
    
    // 重新获取所有location cards
    allLocations = Array.from(document.querySelectorAll('.location-card'));
    filteredLocations = [...allLocations];
    
    // 初始化分页
    displayResults();
  }

  // 初始化
  async function init() {
    // 加载坐标缓存
    loadCoordinatesCache();
    
    const dealers = await loadDealersData();
    renderLocations(dealers);
    
    // 初始化事件监听器
    initEventListeners();
    
    // 检查位置偏好并可能显示弹窗
    checkLocationPreference();
    
    // 显示所有经销商标记
    setTimeout(() => {
      updateMapWithAllDealers();
    }, 1000); // 延迟1秒确保地图已初始化
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    // 验证输入参数
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
        !isFinite(lat1) || !isFinite(lon1) || !isFinite(lat2) || !isFinite(lon2)) {
      console.warn('Invalid coordinates for distance calculation:', { lat1, lon1, lat2, lon2 });
      return null;
    }
    
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // 返回计算结果，允许0距离（同一位置）
    return isFinite(distance) ? distance : null;
  }
  
  // 使用Web Workers进行距离计算
  function createDistanceWorker() {
    const workerCode = `
      function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }
      
      self.onmessage = function(e) {
        const { userLocation, stores } = e.data;
        const results = stores.map(store => ({
          id: store.id,
          distance: calculateDistance(
            userLocation.lat, userLocation.lng,
            store.lat, store.lng
          )
        }));
        self.postMessage(results);
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }
  
  // 使用Worker计算距离
  function calculateDistancesWithWorker(userLocation, stores, callback) {
    const worker = createDistanceWorker();
    
    worker.onmessage = function(e) {
      callback(e.data);
      worker.terminate();
    };
    
    worker.postMessage({ userLocation, stores });
  }
  
  // 批量处理地理编码请求
  function batchGeocodeAddresses(addresses, callback) {
    const results = {};
    let completed = 0;
    const total = addresses.length;
    
    // 限制并发请求数量
    const BATCH_SIZE = 5;
    let currentBatch = 0;
    
    function processBatch() {
      const batch = addresses.slice(currentBatch, currentBatch + BATCH_SIZE);
      
      batch.forEach((address, index) => {
        // 添加延迟避免API限制
        setTimeout(() => {
          geocodeAddress(address, (result) => {
            results[address] = result;
            completed++;
            
            if (completed === total) {
              callback(results);
            }
          });
        }, index * 200); // 200ms间隔
      });
      
      currentBatch += BATCH_SIZE;
      if (currentBatch < total) {
        setTimeout(processBatch, BATCH_SIZE * 200 + 500);
      }
    }
    
    processBatch();
  }

  // 获取商店坐标的函数（优先使用预存坐标）
  function getStoreCoordinates(card, callback) {
    const latitude = parseFloat(card.getAttribute('data-latitude'));
    const longitude = parseFloat(card.getAttribute('data-longitude'));
    
    // 如果有预存的经纬度坐标且有效，直接使用
    if (!isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0) {
      console.log('Using pre-stored coordinates for:', card.getAttribute('data-store-name'), { lat: latitude, lng: longitude });
      callback({ lat: latitude, lng: longitude });
      return;
    }
    
    // 如果没有预存坐标，使用地理编码
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
      console.log('Geocoding address for:', card.getAttribute('data-store-name'), fullAddress);
      geocodeAddress(fullAddress, callback);
    } else {
      callback(null);
    }
  }

  // 添加地理编码队列管理
  class GeocodingQueue {
    constructor() {
      this.queue = [];
      this.processing = false;
      this.maxConcurrent = 3; // 限制并发请求数
      this.delay = 200; // 请求间隔
    }
    
    async add(address, callback) {
      return new Promise((resolve) => {
        this.queue.push({ address, callback, resolve });
        this.process();
      });
    }
    
    async process() {
      if (this.processing || this.queue.length === 0) return;
      
      this.processing = true;
      
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.maxConcurrent);
        
        await Promise.all(batch.map(async (item) => {
          try {
            await this.geocodeWithDelay(item.address, item.callback);
            item.resolve();
          } catch (error) {
            console.error('Geocoding failed:', error);
            item.callback(null);
            item.resolve();
          }
        }));
        
        // 添加延迟避免API限制
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      }
      
      this.processing = false;
    }
    
    async geocodeWithDelay(address, callback) {
      return new Promise((resolve) => {
        setTimeout(() => {
          geocodeAddressInternal(address, (result) => {
            callback(result);
            resolve();
          });
        }, Math.random() * 100); // 随机延迟避免同时请求
      });
    }
  }

  const geocodingQueue = new GeocodingQueue();

  // 内部地理编码函数
  function geocodeAddressInternal(address, callback) {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      callback(null);
      return;
    }
    
    // 首先检查缓存
    const cacheKey = address.toLowerCase().trim();
    if (coordinatesCache[cacheKey]) {
      console.log('Using cached coordinates for:', address);
      callback(coordinatesCache[cacheKey]);
      return;
    }
    
    const geocoder = new google.maps.Geocoder();
    
    const geocodeOptions = {
      address: address
      // Remove or expand component restrictions for better global coverage
      // componentRestrictions: {
      //   country: ['DE', 'AT', 'CH', 'NL', 'BE', 'FR'] // Too restrictive
      // }
    };
    
    geocoder.geocode(geocodeOptions, function(results, status) {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const result = {
          lat: location.lat(),
          lng: location.lng(),
          timestamp: Date.now(), // 添加时间戳用于缓存过期
          formatted_address: results[0].formatted_address // Add formatted address for verification
        };
        
        // 缓存结果
        coordinatesCache[cacheKey] = result;
        saveCoordinatesCache();
        
        console.log('Geocoded address:', address, 'to coordinates:', result);
        callback(result);
      } else {
        console.error('Geocoding failed for "' + address + '":', status);
        // Try fallback without restrictions if initial geocoding fails
        if (geocodeOptions.componentRestrictions) {
          delete geocodeOptions.componentRestrictions;
          geocoder.geocode(geocodeOptions, function(fallbackResults, fallbackStatus) {
            if (fallbackStatus === 'OK' && fallbackResults[0]) {
              const location = fallbackResults[0].geometry.location;
              const result = {
                lat: location.lat(),
                lng: location.lng(),
                timestamp: Date.now(),
                formatted_address: fallbackResults[0].formatted_address
              };
              
              coordinatesCache[cacheKey] = result;
              saveCoordinatesCache();
              
              console.log('Fallback geocoded address:', address, 'to coordinates:', result);
              callback(result);
            } else {
              console.error('Fallback geocoding also failed for "' + address + '":', fallbackStatus);
              callback(null);
            }
          });
        } else {
          callback(null);
        }
      }
    });
  }

  // 地理编码函数（使用队列）
  function geocodeAddress(address, callback) {
    geocodingQueue.add(address, callback);
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
      getStoreCoordinates(card, function(storeLocation) {
        completedRequests++;
        
        if (storeLocation) {
          const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            storeLocation.lat, storeLocation.lng
          );
          
          if (distance !== null) {
            const distanceElement = card.querySelector('.location-card__distance');
            const distanceValue = card.querySelector('.distance-value');
            
            if (distanceElement && distanceValue) {
              distanceValue.textContent = distance.toFixed(1) + ' KM';
              distanceElement.style.display = 'block';
              distanceElement.classList.add('has-distance');
              
              card.setAttribute('data-distance', distance.toFixed(1));
            }
          }
        }
        
        // 所有请求完成后进行距离过滤和排序
        if (completedRequests === totalRequests) {
          // 应用距离过滤
          const selectedDistance = distanceFilter.value;
          if (selectedDistance !== 'all') {
            const maxDistance = parseFloat(selectedDistance);
            filteredLocations = filteredLocations.filter(card => {
              const distance = parseFloat(card.getAttribute('data-distance'));
              return !isNaN(distance) && distance <= maxDistance;
            });
          }
          
          // 按距离排序（从近到远）
          filteredLocations.sort((a, b) => {
            const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
            const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
            return distanceA - distanceB;
          });
          
          hideLoadingState();
          displayResults();
        }
      });
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

      // 如果搜索词匹配地址，提供完整地址建议
      if (address && address.toLowerCase().includes(query.toLowerCase())) {
        let fullAddress = address;
        if (city) fullAddress += ', ' + city;
        if (postalCode) fullAddress += ' ' + postalCode;
        if (!locationSuggestions.has(fullAddress)) {
          locationSuggestions.add(fullAddress);
        }
      }

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

  // 添加工具提示到搜索输入框
  function addTooltipToSearchInput() {
    const searchInput = document.getElementById('location-search');
    if (searchInput && searchInput.value.length > 30) {
      searchInput.title = searchInput.value; // 设置完整地址为工具提示
    }
  }

  // 改进的地理位置功能
  function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert(i18nLabels.locationNotSupported);
      return;
    }
    
    // 显示加载状态
    useLocationBtn.disabled = true;
    useLocationBtn.classList.add('loading');
    const originalText = useLocationBtn.querySelector('span').textContent;
    useLocationBtn.querySelector('span').textContent = i18nLabels.gettingLocation;
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // 存储用户位置
        userCurrentLocation = { lat: lat, lng: lng };
        
        // 使用Google Maps反向地理编码获取地址
        if (window.google && window.google.maps) {
          const geocoder = new google.maps.Geocoder();
          const latlng = { lat: lat, lng: lng };
          
          geocoder.geocode({ location: latlng }, function(results, status) {
            if (status === 'OK' && results[0]) {
              // 获取格式化的地址
              const address = results[0].formatted_address;
              locationSearch.value = address;
              
              // 添加工具提示
              addTooltipToSearchInput();
              
              // 自动执行搜索
              performLocationBasedSearch();
            } else {
              console.error('Reverse geocoding failed: ' + status);
              // 如果反向地理编码失败，使用坐标
              locationSearch.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              addTooltipToSearchInput();
              performLocationBasedSearch();
            }
            
            // 恢复按钮状态
            resetLocationButton(originalText);
          });
        } else {
          // 如果没有Google Maps API，直接使用坐标
          locationSearch.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          addTooltipToSearchInput();
          performLocationBasedSearch();
          resetLocationButton(originalText);
        }
      },
      function(error) {
        let errorMessage;
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = i18nLabels.locationPermissionDenied;
            break;
          case error.POSITION_UNAVAILABLE:
          case error.TIMEOUT:
          default:
            errorMessage = i18nLabels.locationError;
            break;
        }
        alert(errorMessage);
        resetLocationButton(originalText);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟缓存
      }
    );
  }
  
  function resetLocationButton(originalText) {
    useLocationBtn.disabled = false;
    useLocationBtn.classList.remove('loading');
    useLocationBtn.querySelector('span').textContent = originalText;
  }
  
  // 基于位置的搜索，包含距离过滤
  function performLocationBasedSearch() {
    if (!userCurrentLocation) {
      performSearch();
      return;
    }
    
    showLoadingState();
    
    // 首先应用店铺类型过滤
    const selectedFilters = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    
    if (selectedFilters.length > 0) {
      filteredLocations = allLocations.filter(card => {
        const storeType = card.getAttribute('data-store-type');
        // 检查是否有匹配的类型
        return selectedFilters.includes(storeType);
      });
    } else {
      filteredLocations = [...allLocations];
    }
    
    // 计算所有位置的距离
    let completedRequests = 0;
    const totalRequests = filteredLocations.length;
    
    if (totalRequests === 0) {
      hideLoadingState();
      displayResults();
      return;
    }
    
    filteredLocations.forEach(card => {
      getStoreCoordinates(card, function(storeLocation) {
        completedRequests++;
        
        if (storeLocation) {
          const distance = calculateDistance(
            userCurrentLocation.lat, userCurrentLocation.lng,
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
        
        // 所有请求完成后进行距离过滤和排序
        if (completedRequests === totalRequests) {
          // 应用距离过滤
          const selectedDistance = distanceFilter.value;
          if (selectedDistance !== 'all') {
            const maxDistance = parseFloat(selectedDistance);
            filteredLocations = filteredLocations.filter(card => {
              const distance = parseFloat(card.getAttribute('data-distance'));
              return !isNaN(distance) && distance <= maxDistance;
            });
          }
          
          // 按距离排序（从近到远）
          filteredLocations.sort((a, b) => {
            const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
            const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
            return distanceA - distanceB;
          });
          
          hideLoadingState();
          displayResults();
        }
      });
    });
  }
  
  // 应用距离过滤
  function applyDistanceFilter() {
    const selectedDistance = distanceFilter.value;
    const selectedFilters = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    
    // 首先按店铺类型过滤 - 修复店铺类型匹配逻辑
    if (selectedFilters.length > 0) {
      filteredLocations = allLocations.filter(card => {
        const storeType = card.getAttribute('data-store-type');
        return selectedFilters.includes(storeType);
      });
    } else {
      filteredLocations = [...allLocations];
    }
    
    // 修复：只有在距离计算完成且不为'all'时才应用距离筛选
    if (selectedDistance !== 'all' && userCurrentLocation) {
      const maxDistance = parseFloat(selectedDistance);
      filteredLocations = filteredLocations.filter(card => {
        const distance = parseFloat(card.getAttribute('data-distance'));
        // 修复：如果距离未计算（NaN），则排除该店铺，而不是保留
        return !isNaN(distance) && distance <= maxDistance;
      });
    }
    
    // 如果有距离数据，按距离排序
    if (userCurrentLocation) {
      filteredLocations.sort((a, b) => {
        const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
        const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
        return distanceA - distanceB;
      });
    }
  }

  // 统一的displayResults函数（支持分页）
  function displayResults() {
    // 如果没有结果，显示"No results"消息
    if (filteredLocations.length === 0) {
      displayNoResults();
      return;
    }
    
    // 清除任何现有的"No results"消息
    const noResultsMessage = document.querySelector('.no-results-message');
    if (noResultsMessage) {
      noResultsMessage.remove();
    }
    
    // 计算当前页面要显示的项目
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const cardsToShow = filteredLocations.slice(startIndex, endIndex);
    
    // 保存当前焦点元素
    const activeElement = document.activeElement;
    const shouldRestoreFocus = activeElement && activeElement.id === 'location-search';
    
    // 使用requestAnimationFrame确保DOM更新的正确时序
    requestAnimationFrame(() => {
      // 隐藏所有卡片
      allLocations.forEach((card) => {
        card.classList.add('pagination-hidden');
        card.classList.remove('active');
      });
      
      // 使用CSS order属性重新排序，而不是移除和重新添加DOM元素
      filteredLocations.forEach((card, index) => {
        card.style.order = index;
      });
      
      // 立即显示当前页面的卡片
      cardsToShow.forEach((card) => {
        card.classList.remove('pagination-hidden');
      });
      
      // 激活第一个卡片
      if (cardsToShow.length > 0) {
        cardsToShow[0].classList.add('active');
      }
      
      // 修改：始终显示所有经销商标记，而不是只显示当前页面的标记
      updateMapWithAllDealers();
      
      // 恢复输入框焦点
      if (shouldRestoreFocus) {
        setTimeout(() => {
          const locationSearch = document.getElementById('location-search');
          if (locationSearch) {
            locationSearch.focus();
          }
        }, 0);
      }
    });
    
    // 更新分页信息
    updatePagination();
  }

  // 优化：更新地图显示所有经销商的标记（使用坐标而不是地理编码）
  async function updateMapWithAllDealers() {
    if (mapType === 'dynamic' && window.updateDynamicMapWithMultipleMarkers) {
      try {
        // 直接从JSON文件加载所有经销商数据
        const dealers = await loadDealersData();
        
        // 准备所有经销商位置的数据，优先使用已有的经纬度坐标
        const locations = dealers.map(dealer => {
          const storeType = Array.isArray(dealer.store_type) ? dealer.store_type[0] : dealer.store_type;
          
          // 如果有经纬度坐标，直接使用，避免地理编码
          if (dealer.latitude && dealer.longitude) {
            return {
              latitude: parseFloat(dealer.latitude),
              longitude: parseFloat(dealer.longitude),
              storeType: storeType || 'dealer',
              storeName: dealer.store_name,
              infoContent: createInfoWindowContentFromDealer(dealer),
              useCoordinates: true
            };
          } else {
            // 如果没有坐标，回退到地址
            let fullAddress = '';
            if (dealer.address) fullAddress += dealer.address;
            if (dealer.city) fullAddress += (fullAddress ? ', ' : '') + dealer.city;
            if (dealer.country) fullAddress += (fullAddress ? ', ' : '') + dealer.country;
            
            return {
              address: fullAddress,
              storeType: storeType || 'dealer',
              storeName: dealer.store_name,
              infoContent: createInfoWindowContentFromDealer(dealer),
              useCoordinates: false
            };
          }
        }).filter(location => 
          (location.useCoordinates && location.latitude && location.longitude) || 
          (!location.useCoordinates && location.address)
        );
        
        // 调用优化后的地图更新函数显示所有标记
        window.updateDynamicMapWithMultipleMarkers(locations);
        
        console.log(`显示了 ${locations.length} 个经销商标记`);
      } catch (error) {
        console.error('Error loading all dealers for map:', error);
      }
    }
  }

  // 新增函数：从经销商数据创建信息窗口内容
  function createInfoWindowContentFromDealer(dealer) {
    const storeType = Array.isArray(dealer.store_type) ? dealer.store_type[0] : dealer.store_type;
    
    let content = `<div class="info-window">`;

    if (dealer.store_name) {
      content += `<h4>${dealer.store_name}</h4>`;
    }

    if (dealer.address || dealer.city || dealer.postal_code || dealer.province_state || dealer.country) {
      content += `<div class="info-section">`;
      content += `<div class="contact-item">`;
      content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>`;
      content += `<div class="address-text">`;
      
      let addressParts = [];
      if (dealer.address) addressParts.push(dealer.address);
      if (dealer.city && dealer.postal_code) {
        addressParts.push(`${dealer.city} ${dealer.postal_code}`);
      } else {
        if (dealer.city) addressParts.push(dealer.city);
        if (dealer.postal_code) addressParts.push(dealer.postal_code);
      }
      if (dealer.province_state) addressParts.push(dealer.province_state);
      if (dealer.country) addressParts.push(dealer.country);
      
      content += addressParts.join(', ');
      content += `</div></div></div>`;
    }

    if (dealer.phone || dealer.email) {
      content += `<div class="info-section">`;
      
      if (dealer.phone) {
        content += `<div class="contact-item">`;
        content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>`;
        content += `<div class="contact-content">`;
        content += `<div class="contact-label">${i18nLabels.phone}</div>`;
        content += `<div class="contact-value"><a href="tel:${dealer.phone}">${dealer.phone}</a></div>`;
        content += `</div></div>`;
      }
      
      if (dealer.email) {
        content += `<div class="contact-item">`;
        content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>`;
        content += `<div class="contact-content">`;
        content += `<div class="contact-label">${i18nLabels.email}</div>`;
        content += `<div class="contact-value"><a href="mailto:${dealer.email}">${dealer.email}</a></div>`;
        content += `</div></div>`;
      }
      
      content += `</div>`;
    }

    if (dealer.website) {
      content += `<div class="info-section">`;
      content += `<div class="contact-item">`;
      content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg>`;
      content += `<div class="contact-content">`;
      content += `<div class="contact-label">${i18nLabels.website}</div>`;
      content += `<div class="contact-value"><a href="${dealer.website}" target="_blank">${dealer.website}</a></div>`;
      content += `</div></div></div>`;
    }

    if (dealer.hours_of_operation) {
      content += `<div class="info-section">`;
      content += `<div class="contact-item">`;
      content += `<svg class="contact-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>`;
      content += `<div class="contact-content">`;
      
      let hoursLabel = 'Hours of Operation';
      if (currentLang === 'de') {
        hoursLabel = 'Öffnungszeiten';
      } else if (currentLang === 'fr') {
        hoursLabel = 'Heures d\'ouverture';
      } else if (currentLang === 'fi') {
        hoursLabel = 'Aukioloajat';
      }
      
      content += `<div class="contact-label">${hoursLabel}</div>`;
      content += `<div class="contact-value">${dealer.hours_of_operation.replace(/\n/g, '<br>')}</div>`;
      content += `</div></div></div>`;
    }

    if (storeType) {
      const translatedStoreType = i18nLabels[storeType] || storeType;
      content += `<div class="store-type-badge" data-store-type="${storeType}">${translatedStoreType}</div>`;
    }

    content += `</div>`;
    return content;
  }

  // 新增函数：更新地图显示当前页面所有结果的标记
  function updateMapWithAllCurrentPageMarkers() {
    if (mapType === 'dynamic' && window.updateDynamicMapWithMultipleMarkers) {
      // 计算当前页面要显示的项目
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const cardsToShow = filteredLocations.slice(startIndex, endIndex);
      
      // 准备当前页面所有位置的数据
      const locations = cardsToShow.map(card => {
        const address = card.getAttribute('data-address');
        const city = card.getAttribute('data-city');
        const country = card.getAttribute('data-country');
        const storeType = card.getAttribute('data-store-type') || 'dealer';
        const storeName = card.getAttribute('data-store-name');
        
        let fullAddress = '';
        if (address) fullAddress += address;
        if (city) fullAddress += (fullAddress ? ', ' : '') + city;
        if (country) fullAddress += (fullAddress ? ', ' : '') + country;
        
        return {
          address: fullAddress,
          storeType: storeType,
          storeName: storeName,
          infoContent: createInfoWindowContent(card)
        };
      }).filter(location => location.address); // 只包含有地址的位置
      
      // 调用新的地图更新函数
      window.updateDynamicMapWithMultipleMarkers(locations);
    } else {
      // 计算当前页面要显示的项目
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const cardsToShow = filteredLocations.slice(startIndex, endIndex);
      
      if (cardsToShow.length > 0) {
        // 如果是embed地图或者没有多标记功能，回退到显示第一个位置
        updateMapForCard(cardsToShow[0]);
      }
    }
  }

  // 渐进式显示结果
  function performProgressiveSearch(searchTerm) {
    showLoadingState();
    
    // 立即显示基于文本的结果
    const textResults = performTextSearch(searchTerm);
    displayResults(); // 不隐藏loading
    
    // 然后异步计算距离
    if (userCurrentLocation) {
      calculateDistancesProgressively(filteredLocations, () => {
        hideLoadingState();
        displayResults();
      });
    } else {
      hideLoadingState();
    }
  }

  function performTextSearch(searchTerm) {
    const selectedFilters = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    if (selectedFilters.length > 0) {
      filteredLocations = allLocations.filter(card => {
        const storeType = card.getAttribute('data-store-type');
        return selectedFilters.includes(storeType);
      });
    } else {
      filteredLocations = [...allLocations];
    }

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // 预处理搜索词：检测是否包含德国相关关键词
      const containsGermany = /\b(germany|deutschland|de)\b/i.test(searchTermLower);
      const cleanSearchTerm = searchTermLower
        .replace(/\b(germany|deutschland|de)\b/gi, '')
        .replace(/[,\s]+/g, ' ')
        .trim();
      
      // 检测搜索词类型
      const isPostalCode = /^\d{5}$/.test(cleanSearchTerm);
      const isCityName = cleanSearchTerm.length > 2 && !/\d/.test(cleanSearchTerm);
      
      filteredLocations = filteredLocations.filter(card => {
        const storeName = card.getAttribute('data-store-name')?.toLowerCase() || '';
        const city = card.getAttribute('data-city')?.toLowerCase() || '';
        const country = card.getAttribute('data-country')?.toLowerCase() || '';
        const address = card.getAttribute('data-address')?.toLowerCase() || '';
        const province = card.getAttribute('data-province')?.toLowerCase() || '';
        const postalCode = card.getAttribute('data-postal-code')?.toLowerCase() || '';
        
        const isGermanLocation = country === 'de' || country === 'germany';
        
        // 如果搜索包含德国关键词或检测到德国地理位置格式
        if (containsGermany || isPostalCode || isCityName) {
          // 优先匹配德国位置
          if (isGermanLocation) {
            // 邮编匹配
            if (isPostalCode && (postalCode === cleanSearchTerm || postalCode.startsWith(cleanSearchTerm))) {
              return true;
            }
            
            // 城市匹配
            if (isCityName && (city === cleanSearchTerm || city.includes(cleanSearchTerm))) {
              return true;
            }
            
            // 如果原搜索词包含德国关键词，进行标准匹配
            if (containsGermany) {
              return storeName.includes(cleanSearchTerm) ||
                     city.includes(cleanSearchTerm) ||
                     address.includes(cleanSearchTerm) ||
                     province.includes(cleanSearchTerm) ||
                     postalCode.includes(cleanSearchTerm);
            }
          }
          
          // 如果明确搜索德国但当前不是德国位置，排除
          if (containsGermany && !isGermanLocation) {
            return false;
          }
        }
        
        // 标准搜索逻辑（用于非德国特定搜索）
        const searchWords = searchTermLower.split(/[,\s]+/).filter(word => word.length > 0);
        
        // 检查是否所有搜索词都能在某个字段中找到
        const matchesAllWords = searchWords.every(word => 
          storeName.includes(word) ||
          city.includes(word) ||
          country.includes(word) ||
          address.includes(word) ||
          province.includes(word) ||
          postalCode.includes(word)
        );
        
        // 单字段完整匹配
        const singleFieldMatch = 
          storeName.includes(searchTermLower) ||
          city.includes(searchTermLower) ||
          country.includes(searchTermLower) ||
          address.includes(searchTermLower) ||
          province.includes(searchTermLower) ||
          postalCode.includes(searchTermLower);
        
        return matchesAllWords || singleFieldMatch;
      });
    }

    return filteredLocations;
  }

  // Enhanced text search with fallback to nearest stores
  function performTextSearchWithFallback(searchTerm) {
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // Clean search term by removing country references
    const containsGermany = /\b(germany|deutschland|de)\b/i.test(searchTermLower);
    const cleanSearchTerm = searchTermLower
      .replace(/\b(germany|deutschland|de)\b/gi, '')
      .replace(/[,\s]+/g, ' ')
      .trim();
    
    // Detect if search term is postal code or city name
    const isPostalCode = /^\d{5}$/.test(cleanSearchTerm);
    const isCityName = cleanSearchTerm.length > 2 && !/\d/.test(cleanSearchTerm);
    
    // If searching by postal code or city, always show nearest 10 results
    if (isPostalCode || isCityName) {
      geocodeAddress(searchTerm, function(searchLocation) {
        if (searchLocation) {
          userCurrentLocation = searchLocation;
          console.log('Search location geocoded for nearest stores:', searchLocation);
          
          // Update map to show the searched location
          if (mapType === 'dynamic' && window.updateDynamicMap) {
            window.updateDynamicMap(searchTerm, 'search-location');
          }
          
          // Always show nearest 10 stores for postal code/city searches
          showNearestStoresForLocation(searchLocation, 10);
        } else {
          displayNoResults();
        }
      });
      return;
    }
    
    // For other search terms, use the existing logic
    const textResults = performTextSearch(searchTerm);
    
    if (textResults.length === 0 && searchTerm.trim()) {
      // No results found, try to recommend nearest stores
      geocodeAddress(searchTerm, function(userLocation) {
        if (userLocation) {
          userCurrentLocation = userLocation;
          console.log('User location geocoded for nearest stores:', userLocation);
          
          // Update map to show the searched location
          if (mapType === 'dynamic' && window.updateDynamicMap) {
            window.updateDynamicMap(searchTerm, 'search-location');
          }
          
          recommendNearestStores(10);
        } else {
          displayNoResults();
        }
      });
    } else {
      filteredLocations = textResults;
      
      // If search term exists and results found, use search term as center point
      if (searchTerm.trim()) {
        geocodeAddress(searchTerm, function(searchLocation) {
          if (searchLocation) {
            userCurrentLocation = searchLocation;
            console.log('Search location geocoded:', searchLocation);
            
            // Update map to show the searched location first
            if (mapType === 'dynamic' && window.updateDynamicMap) {
              window.updateDynamicMap(searchTerm, 'search-location');
            }
            
            // Calculate distances from search location to stores
            calculateDistancesProgressively(filteredLocations, () => {
              displayResults();
              
              // Update map with all current page markers after displaying results
              setTimeout(() => {
                updateMapWithAllCurrentPageMarkers();
              }, 500);
            });
          } else {
            // If unable to get search location coordinates, display results directly
            console.warn('Could not geocode search term:', searchTerm);
            displayResults();
            
            // Still try to update map with current results
            setTimeout(() => {
              updateMapWithAllCurrentPageMarkers();
            }, 500);
          }
        });
      } else {
        displayResults();
        
        // Update map with current results
        setTimeout(() => {
          updateMapWithAllCurrentPageMarkers();
        }, 500);
      }
    }
  }

  // New function to show nearest stores for a specific location
  function showNearestStoresForLocation(searchLocation, count = 10) {
    if (!searchLocation) {
      displayNoResults();
      return;
    }
    
    showLoadingState();
    
    // Calculate distances for all locations
    const locationsWithDistance = [];
    let processedCount = 0;
    
    allLocations.forEach(card => {
      getStoreCoordinates(card, (coords) => {
        if (coords) {
          const distance = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            coords.lat, coords.lng
          );
          locationsWithDistance.push({ card, distance });
        }
        
        processedCount++;
        if (processedCount === allLocations.length) {
          showNearestStoresResults(locationsWithDistance, count);
        }
      });
    });
  }

  // Recommend nearest stores when no search results found
  function recommendNearestStores(count = 10) {
    if (!userCurrentLocation) {
      displayNoResults();
      return;
    }
    
    showLoadingState();
    
    // Calculate distances for all locations
    const locationsWithDistance = [];
    let processedCount = 0;
    
    allLocations.forEach(card => {
      getStoreCoordinates(card, (coords) => {
        if (coords) {
          const distance = calculateDistance(
            userCurrentLocation.lat, userCurrentLocation.lng,
            coords.lat, coords.lng
          );
          locationsWithDistance.push({ card, distance });
        }
        
        processedCount++;
        if (processedCount === allLocations.length) {
          showNearestStoresResults(locationsWithDistance, count);
        }
      });
    });
  }

  // Show nearest stores results
  function showNearestStoresResults(locationsWithDistance, count) {
    hideLoadingState();
    
    // Sort by distance and take the nearest ones
    const nearestStores = locationsWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count);
    
    // Update distance display for nearest stores
    nearestStores.forEach(({ card, distance }) => {
      updateCardDistance(card, distance);
    });
    
    filteredLocations = nearestStores.map(item => item.card);
    
    // Show recommendation message
    showRecommendationMessage();
    displayResults();
  }

  // Show recommendation message
  function showRecommendationMessage() {
    // 检查是否已存在推荐消息，避免重复显示
    const existingMessage = document.querySelector('.search-recommendation-message');
    if (existingMessage) {
      return; // 如果已存在，直接返回
    }
    
    const messageContainer = document.createElement('div');
    messageContainer.className = 'search-recommendation-message';
    messageContainer.innerHTML = `
      <div class="recommendation-icon">💡</div>
      <div class="recommendation-text">
        <strong>No exact matches found.</strong><br>
        Here are the 10 nearest stores to your searched location:
      </div>
    `;
    
    // Insert message before results
    const resultsContainer = locationResults;
    if (resultsContainer.firstChild) {
      resultsContainer.insertBefore(messageContainer, resultsContainer.firstChild);
    } else {
      resultsContainer.appendChild(messageContainer);
    }
    
    // Auto-remove message after 10 seconds
    setTimeout(() => {
      if (messageContainer.parentNode) {
        messageContainer.parentNode.removeChild(messageContainer);
      }
    }, 10000);
  }

  // Display no results message
  function displayNoResults() {
    hideLoadingState();
    filteredLocations = [];
    
    // 隐藏所有现有的商店卡片，但不删除它们
    allLocations.forEach((card) => {
      card.classList.add('pagination-hidden');
      card.classList.remove('active');
    });
    
    // 检查是否已经存在"No results"消息
    let noResultsMessage = document.querySelector('.no-results-message');
    if (!noResultsMessage) {
      // 创建"No results"消息元素
      noResultsMessage = document.createElement('div');
      noResultsMessage.className = 'no-results-message';
      noResultsMessage.innerHTML = `
        <div class="no-results-icon">🔍</div>
        <div class="no-results-text">
          <strong>No stores found</strong><br>
          Please try a different search term or check your spelling.
        </div>
      `;
      
      // 将消息添加到容器的开头
      locationResults.insertBefore(noResultsMessage, locationResults.firstChild);
    }
    
    updatePagination();
  }

  function calculateDistancesProgressively(locations, callback) {
    const CHUNK_SIZE = 3;
    let processedCount = 0;
    
    function processChunk() {
      const chunk = locations.slice(processedCount, processedCount + CHUNK_SIZE);
      let chunkCompleted = 0;
      
      if (chunk.length === 0) {
        callback();
        return;
      }
      
      chunk.forEach(card => {
        getStoreCoordinates(card, (coords) => {
          if (coords) {
            const distance = calculateDistance(
              userCurrentLocation.lat, userCurrentLocation.lng,
              coords.lat, coords.lng
            );
            updateCardDistance(card, distance);
          }
          
          chunkCompleted++;
          if (chunkCompleted === chunk.length) {
            processedCount += CHUNK_SIZE;
            
            // 只重新排序，不立即显示结果
            sortLocationsByDistance();
            
            if (processedCount < locations.length) {
              setTimeout(processChunk, 300);
            } else {
              // 只在最后完成时调用callback
              callback();
            }
          }
        });
      });
    }
    
    processChunk();
  }



  function updateCardDistance(card, distance) {
    const distanceElement = card.querySelector('.location-card__distance');
    const distanceValue = card.querySelector('.distance-value');
    
    if (distanceElement && distanceValue) {
      // 检查距离是否有效（大于等于0且不是NaN或Infinity）
      if (distance !== null && distance >= 0 && isFinite(distance)) {
        distanceValue.textContent = distance.toFixed(1) + ' KM';
        distanceElement.style.display = 'block';
        distanceElement.classList.add('has-distance');
        
        card.setAttribute('data-distance', distance.toFixed(1));
      } else {
        // 如果距离无效，隐藏距离显示
        distanceElement.style.display = 'none';
        distanceElement.classList.remove('has-distance');
        card.removeAttribute('data-distance');
      }
    }
  }

  function sortLocationsByDistance() {
    filteredLocations.sort((a, b) => {
      const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
      const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
      return distanceA - distanceB;
    });
  }

  // 性能监控
  function measurePerformance(operation, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${operation} took ${(end - start).toFixed(2)}ms`);
    return result;
  }

  // 优化的搜索函数
  function optimizedPerformSearch(saveToHistory = true) {
    const searchTerm = locationSearch.value.toLowerCase().trim();
    
    measurePerformance('Total Search', () => {
      // 首先应用过滤器（最快）
      applyFilters();
      
      if (!searchTerm) {
        displayResults();
        return;
      }
      
      // 文本搜索（快速）
      const textResults = measurePerformance('Text Search', () => 
        performTextSearch(searchTerm)
      );
      
      // 立即显示文本结果
      displayResults(textResults, false);
      
      // 异步距离计算（较慢）
      if (userCurrentLocation) {
        measurePerformance('Distance Calculation', () => {
          calculateDistancesProgressively(textResults, () => {
            displayResults();
          });
        });
      } else {
        hideLoadingState();
      }
    });
  }

  // 统一的performSearch函数
  function performSearch(saveToHistory = true) {
    // 重置到第一页
    currentPage = 1;
    
    const searchTerm = locationSearch.value.trim();
    
    // Remove any existing recommendation messages
    const existingMessage = document.querySelector('.search-recommendation-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // 如果有搜索词，保存到历史记录
    if (saveToHistory && searchTerm && !searchHistory.includes(searchTerm)) {
      searchHistory.unshift(searchTerm);
      searchHistory = searchHistory.slice(0, 10);
      localStorage.setItem('dealerSearchHistory', JSON.stringify(searchHistory));
    }
  
    // 如果没有搜索词，直接应用过滤器
    if (!searchTerm) {
      applyFilters();
      displayResults();
      hideSuggestions();
      return;
    }
  
    // Use the enhanced search with fallback
    performTextSearchWithFallback(searchTerm);
  
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
      // 首先尝试使用JSON文件中的经纬度坐标
      const latitude = parseFloat(card.getAttribute('data-latitude'));
      const longitude = parseFloat(card.getAttribute('data-longitude'));
      
      if (!isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0) {
        // 直接使用JSON文件中的坐标计算距离
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          latitude, longitude
        );
        
        const distanceElement = card.querySelector('.location-card__distance');
        const distanceValue = card.querySelector('.distance-value');
        
        if (distanceElement && distanceValue) {
          distanceValue.textContent = distance.toFixed(1) + ' KM';
          distanceElement.style.display = 'block';
          distanceElement.classList.add('has-distance');
          
          card.setAttribute('data-distance', distance.toFixed(1));
        }
        
        completedRequests++;
        
        if (completedRequests === totalRequests) {
          // 按距离排序
          filteredLocations.sort((a, b) => {
            const distanceA = parseFloat(a.getAttribute('data-distance')) || Infinity;
            const distanceB = parseFloat(b.getAttribute('data-distance')) || Infinity;
            return distanceA - distanceB;
          });
          
          hideLoadingState();
          displayResults();
        }
      } else {
        // 如果没有有效的经纬度坐标，回退到地理编码API
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
    
    // 完全重置搜索状态
    filteredLocations = [...allLocations];
    userCurrentLocation = null;
    currentPage = 1;
    
    // 清除"No results"消息
    const noResultsMessage = document.querySelector('.no-results-message');
    if (noResultsMessage) {
      noResultsMessage.remove();
    }
    
    // 清除加载状态
    hideLoadingState();
    
    // 重新显示所有结果
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

    // 添加工具提示
    addTooltipToSearchInput();

    if (this.value === '') {
      clearSearch();
    } else {
      showSuggestions(this.value);
      // 移除自动搜索逻辑，只显示建议
      // searchTimeout = setTimeout(() => {
      //   performSearch(false);
      // }, 300);
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

  // 应用过滤器函数
  function applyFilters() {
    const selectedFilters = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    if (selectedFilters.length > 0) {
      filteredLocations = allLocations.filter(card => {
        const storeType = card.getAttribute('data-store-type');
        const storeTypes = [storeType]; // 只处理单一类型
        
        // 检查是否有匹配的类型
        return selectedFilters.includes(storeType);
      });
    } else {
      filteredLocations = [...allLocations];
    }
    
    // 应用距离筛选
    applyDistanceFilter();
  }

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      // 如果有用户位置，直接应用过滤器和距离筛选
      if (userCurrentLocation) {
        applyDistanceFilter();
        displayResults();
      } else {
        // 没有用户位置时，使用普通搜索
        performSearch(false);
      }
    });
  });

  // 添加事件监听器
  if (useLocationBtn) {
    useLocationBtn.addEventListener('click', getCurrentLocation);
  }
  
  if (distanceFilter) {
    distanceFilter.addEventListener('change', function() {
      // 移除userCurrentLocation的条件限制，确保店铺类型筛选始终生效
      applyDistanceFilter();
      displayResults();
    });
  }

  function initEventListeners() {
    const locationCards = document.querySelectorAll('.location-card');
    
    locationCards.forEach(function (card) {
      card.addEventListener('click', function () {
        locationCards.forEach((c) => c.classList.remove('active'));
        this.classList.add('active');
        updateMapForCard(this);
      });
    });

    // 初始化分页
    initializePagination();
    
    // 初始化工具提示
    initializeTooltips();
  }

  // Enhanced tooltip functionality for mobile devices
  function initializeTooltips() {
    const filterOptions = document.querySelectorAll('.filter-option[data-tooltip]');
    
    filterOptions.forEach(option => {
      // For touch devices, show tooltip on tap and hide after delay
      option.addEventListener('touchstart', function(e) {
        // Hide any existing tooltips
        hideAllTooltips();
        
        // Show current tooltip
        this.classList.add('tooltip-active');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          this.classList.remove('tooltip-active');
        }, 3000);
      });
      
      // Hide tooltip when touching elsewhere
      document.addEventListener('touchstart', function(e) {
        if (!option.contains(e.target)) {
          option.classList.remove('tooltip-active');
        }
      });
    });
  }

  function hideAllTooltips() {
    const activeTooltips = document.querySelectorAll('.filter-option.tooltip-active');
    activeTooltips.forEach(tooltip => {
      tooltip.classList.remove('tooltip-active');
    });
  }

  // 启动应用
  init();

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
    // 单一类型显示
    const translatedStoreType = i18nLabels[storeType] || storeType;
    content += `<div class="store-type-badge" data-store-type="${storeType}">${translatedStoreType}</div>`;
  }

    content += `</div>`;
    return content;
  }
});