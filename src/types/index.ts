/**
 * SmartFence AI — Types & Interfaces
 */

export type AnimalClass = 'wild_boar' | 'deer' | 'stray_canine' | 'rodent' | 'unknown' | 'none';

export type EventType = 'yolo_detection' | 'ultrasonic_proximity' | 'water_spray' | 'manual_action';

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  confidence: number;
}

export interface FenceEvent {
  id: string;
  timestamp: string; // ISO string
  type: EventType;
  animalClass: AnimalClass;
  confidence: number; // 0 to 1
  zoneId: string;
  zoneName: string;
  distanceCm?: number;
  sprayTriggered: boolean;
  sprayDurationSec?: number;
  notificationStatus: 'SIMULATED_DISPATCHED' | 'QUEUED' | 'REAL_DISPATCHED' | 'SUPPRESSED_COOLDOWN';
  isDemo: boolean;
  boundingBox?: BoundingBox;
  imageUrl?: string;
  notes?: string;
}

export interface DeviceNode {
  id: string;
  name: string;
  type: 'esp32_cam' | 'ultrasonic_sensor' | 'water_spray_relay' | 'solar_gateway';
  status: 'online' | 'standby' | 'simulated' | 'disconnected';
  zoneId: string;
  zoneName: string;
  batteryPct: number;
  signalRssi: number; // dBm e.g. -62
  lastPing: string;
  ipAddress?: string;
  port?: string;
  hardwareSpecs: string;
}

export interface FarmZone {
  id: string;
  name: string;
  description: string;
  cropType: string;
  color: string;
  coordinates: [number, number][]; // [lat, lng]
  perimeterLengthMeters: number;
  threatLevel: 'low' | 'moderate' | 'high';
  activeDevicesCount: number;
}

export interface SystemSettings {
  farmName: string;
  ownerName: string;
  phoneRecipientMasked: string;
  yoloConfidenceThreshold: number; // e.g. 0.65 (65%)
  ultrasonicThresholdCm: number; // e.g. 150 cm
  alertCooldownSeconds: number; // e.g. 30 seconds
  autoSprayEnabled: boolean;
  sprayDurationSeconds: number; // e.g. 4 seconds
  simulationMode: boolean; // default true
  mapCenter: [number, number]; // [lat, lng]
  mapZoom: number;
  mapTileLayer: 'openstreetmap' | 'satellite_configured' | 'satellite_fallback';
  satelliteApiKey?: string;
  smsWebhookUrl?: string;
}

export interface MapMarkerItem {
  id: string;
  type: 'camera' | 'sensor' | 'spray';
  title: string;
  zoneId: string;
  lat: number;
  lng: number;
  coverageHeadingDeg?: number; // 0-360
  coverageAngleDeg?: number; // e.g. 75 degrees
  coverageRangeMeters?: number; // e.g. 30 meters
}
