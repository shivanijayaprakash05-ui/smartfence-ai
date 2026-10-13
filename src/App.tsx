import React, { useState } from 'react';
import { SmartFenceProvider } from './context/SmartFenceContext';
import { Navbar } from './components/layout/Navbar';
import { ToastBanner } from './components/layout/ToastBanner';
import { OverviewView } from './components/overview/OverviewView';
import { LiveMonitoringView } from './components/monitoring/LiveMonitoringView';
import { FarmMapView } from './components/map/FarmMapView';
import { DevicesView } from './components/devices/DevicesView';
import { WaterSprayView } from './components/spray/WaterSprayView';
import { AlertsView } from './components/alerts/AlertsView';
import { SettingsView } from './components/settings/SettingsView';
import { ShieldCheck, Heart, Github } from 'lucide-react';

export function SmartFenceApp() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewView onNavigate={setActiveTab} />}
        {activeTab === 'monitoring' && <LiveMonitoringView />}
        {activeTab === 'map' && <FarmMapView />}
        {activeTab === 'devices' && <DevicesView />}
        {activeTab === 'spray' && <WaterSprayView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Interactive Alert & SMS Notification Banner */}
      <ToastBanner />

      {/* Quiet, Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">SmartFence AI</span>
            <span>·</span>
            <span>Protect Crops, Save Wildlife</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono text-[11px]">College Hackathon Agri-IoT System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Harmless low-pressure water deterrent only (zero shock/injury)</span>
            <span>·</span>
            <span className="font-mono text-amber-300/80">[SIMULATION / PROTOTYPE DEMO]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SmartFenceProvider>
      <SmartFenceApp />
    </SmartFenceProvider>
  );
}
