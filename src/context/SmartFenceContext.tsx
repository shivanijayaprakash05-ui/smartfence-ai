import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  AnimalClass,
  DeviceNode,
  FarmZone,
  FenceEvent,
  MapMarkerItem,
  SystemSettings,
} from '../types';
import {
  BOAR_IMAGE_URL,
  DEER_IMAGE_URL,
  INITIAL_DEVICES,
  INITIAL_EVENTS,
  INITIAL_MARKERS,
  INITIAL_SETTINGS,
  INITIAL_ZONES,
} from '../data/sampleData';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  smsPreview: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  timestamp: string;
}

interface SmartFenceContextType {
  events: FenceEvent[];
  devices: DeviceNode[];
  zones: FarmZone[];
  markers: MapMarkerItem[];
  settings: SystemSettings;
  waterPumpActive: boolean;
  waterPumpRemaining: number;
  currentUltrasonicDistance: number;
  isSimulatingDetection: boolean;
  activeToast: ToastAlert | null;
  hardwareSerialConnected: boolean;
  lastDetectionImage: string | null;
  activeDetectionBox: FenceEvent['boundingBox'] | null;
  // Actions
  triggerDemoDetection: (animalClass?: 'wild_boar' | 'deer' | 'stray_canine', targetZoneId?: string) => Promise<FenceEvent>;
  triggerUltrasonicProximity: (distanceCm?: number, zoneId?: string) => void;
  triggerWaterSpray: (durationSec?: number, zoneId?: string) => void;
  stopWaterSpray: () => void;
  clearEvents: () => void;
  resetToDefaultData: () => void;
  exportEventsCSV: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  connectWebSerial: () => Promise<boolean>;
  disconnectWebSerial: () => void;
  dismissToast: () => void;
  addMapMarker: (marker: Omit<MapMarkerItem, 'id'>) => void;
  removeMapMarker: (id: string) => void;
}

const SmartFenceContext = createContext<SmartFenceContextType | null>(null);

const STORAGE_KEYS = {
  EVENTS: 'smartfence_events_v1',
  SETTINGS: 'smartfence_settings_v1',
  MARKERS: 'smartfence_markers_v1',
  ZONES: 'smartfence_zones_v1',
};

export const SmartFenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage hydrated states
  const [events, setEvents] = useState<FenceEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return stored ? JSON.parse(stored) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...INITIAL_SETTINGS, ...JSON.parse(stored) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [markers, setMarkers] = useState<MapMarkerItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MARKERS);
      return stored ? JSON.parse(stored) : INITIAL_MARKERS;
    } catch {
      return INITIAL_MARKERS;
    }
  });

  const [zones] = useState<FarmZone[]>(INITIAL_ZONES);
  const [devices, setDevices] = useState<DeviceNode[]>(INITIAL_DEVICES);

  // Real-time runtime states
  const [waterPumpActive, setWaterPumpActive] = useState<boolean>(false);
  const [waterPumpRemaining, setWaterPumpRemaining] = useState<number>(0);
  const [currentUltrasonicDistance, setCurrentUltrasonicDistance] = useState<number>(245);
  const [isSimulatingDetection, setIsSimulatingDetection] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastAlert | null>(null);
  const [hardwareSerialConnected, setHardwareSerialConnected] = useState<boolean>(false);
  const [lastDetectionImage, setLastDetectionImage] = useState<string | null>(BOAR_IMAGE_URL);
  const [activeDetectionBox, setActiveDetectionBox] = useState<FenceEvent['boundingBox'] | null>({
    x: 32,
    y: 40,
    width: 44,
    height: 48,
    label: 'wild_boar',
    confidence: 0.92,
  });

  const sprayTimerRef = useRef<number | null>(null);
  const lastAlertTimestampRef = useRef<number>(0);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save events to local storage', e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to local storage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MARKERS, JSON.stringify(markers));
    } catch (e) {
      console.warn('Failed to save markers to local storage', e);
    }
  }, [markers]);

  // Subtle ambient distance jitter simulation for realism (when idle)
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!isSimulatingDetection) {
        setCurrentUltrasonicDistance((prev) => {
          // Keep between 230 and 260 cm normally (clear crop perimeter)
          const delta = (Math.random() - 0.5) * 4;
          const next = Math.round(prev + delta);
          return Math.max(210, Math.min(270, next));
        });
      }
    }, 3000);
    return () => window.clearInterval(interval);
  }, [isSimulatingDetection]);

  // Water pump countdown timer
  useEffect(() => {
    if (waterPumpActive && waterPumpRemaining > 0) {
      sprayTimerRef.current = window.setTimeout(() => {
        setWaterPumpRemaining((prev) => {
          if (prev <= 1) {
            setWaterPumpActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (waterPumpRemaining <= 0 && waterPumpActive) {
      setWaterPumpActive(false);
    }

    return () => {
      if (sprayTimerRef.current) {
        clearTimeout(sprayTimerRef.current);
      }
    };
  }, [waterPumpActive, waterPumpRemaining]);

  // Stop spray helper
  const stopWaterSpray = useCallback(() => {
    if (sprayTimerRef.current) clearTimeout(sprayTimerRef.current);
    setWaterPumpActive(false);
    setWaterPumpRemaining(0);
  }, []);

  // Trigger water spray
  const triggerWaterSpray = useCallback((durationSec?: number, _zoneId?: string) => {
    const dur = durationSec || settings.sprayDurationSeconds;
    setWaterPumpActive(true);
    setWaterPumpRemaining(dur);

    // Update actuator device status
    setDevices((prev) =>
      prev.map((d) =>
        d.type === 'water_spray_relay'
          ? { ...d, status: 'online', lastPing: 'Pumping harmless mist now' }
          : d
      )
    );
  }, [settings.sprayDurationSeconds]);

  // Full demo animal detection pipeline
  const triggerDemoDetection = useCallback(
    async (
      animalClass: 'wild_boar' | 'deer' | 'stray_canine' = 'wild_boar',
      targetZoneId: string = 'zone-a'
    ): Promise<FenceEvent> => {
      setIsSimulatingDetection(true);

      const zone = zones.find((z) => z.id === targetZoneId) || zones[0];
      const selectedImage = animalClass === 'deer' ? DEER_IMAGE_URL : BOAR_IMAGE_URL;
      const detectedConfidence = animalClass === 'wild_boar' ? 0.93 : 0.89;
      const simulatedDistance = animalClass === 'wild_boar' ? 64 : 85;

      setLastDetectionImage(selectedImage);
      setCurrentUltrasonicDistance(simulatedDistance);

      const boundingBox: FenceEvent['boundingBox'] =
        animalClass === 'deer'
          ? { x: 25, y: 48, width: 32, height: 42, label: 'deer', confidence: detectedConfidence }
          : { x: 32, y: 40, width: 44, height: 48, label: 'wild_boar', confidence: detectedConfidence };

      setActiveDetectionBox(boundingBox);

      // Check cooldown
      const now = Date.now();
      const cooldownMs = settings.alertCooldownSeconds * 1000;
      const inCooldown = now - lastAlertTimestampRef.current < cooldownMs;

      // Safe water deterrent trigger
      let sprayFired = false;
      if (settings.autoSprayEnabled) {
        triggerWaterSpray(settings.sprayDurationSeconds, zone.id);
        sprayFired = true;
      }

      const animalLabel = animalClass === 'wild_boar' ? 'Wild Boar' : animalClass === 'deer' ? 'Deer' : 'Wildlife';
      const eventId = `evt-${Date.now().toString().slice(-6)}`;

      const newEvent: FenceEvent = {
        id: eventId,
        timestamp: new Date().toISOString(),
        type: 'yolo_detection',
        animalClass,
        confidence: detectedConfidence,
        zoneId: zone.id,
        zoneName: zone.name,
        distanceCm: simulatedDistance,
        sprayTriggered: sprayFired,
        sprayDurationSec: sprayFired ? settings.sprayDurationSeconds : 0,
        notificationStatus: inCooldown ? 'SUPPRESSED_COOLDOWN' : 'SIMULATED_DISPATCHED',
        isDemo: true,
        imageUrl: selectedImage,
        boundingBox,
        notes: `Simulated edge camera frame parsed by YOLO model (${Math.round(
          detectedConfidence * 100
        )}% confidence). Ultrasonic sensor corroborated proximity at ${simulatedDistance}cm. ${
          sprayFired
            ? `Harmless low-pressure water mist pulse activated for ${settings.sprayDurationSeconds}s.`
            : 'Water spray disabled in settings.'
        }`,
      };

      if (!inCooldown) {
        lastAlertTimestampRef.current = now;
      }

      setEvents((prev) => [newEvent, ...prev]);
      setIsSimulatingDetection(false);

      // Show toast alert with realistic SMS preview
      const smsMessage = `[SmartFence AI] ALERT: ${animalLabel} detected at ${zone.name}. Sensor distance: ${simulatedDistance}cm. ${
        sprayFired ? `Harmless water spray pulse activated for ${settings.sprayDurationSeconds}s.` : 'Spray: OFF.'
      } Time: ${new Date().toLocaleTimeString()}`;

      setActiveToast({
        id: eventId,
        title: `Simulated Wildlife Detection: ${animalLabel}`,
        message: `${zone.name} · Distance: ${simulatedDistance}cm · Confidence: ${Math.round(detectedConfidence * 100)}%`,
        smsPreview: smsMessage,
        type: inCooldown ? 'info' : 'alert',
        timestamp: new Date().toLocaleTimeString(),
      });

      return newEvent;
    },
    [zones, settings, triggerWaterSpray]
  );

  // Trigger ultrasonic proximity
  const triggerUltrasonicProximity = useCallback(
    (distanceCm: number = 48, zoneId: string = 'zone-a') => {
      const zone = zones.find((z) => z.id === zoneId) || zones[0];
      setCurrentUltrasonicDistance(distanceCm);

      const eventId = `evt-sonar-${Date.now().toString().slice(-5)}`;
      const newEvent: FenceEvent = {
        id: eventId,
        timestamp: new Date().toISOString(),
        type: 'ultrasonic_proximity',
        animalClass: 'unknown',
        confidence: 0.0,
        zoneId: zone.id,
        zoneName: zone.name,
        distanceCm,
        sprayTriggered: false,
        notificationStatus: 'SIMULATED_DISPATCHED',
        isDemo: true,
        notes: `Simulated ultrasonic reading tripped at ${distanceCm}cm (< ${settings.ultrasonicThresholdCm}cm threshold). Ultrasonic sensor measures physical distance only and does not identify species.`,
      };

      setEvents((prev) => [newEvent, ...prev]);

      setActiveToast({
        id: eventId,
        title: 'Ultrasonic Perimeter Tripped',
        message: `${zone.name} · Proximity at ${distanceCm}cm (Threshold: ${settings.ultrasonicThresholdCm}cm)`,
        smsPreview: `[SmartFence AI] Proximity sensor tripped at ${distanceCm}cm in ${zone.name}. Camera verification recommended.`,
        type: 'warning',
        timestamp: new Date().toLocaleTimeString(),
      });
    },
    [zones, settings.ultrasonicThresholdCm]
  );

  // Dismiss toast
  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Reset demo data
  const resetToDefaultData = useCallback(() => {
    setEvents(INITIAL_EVENTS);
    setSettings(INITIAL_SETTINGS);
    setMarkers(INITIAL_MARKERS);
    setDevices(INITIAL_DEVICES);
  }, []);

  // Export CSV
  const exportEventsCSV = useCallback(() => {
    if (events.length === 0) return;
    const headers = [
      'Event ID',
      'Timestamp',
      'Event Type',
      'Animal Class',
      'Confidence %',
      'Zone',
      'Distance (cm)',
      'Water Spray Triggered',
      'Spray Duration (s)',
      'Notification Status',
      'Simulated/Real',
      'Notes',
    ];
    const rows = events.map((e) => [
      e.id,
      e.timestamp,
      e.type,
      e.animalClass,
      Math.round(e.confidence * 100),
      `"${e.zoneName}"`,
      e.distanceCm ?? 'N/A',
      e.sprayTriggered ? 'Yes' : 'No',
      e.sprayDurationSec ?? 0,
      e.notificationStatus,
      e.isDemo ? 'SIMULATED_DEMO' : 'HARDWARE_REAL',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smartfence-events-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [events]);

  // Connect Web Serial (with proper permission handling and graceful demo fallback)
  const connectWebSerial = useCallback(async (): Promise<boolean> => {
    if (!('serial' in navigator)) {
      setActiveToast({
        id: 'serial-unsupported',
        title: 'Web Serial Not Supported in This Browser',
        message: 'Chrome or Edge desktop is required for real USB Web Serial. Simulation mode will continue safely.',
        smsPreview: 'Simulation mode active. No physical COM port detected.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
      return false;
    }

    try {
      // Prompt user to select port
      // @ts-expect-error Web Serial API types
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setHardwareSerialConnected(true);
      setActiveToast({
        id: 'serial-connected',
        title: 'Hardware Serial Connected',
        message: 'ESP32 COM port open at 115200 baud. Receiving real sensor telemetry stream.',
        smsPreview: 'Real hardware UART bridge initialized.',
        type: 'success',
        timestamp: new Date().toLocaleTimeString(),
      });
      return true;
    } catch (err: unknown) {
      console.warn('Web Serial connection canceled or denied:', err);
      setActiveToast({
        id: 'serial-canceled',
        title: 'Serial Port Not Connected',
        message: 'No hardware port selected. Continuing in simulated sensor environment.',
        smsPreview: 'Simulation mode active.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString(),
      });
      return false;
    }
  }, []);

  const disconnectWebSerial = useCallback(() => {
    setHardwareSerialConnected(false);
  }, []);

  const addMapMarker = useCallback((marker: Omit<MapMarkerItem, 'id'>) => {
    const id = `marker-${Date.now().toString().slice(-6)}`;
    setMarkers((prev) => [...prev, { ...marker, id }]);
  }, []);

  const removeMapMarker = useCallback((id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <SmartFenceContext.Provider
      value={{
        events,
        devices,
        zones,
        markers,
        settings,
        waterPumpActive,
        waterPumpRemaining,
        currentUltrasonicDistance,
        isSimulatingDetection,
        activeToast,
        hardwareSerialConnected,
        lastDetectionImage,
        activeDetectionBox,
        triggerDemoDetection,
        triggerUltrasonicProximity,
        triggerWaterSpray,
        stopWaterSpray,
        clearEvents,
        resetToDefaultData,
        exportEventsCSV,
        updateSettings,
        connectWebSerial,
        disconnectWebSerial,
        dismissToast,
        addMapMarker,
        removeMapMarker,
      }}
    >
      {children}
    </SmartFenceContext.Provider>
  );
};

export const useSmartFence = () => {
  const ctx = useContext(SmartFenceContext);
  if (!ctx) {
    throw new Error('useSmartFence must be used within a SmartFenceProvider');
  }
  return ctx;
};
