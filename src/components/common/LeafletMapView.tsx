import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Market, FarmerProfile } from '../../types';

export interface LeafletMapViewProps {
  markets: Market[];
  selectedMarketId?: number | string;
  onSelectMarket?: (marketId: number | string) => void;
  farmers?: FarmerProfile[];
  height?: string;
  className?: string;
  zoom?: number;
  showStallPins?: boolean;
}

// Custom SVG HTML Pin Icon Generator for Mandi Hubs
const createMandiIcon = (isSelected: boolean) => {
  const bg = isSelected ? '#064e3b' : '#047857';
  const border = isSelected ? '#f59e0b' : '#ffffff';
  const pulseRing = isSelected
    ? `<span class="absolute -inset-2 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>`
    : '';

  return L.divIcon({
    className: 'custom-mandi-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 44px;">
        ${pulseRing}
        <div style="background-color: ${bg}; border-color: ${border}; box-shadow: 0 4px 14px rgba(0,0,0,0.25);" class="relative z-10 w-9 h-9 rounded-2xl flex items-center justify-center text-white border-2 transition-transform duration-200 group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 w-2.5 h-2.5 rotate-45 z-0" style="background-color: ${bg};"></div>
      </div>
    `,
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44],
  });
};

// Custom SVG Pin Icon for Farmer Stalls
const createStallIcon = () => {
  return L.divIcon({
    className: 'custom-stall-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 26px; height: 26px;">
        <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 20h10"/>
            <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

// Coordinate sanitization helpers to ensure Leaflet never receives NaN or invalid coordinates
const toValidNumber = (val: any, fallback: number): number => {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const isValidCoord = (lat: any, lng: any): boolean => {
  return (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lng === 'number' &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  );
};

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  markets = [],
  selectedMarketId,
  onSelectMarket,
  farmers = [],
  height = '420px',
  className = '',
  zoom = 14,
  showStallPins = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const selectedMarket =
    (Array.isArray(markets) &&
      markets.find((m) => m && m.id != null && m.id.toString() === selectedMarketId?.toString())) ||
    (Array.isArray(markets) && markets[0]) ||
    undefined;

  const initialCenterLat = toValidNumber(selectedMarket?.latitude, 24.9721);
  const initialCenterLng = toValidNumber(selectedMarket?.longitude, 67.1571);

  // Helper function to safely invalidate map size
  const triggerInvalidateSize = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.invalidateSize();
      } catch (err) {
        console.warn('[LeafletMapView] invalidateSize notice:', err);
      }
    }
  };

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Guard against double init in React 19 StrictMode
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const defaultLat = isValidCoord(initialCenterLat, initialCenterLng) ? initialCenterLat : 24.9721;
    const defaultLng = isValidCoord(initialCenterLat, initialCenterLng) ? initialCenterLng : 67.1571;

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        fadeAnimation: true,
        zoomAnimation: true,
      });
    } catch (mapInitErr) {
      console.warn('[LeafletMapView] Map init warning, falling back to default center:', mapInitErr);
      map = L.map(mapContainerRef.current, {
        center: [24.9721, 67.1571],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });
    }

    // Esri World Street Map tiles (free, no API key required, no watermarks)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS, Intermap, NASA',
      }
    ).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Trigger invalidateSize at multiple intervals to handle layout passes and animation transitions
    requestAnimationFrame(triggerInvalidateSize);
    const timer1 = setTimeout(triggerInvalidateSize, 150);
    const timer2 = setTimeout(triggerInvalidateSize, 400);
    const timer3 = setTimeout(triggerInvalidateSize, 800);

    // Watch for size changes (scroll reveal, window resize, tab switch)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        triggerInvalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    // Watch for element coming into view (e.g., scroll reveal)
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && mapContainerRef.current) {
      intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerInvalidateSize();
          }
        });
      });
      intersectionObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // 2. Update Markers & Centering when markets, selectedMarket, or farmers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (!Array.isArray(markets) || markets.length === 0) return;

    // Add Mandi Market Pins
    markets.forEach((m) => {
      if (!m) return;
      const lat = toValidNumber(m.latitude, NaN);
      const lng = toValidNumber(m.longitude, NaN);
      if (!isValidCoord(lat, lng)) {
        return; // Guard against NaN LatLng crashes
      }

      const isSelected = selectedMarket && m.id != null && m.id.toString() === selectedMarket.id.toString();
      const icon = createMandiIcon(Boolean(isSelected));

      try {
        const marker = L.marker([lat, lng], {
          icon,
          zIndexOffset: isSelected ? 1000 : 100,
        });

        // Interactive popup
        const popupContent = document.createElement('div');
        popupContent.className = 'font-sans p-1 min-w-[220px] text-[#10231d]';
        popupContent.innerHTML = `
          <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#064e3b] uppercase tracking-wider mb-1">
            <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
            <span>${isSelected ? 'Selected Mandi' : 'Regional Mandi'}</span>
          </div>
          <h4 class="font-serif text-sm font-semibold text-[#10231d] leading-snug">${m.name || 'Mandi'}</h4>
          <p class="text-[11px] text-[#64748b] mt-1 leading-relaxed">${m.location_address || ''}</p>
          <div class="mt-2.5 pt-2 border-t border-[#e2e8e5] flex items-center justify-between text-[11px]">
            <span class="font-mono text-[#064e3b] font-semibold">${m.timings || '04:30 AM – 11:30 AM'}</span>
            <span class="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#064e3b] font-bold text-[10px] border border-emerald-200">
              ${m.stall_count || 24} Stalls
            </span>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'custom-leaflet-popup',
        });

        marker.on('click', () => {
          if (onSelectMarket && m.id != null) {
            onSelectMarket(m.id);
          }
        });

        markersGroup.addLayer(marker);

        if (isSelected) {
          setTimeout(() => {
            try {
              marker.openPopup();
            } catch {
              // Ignore popup open errors
            }
          }, 150);
        }
      } catch (markerErr) {
        console.warn('[LeafletMapView] Market marker creation warning:', markerErr);
      }
    });

    // Add Farmer Stall Pins for the selected market
    if (showStallPins && selectedMarket && Array.isArray(farmers) && farmers.length > 0) {
      const centerLat = toValidNumber(selectedMarket.latitude, NaN);
      const centerLng = toValidNumber(selectedMarket.longitude, NaN);

      if (isValidCoord(centerLat, centerLng)) {
        const marketFarmers = farmers.filter(
          (f) => f && f.market_id != null && f.market_id.toString() === selectedMarket.id.toString()
        );

        marketFarmers.forEach((farmer, idx) => {
          const angle = (idx / Math.max(marketFarmers.length, 1)) * 2 * Math.PI;
          const radius = 0.0008; // ~80 meters around mandi complex
          
          const rawStallLat = toValidNumber(farmer.stall_lat, NaN);
          const rawStallLng = toValidNumber(farmer.stall_lng, NaN);

          const stallLat = isValidCoord(rawStallLat, 0) && Math.abs(rawStallLat - centerLat) > 0.00005
            ? rawStallLat
            : centerLat + Math.sin(angle) * radius;
          const stallLng = isValidCoord(0, rawStallLng) && Math.abs(rawStallLng - centerLng) > 0.00005
            ? rawStallLng
            : centerLng + Math.cos(angle) * radius;

          if (!isValidCoord(stallLat, stallLng)) return;

          try {
            const stallIcon = createStallIcon();
            const stallMarker = L.marker([stallLat, stallLng], {
              icon: stallIcon,
              zIndexOffset: 50,
            });

            const stallPopup = document.createElement('div');
            stallPopup.className = 'font-sans p-1 min-w-[200px] text-[#10231d]';
            stallPopup.innerHTML = `
              <div class="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider mb-1">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>${farmer.stall_number || 'Stall Bay'}</span>
              </div>
              <h4 class="font-serif text-sm font-semibold text-[#10231d]">${farmer.farm_name || 'Farmer Stall'}</h4>
              <p class="text-[11px] text-[#064e3b] font-medium mt-0.5">${farmer.farming_practices || 'Organic Certified'}</p>
              <div class="mt-2 pt-1.5 border-t border-[#e2e8e5] text-[10px] text-[#64748b] flex justify-between">
                <span>Rating: ★ ${farmer.rating_avg?.toFixed(2) || '4.95'}</span>
                <span>Cutoff: ${farmer.cutoff_hours || 12}h</span>
              </div>
            `;

            stallMarker.bindPopup(stallPopup, {
              closeButton: true,
              className: 'custom-leaflet-popup',
            });

            markersGroup.addLayer(stallMarker);
          } catch (stallErr) {
            console.warn('[LeafletMapView] Stall marker warning:', stallErr);
          }
        });
      }
    }

    // Pan / flyTo selected market coordinates safely
    if (selectedMarket) {
      const targetLat = toValidNumber(selectedMarket.latitude, NaN);
      const targetLng = toValidNumber(selectedMarket.longitude, NaN);
      if (isValidCoord(targetLat, targetLng)) {
        try {
          map.flyTo([targetLat, targetLng], zoom, {
            duration: 0.8,
          });
        } catch (flyErr) {
          console.warn('[LeafletMapView] flyTo error:', flyErr);
        }
        triggerInvalidateSize();
      }
    }
  }, [
    markets,
    selectedMarket?.id,
    selectedMarket?.latitude,
    selectedMarket?.longitude,
    farmers,
    zoom,
    showStallPins,
    onSelectMarket,
  ]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#e2e8e5] shadow-xs bg-[#eef2ec] z-0 ${className}`}
      style={{ height, minHeight: height }}
    >
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height, minHeight: height }}
        className="w-full relative z-0"
      />
    </div>
  );
};
