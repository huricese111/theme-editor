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

// Global variable to store the current map instance
let currentMapInstance = null;

// Global functions for external access
window.updateDynamicMap = function(address, storeType = 'dealer') {
  if (currentMapInstance) {
    currentMapInstance.updateMap(address, storeType);
  }
};

// 新增：支持多个标记的全局函数
window.updateDynamicMapWithMultipleMarkers = function(locations) {
  if (currentMapInstance) {
    currentMapInstance.updateMapWithMultipleMarkers(locations);
  }
};

window.updateInfoWindow = function(content) {
  if (currentMapInstance) {
    currentMapInstance.updateInfoWindow(content);
  }
};

if (!customElements.get('location-map')) {
  class LocationMap extends HTMLElement {
    constructor() {
      super();
      if (!this.dataset.apiKey || !this.dataset.address) return;

      window.initLazyScript(this, this.init.bind(this));
    }

    init() {
      this.mapOptions = {
        scrollwheel: true,  // 启用鼠标滚轮缩放
        zoom: 14
      };

      // Map ID for styling.
      if (this.dataset.mapId) {
        this.mapOptions.mapId = this.dataset.mapId;
      }

      if (this.dataset.mapStyle) {
        this.mapOptions.styles = LocationMap.getStyle(this.dataset.mapStyle);
      }

      // Get language and region settings
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
    
      // Store this instance globally for external access
      currentMapInstance = this;
    
      // Add custom zoom controls
      this.addCustomZoomControls();

      this.geocoder.geocode({ address: this.dataset.address })
        .then(({ results }) => {
          if (results[0]) {
            this.map.setCenter(results[0].geometry.location);

            // 注释掉默认标记创建，只保留地图定位
            // this.marker = new google.maps.Marker({
            //   map: this.map,
            //   position: results[0].geometry.location,
            //   clickable: true
            // });
          }
        })
        .catch((error) => {
          const mapContainer = this.querySelector('.map-container');

          if (Shopify.designMode && mapContainer) {
            mapContainer.innerHTML = `<div class="alert mb-8 bg-error-bg text-error-text">${error}</div>`;
          }
        });
    }

    // Add custom zoom controls method
    addCustomZoomControls() {
      // Create zoom control container
      const zoomControlDiv = document.createElement('div');
      zoomControlDiv.className = 'custom-zoom-controls';
      
      // Create zoom in button
      const zoomInButton = document.createElement('button');
      zoomInButton.className = 'zoom-control zoom-in';
      zoomInButton.innerHTML = '+';
      zoomInButton.title = 'Zoom in';
      zoomInButton.setAttribute('aria-label', 'Zoom in');
      
      // Create zoom out button
      const zoomOutButton = document.createElement('button');
      zoomOutButton.className = 'zoom-control zoom-out';
      zoomOutButton.innerHTML = '−';
      zoomOutButton.title = 'Zoom out';
      zoomOutButton.setAttribute('aria-label', 'Zoom out');
      
      // Add buttons to container
      zoomControlDiv.appendChild(zoomInButton);
      zoomControlDiv.appendChild(zoomOutButton);
      
      // Add event listeners
      zoomInButton.addEventListener('click', () => {
        const currentZoom = this.map.getZoom();
        this.map.setZoom(currentZoom + 1);
      });
      
      zoomOutButton.addEventListener('click', () => {
        const currentZoom = this.map.getZoom();
        this.map.setZoom(currentZoom - 1);
      });
      
      // Add to map
      this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);
      
      // Disable default zoom control to avoid duplication
      this.map.setOptions({
        zoomControl: false,
        scrollwheel: true,  // 确保鼠标滚轮缩放功能启用
        zoom: 14
      });
    }

    // Custom marker creation function
    createCustomMarker(storeType, position) {
      // Create custom marker icon
      const markerIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(this.getMarkerSVG(storeType))}`,
        scaledSize: new google.maps.Size(40, 50),
        anchor: new google.maps.Point(20, 50)
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
        dealer: '#2b7dde',     
        rental: '#66ad78',        
        service: '#fa6959',     
        'click-collect': '#FF9933',
        search: '#9C27B0'  // Purple color for search locations
      };
      
      // Simple color lookup for single store types only
      const color = colors[storeType] || '#3699FF';
      
      const uniqueId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const clipId = `clip-${uniqueId}`;
      
      // 使用与location card相同的Hepha图标路径
      const iconPath = 'M27.1 12.6C27.0 12.5 26.9 12.5 26.9 12.5C25.9 13.3 21.2 18.2 21.2 18.2C20.5 18.9 19.3 18.9 18.6 18.2C17.9 17.5 17.9 16.4 18.6 15.7C18.6 15.7 20.7 13.6 22.1 12.2C22.8 11.5 23.2 10.6 23.2 9.6L23.2 5.3C23.2 5.2 23.1 5.1 23.0 5.2L18.2 10.0C18.1 10.1 18.0 10.0 18.0 9.9V7.3C18.0 7.2 17.9 7.1 17.8 7.2L13.9 11.2H13.9C10.7 14.4 10.8 19.6 14.0 22.8C17.2 26.0 22.6 25.9 25.8 22.8C28.7 20.0 29.1 15.8 27.1 12.6Z';
      
      return `<svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
        <clipPath id="${clipId}">
        <rect width="40" height="50" fill="white"/>
        </clipPath>
        </defs>
        <g clip-path="url(#${clipId})">
        <path d="M34.4 13.3C33.6 6.1 27.4 0.6 20 0.6C12.6 0.6 6.4 6.1 5.6 13.3C5.5 13.9 5.4 14.5 5.4 15.0C5.3 17.5 6.0 20.0 7.1 22.3C7.6 23.3 8.2 24.3 8.8 25.3L17.9 38.9C18.5 39.6 19.2 40.0 20.0 40.0C20.8 40.0 21.5 39.6 22.1 38.9L31.2 25.3C31.8 24.3 32.4 23.3 32.9 22.3C34.9 19.5 35.1 16.4 34.4 13.3Z" fill="${color}"/>
        
        <path d="${iconPath}" fill="white"/>
        
        </g>
        </svg>`;
    }

    updateMap(address, storeType = 'dealer') {
      if (!this.geocoder || !this.map) return;
      
      // Handle search location type
      const processedStoreType = storeType === 'search-location' ? 'search' : 
                           (Array.isArray(storeType) ? storeType[0] : storeType);
      
      console.log('Updating map for address:', address, 'with store type:', processedStoreType);
      
      this.geocoder.geocode({ address: address })
        .then(({ results }) => {
          if (results[0]) {
            const position = results[0].geometry.location;
            console.log('Map updated to position:', position.lat(), position.lng());
            
            this.map.setCenter(position);
            
            // Remove old marker
            if (this.marker) {
              this.marker.setMap(null);
            }
            
            // Create marker with appropriate type
            this.marker = this.createCustomMarker(processedStoreType, position);
            
            // Set appropriate zoom level for search locations
            if (storeType === 'search-location') {
              this.map.setZoom(12); // Wider view for search locations
            } else {
              this.map.setZoom(16); // Closer view for specific stores
            }
          }
        })
        .catch((error) => {
          console.error('Geocoding failed for map update:', error);
        });
    }

    // 新增：支持多个标记的地图更新函数（支持直接使用坐标）
    updateMapWithMultipleMarkers(locations) {
      if (!this.map || !locations || locations.length === 0) return;
      
      // 防止重复调用的逻辑
      const locationsKey = JSON.stringify(locations.map(loc => ({
        lat: loc.latitude,
        lng: loc.longitude,
        type: loc.storeType,
        name: loc.storeName
      })));
      
      // 如果位置数据没有变化，跳过更新
      if (this.lastLocationsKey === locationsKey) {
        return;
      }
      
      this.lastLocationsKey = locationsKey;
      
      // 清除现有的标记
      if (this.markers) {
        this.markers.forEach(marker => marker.setMap(null));
      }
      this.markers = [];
      
      // 清除单个标记（如果存在）
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }
      
      const bounds = new google.maps.LatLngBounds();
      let processedCount = 0;
      const totalLocations = locations.length;
      
      // 批量创建标记，减少DOM操作
      const markersToAdd = [];
      
      // 为每个位置创建标记
      locations.forEach((location, index) => {
        if (location.useCoordinates && location.latitude && location.longitude) {
          // 直接使用坐标，避免地理编码
          const position = new google.maps.LatLng(location.latitude, location.longitude);
          const marker = this.createCustomMarker(location.storeType, position);
          
          // 添加信息窗口
          const infoWindow = new google.maps.InfoWindow({
            content: location.infoContent
          });
          
          marker.addListener('click', () => {
            // 关闭其他信息窗口
            if (this.currentInfoWindow) {
              this.currentInfoWindow.close();
            }
            infoWindow.open(this.map, marker);
            this.currentInfoWindow = infoWindow;
          });
          
          markersToAdd.push(marker);
          bounds.extend(position);
          
          processedCount++;
          
          // 当所有位置都处理完成后，批量添加到地图并调整视图
          if (processedCount === totalLocations) {
            // 使用requestAnimationFrame确保平滑渲染
            requestAnimationFrame(() => {
              this.markers = markersToAdd;
              this.adjustMapView(bounds, totalLocations);
            });
          }
        } else if (location.address) {
          // 使用地理编码（作为备选方案）
          this.geocoder.geocode({ address: location.address })
            .then(({ results }) => {
              if (results[0]) {
                const position = results[0].geometry.location;
                const marker = this.createCustomMarker(location.storeType, position);
                
                // 添加信息窗口
                const infoWindow = new google.maps.InfoWindow({
                  content: location.infoContent
                });
                
                marker.addListener('click', () => {
                  if (this.currentInfoWindow) {
                    this.currentInfoWindow.close();
                  }
                  infoWindow.open(this.map, marker);
                  this.currentInfoWindow = infoWindow;
                });
                
                markersToAdd.push(marker);
                bounds.extend(position);
              }
              
              processedCount++;
              if (processedCount === totalLocations) {
                requestAnimationFrame(() => {
                  this.markers = markersToAdd;
                  this.adjustMapView(bounds, this.markers.length);
                });
              }
            })
            .catch((error) => {
              console.error('Geocoding failed for location:', location.address, error);
              processedCount++;
              if (processedCount === totalLocations) {
                requestAnimationFrame(() => {
                  this.markers = markersToAdd;
                  this.adjustMapView(bounds, this.markers.length);
                });
              }
            });
        }
      });
    }
    
    // 新增：调整地图视图的辅助函数，以德国为中心并使用较低缩放级别
    adjustMapView(bounds, markerCount) {
      if (markerCount === 0) return;
      
      // 德国的中心坐标（柏林附近）
      const germanyCenter = new google.maps.LatLng(51.1657, 10.4515);
      
      if (markerCount === 1) {
        // 如果只有一个位置，设置中心点和更高的缩放级别
        this.map.setCenter(bounds.getCenter());
        this.map.setZoom(16); // 从14提高到16，地图更放大
      } else {
        // 如果有多个位置，以德国为中心并设置更高的缩放级别
        this.map.setCenter(germanyCenter);
        this.map.setZoom(7); // 从6提高到7，地图更放大
        
        // 可选：如果需要确保所有标记都在视野内，可以使用fitBounds但限制最小缩放级别
        // this.map.fitBounds(bounds);
        // 
        // // 设置最小和最大缩放级别，避免过度放大或缩小
        // const listener = google.maps.event.addListener(this.map, 'idle', () => {
        //   const currentZoom = this.map.getZoom();
        //   if (currentZoom > 8) {
        //     this.map.setZoom(8); // 最大缩放级别
        //   } else if (currentZoom < 5) {
        //     this.map.setZoom(5); // 最小缩放级别
        //   }
        //   google.maps.event.removeListener(listener);
        // });
      }
    }

    updateInfoWindow(content) {
      if (!this.infoWindow || !this.marker) {
        console.log('Info window or marker not available');
        return;
      }
      
      // Clear previous event listeners
      if (this.markerClickListener) {
        google.maps.event.removeListener(this.markerClickListener);
      }
      
      this.infoWindow.setContent(content);
      this.infoWindow.open(this.map, this.marker);
      
      // Add click marker to show info window event
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