/**
 * Loads a script.
 * @param {string} src - Url of script to load.
 * @returns {Promise}
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

/* global google */

if (!customElements.get('location-map')) {
  class LocationMap extends HTMLElement {
    constructor() {
      super();
      if (!this.dataset.apiKey || !this.dataset.address) return;

      window.initLazyScript(this, this.init.bind(this));
    }

    init() {
      this.mapOptions = {
        scrollwheel: false,
        zoom: 14
      };

      // Map ID for styling.
      if (this.dataset.mapId) {
        this.mapOptions.mapId = this.dataset.mapId;
      }

      if (this.dataset.mapStyle) {
        this.mapOptions.styles = LocationMap.getStyle(this.dataset.mapStyle);
      }

      // 获取语言和区域设置
      const language = this.dataset.language || 'en';
      const region = this.dataset.region || 'US';

      loadScript(`https://maps.googleapis.com/maps/api/js?key=${this.dataset.apiKey}&language=${language}&region=${region}`)
        .then(this.createMap.bind(this));
    }

    createMap() {
      this.map = new google.maps.Map(this, this.mapOptions);
      this.geocoder = new google.maps.Geocoder();
      this.infoWindow = new google.maps.InfoWindow();
      this.marker = null;

      // 将updateDynamicMap和updateInfoWindow函数暴露到全局
      window.updateDynamicMap = this.updateMap.bind(this);
      window.updateInfoWindow = this.updateInfoWindow.bind(this);

      this.geocoder.geocode({ address: this.dataset.address })
        .then(({ results }) => {
          if (results[0]) {
            this.map.setCenter(results[0].geometry.location);

            this.marker = new google.maps.Marker({
              map: this.map,
              position: results[0].geometry.location,
              clickable: true
            });
          }
        })
        .catch((error) => {
          const mapContainer = this.querySelector('.map-container');

          if (Shopify.designMode && mapContainer) {
            mapContainer.innerHTML = `<div class="alert mb-8 bg-error-bg text-error-text">${error}</div>`;
          }
        });
    }

    // 在createMap方法中添加自定义marker函数
    createCustomMarker(storeType, position) {
    // 创建自定义marker图标
    const markerIcon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(this.getMarkerSVG(storeType))}`,
    scaledSize: new google.maps.Size(44, 56), // 更新尺寸以匹配新设计
    anchor: new google.maps.Point(22, 56) // 更新锚点位置
    };
    
    return new google.maps.Marker({
    map: this.map,
    position: position,
    icon: markerIcon,
    clickable: true
    });
    }
    
    getMarkerSVG(storeType) {
    const colors = {
    dealer: { primary: '#2563eb', secondary: '#1d4ed8' },
    rental: { primary: '#059669', secondary: '#047857' },
    service: { primary: '#dc2626', secondary: '#b91c1c' },
    'click-collect': { primary: '#7c3aed', secondary: '#6d28d9' }
    };
    
    const color = colors[storeType] || colors.dealer;
    
    return `<svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
    <linearGradient id="marker-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" style="stop-color:${color.primary};stop-opacity:1" />
    <stop offset="100%" style="stop-color:${color.secondary};stop-opacity:1" />
    </linearGradient>
    <filter id="marker-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
    </defs>
    <path d="M20 48C20 48 38 22 38 17C38 9 31 2 20 2C9 2 2 9 2 17C2 22 20 48 20 48Z" 
          fill="url(#marker-gradient)" 
          filter="url(#marker-shadow)" 
          stroke="#ffffff" 
          stroke-width="1"/>
    <circle cx="20" cy="17" r="12" fill="rgba(255,255,255,0.2)"/>
    <g transform="translate(10, 7) scale(0.023)">
      <path d="M812.803 390.655C811.283 388.196 807.846 387.804 805.784 389.828C770.081 425.234 506.872 686.252 506.809 686.314C469.336 723.476 408.575 723.476 371.101 686.314C333.628 649.153 333.628 588.897 371.101 551.736C371.101 551.736 482.73 441.14 553.531 370.989C590.005 334.84 610.522 285.801 610.522 234.675L610.585 4.47674C610.585 0.489988 605.731 -1.49306 602.899 1.31626L350.646 251.345C347.813 254.155 342.96 252.172 342.96 248.185V109.31C342.96 105.323 338.107 103.40 335.274 106.149L124.869 314.865H124.994C-43.3964 485.696 -41.6467 759.894 130.243 928.597C301.591 1096.72 580.027 1095.65 750.105 926.263C896.249 780.736 917.141 558.222 812.803 390.655Z" fill="#ffffff"/>
    </g>
  </svg>`;
    }

    // 修改updateMap方法
    updateMap(address, storeType = 'dealer') {
    if (!this.geocoder || !this.map) return;
    
    this.geocoder.geocode({ address: address })
    .then(({ results }) => {
    if (results[0]) {
    this.map.setCenter(results[0].geometry.location);
    
    // 移除旧标记
    if (this.marker) {
    this.marker.setMap(null);
    }
    
    // 创建自定义标记
    this.marker = this.createCustomMarker(storeType, results[0].geometry.location);
    }
    })
    .catch((error) => {
    console.error('Geocoding failed:', error);
    });
    }

    updateInfoWindow(content) {
      if (!this.infoWindow || !this.marker) {
        console.log('Info window or marker not available');
        return;
      }
      
      // 清除之前的事件监听器
      if (this.markerClickListener) {
        google.maps.event.removeListener(this.markerClickListener);
      }
      
      this.infoWindow.setContent(content);
      this.infoWindow.open(this.map, this.marker);
      
      // 添加点击标记显示info window的事件
      this.markerClickListener = this.marker.addListener('click', () => {
        this.infoWindow.open(this.map, this.marker);
      });
    }

    static getStyle(style) {
      switch (style) {
        case 'silver':
          return [{ elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] }, { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] }, { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] }, { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] }, { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] }, { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }, { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }, { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] }, { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }];
        case 'retro':
          return [{ elementType: 'geometry', stylers: [{ color: '#ebe3cd' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#523735' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f1e6' }] }, { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9b2a6' }] }, { featureType: 'administrative.land_parcel', elementType: 'geometry.stroke', stylers: [{ color: '#dcd2be' }] }, { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#ae9e90' }] }, { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] }, { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#93817c' }] }, { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#a5b076' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#447530' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f1e6' }] }, { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdfcf8' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f8c967' }] }, { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e9bc62' }] }, { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#e98d58' }] }, { featureType: 'road.highway.controlled_access', elementType: 'geometry.stroke', stylers: [{ color: '#db8555' }] }, { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#806b63' }] }, { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] }, { featureType: 'transit.line', elementType: 'labels.text.fill', stylers: [{ color: '#8f7d77' }] }, { featureType: 'transit.line', elementType: 'labels.text.stroke', stylers: [{ color: '#ebe3cd' }] }, { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#dfd2ae' }] }, { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#b9d3c2' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#92998d' }] }];
        case 'dark':
          return [{ elementType: 'geometry', stylers: [{ color: '#212121' }] }, { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] }, { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] }, { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }, { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] }, { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }, { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: '#1b1b1b' }] }, { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] }, { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] }, { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] }, { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] }, { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] }, { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }];
        case 'night':
          return [{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] }, { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] }, { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] }, { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] }, { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] }, { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] }, { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] }, { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] }, { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] }, { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }];
        case 'aubergine':
          return [{ elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] }, { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] }, { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] }, { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] }, { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] }, { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] }, { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] }, { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] }, { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] }, { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] }, { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] }, { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] }, { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] }, { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] }, { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] }, { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] }, { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] }, { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] }, { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] }, { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] }, { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] }, { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] }, { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] }, { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] }, { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }, { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] }];
        default:
          return [];
      }
    }
  }

  customElements.define('location-map', LocationMap);
}
