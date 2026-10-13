import React, { useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  Download,
  Trash2,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Droplets,
  Activity,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';
import { AnimalClass, EventType, FenceEvent } from '../../types';

export const AlertsView: React.FC = () => {
  const {
    events,
    clearEvents,
    resetToDefaultData,
    exportEventsCSV,
    settings,
    zones,
  } = useSmartFence();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<FenceEvent | null>(events[0] || null);

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.animalClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZone = selectedZoneFilter === 'all' || e.zoneId === selectedZoneFilter;
    const matchesAnimal =
      selectedAnimalFilter === 'all' || e.animalClass === selectedAnimalFilter;
    const matchesType = selectedTypeFilter === 'all' || e.type === selectedTypeFilter;

    return matchesSearch && matchesZone && matchesAnimal && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Alerts & Telemetry Event History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of animal detections, sensor proximity trips, automated spray actions, and SMS dispatch receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportEventsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={resetToDefaultData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Restore default sample records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Samples</span>
          </button>
          <button
            onClick={clearEvents}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 rounded-lg border border-rose-800/60 transition-colors"
            title="Wipe event log"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by ID, animal, zone, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Filter */}
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-sans"
          >
            <option value="all">All Farm Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Animal Filter */}
          <select
            value={selectedAnimalFilter}
            onChange={(e) => setSelectedAnimalFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-sans"
          >
            <option value="all">All Wildlife Classes</option>
            <option value="wild_boar">Wild Boar</option>
            <option value="deer">Deer</option>
            <option value="stray_canine">Stray Canine</option>
            <option value="unknown">Unknown / Sensor</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-sans"
          >
            <option value="all">All Event Types</option>
            <option value="yolo_detection">YOLO Vision Detection</option>
            <option value="ultrasonic_proximity">Ultrasonic Proximity</option>
            <option value="water_spray">Water Spray Deterrent</option>
          </select>
        </div>
      </div>

      {/* Main Events Table & Detail Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Viewport */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Target Species</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Spray</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                      No matching events found. Adjust filters or trigger a demo detection.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => {
                    const isSelected = selectedEvent?.id === evt.id;
                    const isBoar = evt.animalClass === 'wild_boar';
                    const isDeer = evt.animalClass === 'deer';

                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/40 text-white'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-emerald-400">
                          {evt.id}
                        </td>
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(evt.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 font-sans font-medium ${
                            isBoar ? 'text-rose-400' : isDeer ? 'text-amber-300' : 'text-slate-300'
                          }`}>
                            {isBoar ? '🐗 Wild Boar' : isDeer ? '🦌 Deer' : evt.animalClass.replace('_', ' ')}
                            {evt.confidence > 0 && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({Math.round(evt.confidence * 100)}%)
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-sans whitespace-nowrap">
                          {evt.zoneName.split('·')[0]}
                        </td>
                        <td className="py-3 px-3 tabular-nums text-slate-300">
                          {evt.distanceCm !== undefined ? `${evt.distanceCm} cm` : '—'}
                        </td>
                        <td className="py-3 px-3">
                          {evt.sprayTriggered ? (
                            <span className="text-cyan-400 font-sans font-semibold">
                              💧 {evt.sprayDurationSec}s mist
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {evt.notificationStatus === 'SIMULATED_DISPATCHED' ? 'SIMULATED' : evt.notificationStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Event Details & SMS Simulator Drawer */}
        <div>
          {selectedEvent ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  EVENT PAYLOAD INSPECTOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {selectedEvent.id}
                </span>
              </div>

              {/* Snapshot image preview if available */}
              {selectedEvent.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-slate-950">
                  <img
                    src={selectedEvent.imageUrl}
                    alt="Detection Camera Snapshot"
                    className="w-full h-full object-cover"
                  />
                  {selectedEvent.boundingBox && (
                    <div
                      className="absolute border-2 border-rose-500 rounded-sm pointer-events-none"
                      style={{
                        left: `${selectedEvent.boundingBox.x}%`,
                        top: `${selectedEvent.boundingBox.y}%`,
                        width: `${selectedEvent.boundingBox.width}%`,
                        height: `${selectedEvent.boundingBox.height}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 bg-rose-500 text-slate-950 text-[9px] font-mono font-bold px-1 rounded-t uppercase">
                        {selectedEvent.animalClass} {Math.round(selectedEvent.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Event Attributes */}
              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-100 font-mono">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Zone:</span>
                  <span className="text-slate-100 font-medium">{selectedEvent.zoneName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Species Classification:</span>
                  <span className="text-emerald-400 font-bold capitalize">
                    {selectedEvent.animalClass.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>YOLO Model Confidence:</span>
                  <span className="text-slate-100 font-mono">
                    {selectedEvent.confidence > 0 ? `${Math.round(selectedEvent.confidence * 100)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ultrasonic Proximity:</span>
                  <span className="text-slate-100 font-mono">
                    {selectedEvent.distanceCm ? `${selectedEvent.distanceCm} cm` : 'Not tripped'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Water Spray Deterrent:</span>
                  <span className="text-cyan-400 font-mono">
                    {selectedEvent.sprayTriggered
                      ? `Active (${selectedEvent.sprayDurationSec}s mist pulse)`
                      : 'None'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedEvent.notes && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-slate-500 block text-[10px] font-mono mb-1">NOTES & AUDIT:</span>
                  {selectedEvent.notes}
                </div>
              )}

              {/* Simulated SMS Preview Card (Satisfying requirement for realistic alert dispatch) */}
              <div className="border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 font-mono">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Simulated Cellular SMS Alert</span>
                  </span>
                  <span className="text-slate-500">To {settings.phoneRecipientMasked}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 leading-relaxed select-all">
                  [SmartFence AI Alert] {selectedEvent.animalClass.toUpperCase()} detected at {selectedEvent.zoneName}. Sensor distance: {selectedEvent.distanceCm || 65}cm. {selectedEvent.sprayTriggered ? `Harmless water spray pulse activated for ${selectedEvent.sprayDurationSec}s.` : 'Spray: OFF.'} Time: {new Date(selectedEvent.timestamp).toLocaleTimeString()}
                </div>

                <div className="mt-2 text-[10px] text-slate-500 font-sans leading-tight">
                  * Note: In production, SMS requires a Twilio/Vonage account or GSM SIM800L module with active cellular coverage. Web dashboard access requires internet connectivity.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              Select an event row on the left to inspect telemetry payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
