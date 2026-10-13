import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Crosshair,
  Camera,
  Cpu,
  Droplets,
  Search,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';
import { FarmZone, MapMarkerItem } from '../../types';

export const FarmMapView: React.FC = () => {
  const {
    zones,
    markers,
    settings,
    updateSettings,
    addMapMarker,
    removeMapMarker,
    triggerDemoDetection,
    triggerWaterSpray,
  } = useSmartFence();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const coverageGroupRef = useRef<L.FeatureGroup | null>(null);

  const [selectedLayer, setSelectedLayer] = useState<'street' | 'satellite'>('street');
  const [selectedZone, setSelectedZone] = useState<FarmZone | null>(zones[0]);
  const [addMode, setAddMode] = useState<'camera' | 'sensor' | 'spray' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<MapMarkerItem | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = settings.mapCenter || [41.9820, -93.6515];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: settings.mapZoom || 15,
      zoomControl: true,
    });

    // Default OpenStreetMap Street Tiles
    const streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = streetTile;
    polygonsGroupRef.current = L.featureGroup().addTo(map);
    coverageGroupRef.current = L.featureGroup().addTo(map);
    markersGroupRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    // Handle map clicks for adding custom nodes
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (addMode) {
        addMapMarker({
          type: addMode,
          title: `Custom ${addMode.toUpperCase()} Node`,
          zoneId: selectedZone ? selectedZone.id : 'zone-a',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          coverageHeadingDeg: 180,
          coverageAngleDeg: 75,
          coverageRangeMeters: 35,
        });
        setAddMode(null);
      }
    });

    // Save map position on move
    map.on('moveend', () => {
      const center = map.getCenter();
      updateSettings({
        mapCenter: [Number(center.lat.toFixed(5)), Number(center.lng.toFixed(5))],
        mapZoom: map.getZoom(),
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer selector changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (selectedLayer === 'satellite') {
      // High-resolution satellite tiles via Esri World Imagery (with genuine provider attribution)
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, GIS User Community',
          maxZoom: 18,
        }
      ).addTo(map);
    } else {
      // Crisp OpenStreetMap standard street tiles
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }
  }, [selectedLayer]);

  // Update Zones polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsGroupRef.current) return;
    const group = polygonsGroupRef.current;
    group.clearLayers();

    zones.forEach((zone) => {
      const poly = L.polygon(zone.coordinates, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '4, 4',
      });

      poly.on('click', () => {
        setSelectedZone(zone);
      });

      poly.bindTooltip(
        `<div class="text-xs font-semibold">${zone.name}</div><div class="text-[11px] text-slate-300">${zone.cropType}</div>`,
        { permanent: false, direction: 'center' }
      );

      group.addLayer(poly);
    });
  }, [zones]);

  // Update Markers & Coverage Estimates
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !coverageGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    const coverageGroup = coverageGroupRef.current;

    markersGroup.clearLayers();
    coverageGroup.clearLayers();

    markers.forEach((m) => {
      // Coverage estimation overlay (circle/cone approximation)
      if (m.type === 'camera' || m.type === 'spray') {
        const radius = m.type === 'camera' ? 35 : 18;
        const color = m.type === 'camera' ? '#38bdf8' : '#06b6d4';
        const circle = L.circle([m.lat, m.lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 1,
          dashArray: '2, 3',
        });
        circle.bindTooltip(
          `<div class="text-[11px] font-mono">${m.title}<br/><span class="text-amber-300">[Approx. estimated ${radius}m radius]</span></div>`
        );
        coverageGroup.addLayer(circle);
      }

      // Marker Icon HTML
      const iconColors = {
        camera: 'bg-sky-500 text-white',
        sensor: 'bg-emerald-500 text-white',
        spray: 'bg-cyan-500 text-white',
      };

      const customIcon = L.divIcon({
        className: 'custom-map-marker-container',
        html: `
          <div class="custom-map-marker w-7 h-7 ${iconColors[m.type]} shadow-lg flex items-center justify-center border-2 border-slate-900 cursor-pointer">
            <span style="font-size: 13px; font-weight: bold;">
              ${m.type === 'camera' ? '📷' : m.type === 'sensor' ? '📡' : '💧'}
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon });

      marker.on('click', () => {
        setActiveMarkerInfo(m);
      });

      marker.bindPopup(`
        <div class="p-2 text-slate-100 font-sans">
          <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider">${m.type.toUpperCase()} NODE</div>
          <div class="text-sm font-semibold mt-0.5 text-white">${m.title}</div>
          <div class="text-[11px] text-slate-300 mt-1 font-mono">Lat: ${m.lat.toFixed(5)}, Lng: ${m.lng.toFixed(5)}</div>
          <div class="text-[11px] text-amber-300/90 mt-1 font-mono">Coverage: Visual estimate only</div>
        </div>
      `);

      markersGroup.addLayer(marker);
    });
  }, [markers]);

  // Preset location jumper
  const jumpToLocation = (lat: number, lng: number, zoom = 15) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  // Browser Geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeolocating(false);
        const { latitude, longitude } = pos.coords;
        jumpToLocation(latitude, longitude, 16);
      },
      (err) => {
        setGeolocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access was denied. You can manually enter farm coordinates.');
        } else {
          setGeoError('Could not determine your location. Please select an agricultural preset.');
        }
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Layer Selector & Coordinates */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedLayer('street')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedLayer === 'street'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Street Map</span>
            </button>
            <button
              onClick={() => setSelectedLayer('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedLayer === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Satellite Imagery</span>
            </button>
          </div>

          <button
            onClick={handleGeolocation}
            disabled={geolocating}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
            title="Locate via device GPS"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{geolocating ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>

        {/* Location Presets & Coordinate Display */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            Presets:
          </span>
          <button
            onClick={() => jumpToLocation(41.9820, -93.6515, 15)}
            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 font-medium"
          >
            Iowa Farm (Default)
          </button>
          <button
            onClick={() => jumpToLocation(38.5382, -121.7617, 15)}
            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 font-medium"
          >
            California Orchard
          </button>
          <button
            onClick={() => jumpToLocation(44.8378, -0.5792, 15)}
            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 font-medium"
          >
            Bordeaux Vineyard
          </button>
        </div>

        {/* Node Deployment Tool */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-mono">Deploy Node:</span>
          <button
            onClick={() => setAddMode(addMode === 'camera' ? null : 'camera')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              addMode === 'camera'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📷 Camera
          </button>
          <button
            onClick={() => setAddMode(addMode === 'sensor' ? null : 'sensor')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              addMode === 'sensor'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📡 Sensor
          </button>
          <button
            onClick={() => setAddMode(addMode === 'spray' ? null : 'spray')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              addMode === 'spray'
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            💧 Water Spray
          </button>
        </div>
      </div>

      {/* Geolocation or Add Mode Banner */}
      {addMode && (
        <div className="bg-sky-950/80 border border-sky-500/50 rounded-lg p-2.5 text-xs text-sky-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400 animate-spin" />
            <span>Click anywhere on the map to place a new <strong>{addMode.toUpperCase()}</strong> node in {selectedZone?.name}.</span>
          </span>
          <button
            onClick={() => setAddMode(null)}
            className="text-sky-300 hover:text-white underline font-mono ml-4"
          >
            Cancel
          </button>
        </div>
      )}

      {geoError && (
        <div className="bg-amber-950/80 border border-amber-500/50 rounded-lg p-2.5 text-xs text-amber-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{geoError}</span>
          </span>
          <button onClick={() => setGeoError(null)} className="text-amber-300 hover:text-white underline font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Map Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Viewport */}
        <div className="lg:col-span-3 h-[600px] rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Interactive Legend Box Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs text-slate-200 shadow-xl max-w-xs pointer-events-auto">
            <div className="font-semibold text-white mb-2 flex items-center justify-between">
              <span>Perimeter Legend</span>
              <span className="text-[10px] text-slate-400 font-mono">LEAFLET GIS</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                <span>ESP32 Camera Node (Visual Coverage)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Ultrasonic Distance Sensor (HC-SR04)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
                <span>Harmless Water Mist Nozzle (Solenoid)</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-slate-400">
                <span className="w-4 border-b-2 border-dashed border-emerald-400 inline-block" />
                <span>Perimeter Boundary (Click zone to inspect)</span>
              </div>
            </div>
          </div>

          {/* Layer Disclaimer Tag */}
          <div className="absolute top-4 right-4 z-[400] bg-slate-900/85 backdrop-blur border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-300">
            {selectedLayer === 'satellite'
              ? '🛰️ Esri High-Res World Imagery'
              : '🗺️ OpenStreetMap Standard Tiles'}
          </div>
        </div>

        {/* Zone & Marker Details Sidebar */}
        <div className="space-y-4">
          {/* Selected Zone Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Zone Inspector
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded uppercase"
                style={{
                  backgroundColor: `${selectedZone?.color || '#10b981'}25`,
                  color: selectedZone?.color || '#10b981',
                }}
              >
                {selectedZone?.threatLevel} Risk
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {selectedZone?.name}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {selectedZone?.description}
            </p>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Crop Under Protection:</span>
                <span className="text-slate-100 font-medium">{selectedZone?.cropType}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Boundary Perimeter:</span>
                <span className="text-slate-100 font-mono tabular-nums">{selectedZone?.perimeterLengthMeters} meters</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active IoT Nodes:</span>
                <span className="text-emerald-400 font-mono tabular-nums">
                  {markers.filter((m) => m.zoneId === selectedZone?.id).length} units
                </span>
              </div>
            </div>

            {/* Quick Actions for Selected Zone */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => triggerDemoDetection('wild_boar', selectedZone?.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                <span>Simulate Detection in {selectedZone?.id === 'zone-b' ? 'Zone B' : 'Zone A'}</span>
              </button>
              <button
                onClick={() => triggerWaterSpray(4, selectedZone?.id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 rounded-lg transition-colors"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Test Mist Deterrent in Zone</span>
              </button>
            </div>
          </div>

          {/* Zones Switcher Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Farm Sectors
            </h4>
            <div className="space-y-2">
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => {
                    setSelectedZone(z);
                    jumpToLocation(z.coordinates[0][0], z.coordinates[0][1], 16);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    selectedZone?.id === z.id
                      ? 'bg-slate-800 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: z.color }}
                      />
                      <span>{z.name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {z.perimeterLengthMeters}m
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 pl-4.5">
                    {z.cropType}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Marker Details Panel (if clicked) */}
          {activeMarkerInfo && (
            <div className="bg-slate-900 border border-sky-500/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Marker Details
                </span>
                <button
                  onClick={() => removeMapMarker(activeMarkerInfo.id)}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950/40"
                  title="Remove this marker"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {activeMarkerInfo.title}
              </div>
              <div className="text-xs text-slate-400 font-mono space-y-1">
                <div>Type: {activeMarkerInfo.type.toUpperCase()}</div>
                <div>Lat: {activeMarkerInfo.lat.toFixed(5)}</div>
                <div>Lng: {activeMarkerInfo.lng.toFixed(5)}</div>
                <div className="text-amber-300/80 text-[10px] mt-2">
                  * Visual coverage cone indicates approximate camera angle and distance estimate.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
