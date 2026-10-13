import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Video,
  Eye,
  Crosshair,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  Sliders,
  Code,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';
import { BOAR_IMAGE_URL, DEER_IMAGE_URL } from '../../data/sampleData';
import { BoundingBox } from '../../types';

export const LiveMonitoringView: React.FC = () => {
  const {
    triggerDemoDetection,
    isSimulatingDetection,
    settings,
    updateSettings,
    waterPumpActive,
    waterPumpRemaining,
    currentUltrasonicDistance,
  } = useSmartFence();

  const [activeSource, setActiveSource] = useState<'sample_boar' | 'sample_deer' | 'upload' | 'webcam'>('sample_boar');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [nightVisionMode, setNightVisionMode] = useState<boolean>(false);
  const [showArchDocs, setShowArchDocs] = useState<boolean>(false);

  // Active detections on current frame
  const [detections, setDetections] = useState<BoundingBox[]>([
    {
      x: 32,
      y: 40,
      width: 44,
      height: 48,
      label: 'wild_boar',
      confidence: 0.92,
    },
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle source switching
  useEffect(() => {
    if (activeSource === 'sample_boar') {
      setDetections([
        {
          x: 32,
          y: 40,
          width: 44,
          height: 48,
          label: 'wild_boar',
          confidence: 0.93,
        },
      ]);
    } else if (activeSource === 'sample_deer') {
      setDetections([
        {
          x: 25,
          y: 48,
          width: 32,
          height: 42,
          label: 'deer',
          confidence: 0.88,
        },
      ]);
    } else {
      setDetections([]);
    }
  }, [activeSource]);

  // Webcam activation and cleanup
  const toggleWebcam = async () => {
    if (webcamActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setWebcamActive(false);
      setActiveSource('sample_boar');
      return;
    }

    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setWebcamActive(true);
      setActiveSource('webcam');
    } catch (err: unknown) {
      console.warn('Webcam permission denied or unavailable:', err);
      setWebcamError('Camera access was not granted or no webcam was found. Switching to sample camera stream.');
      setWebcamActive(false);
      setActiveSource('sample_boar');
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageUrl(event.target.result as string);
          setActiveSource('upload');
          // Perform initial simulation detection
          setDetections([
            {
              x: 20,
              y: 25,
              width: 55,
              height: 50,
              label: 'wildlife_candidate',
              confidence: 0.86,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run detection action
  const handleRunDetection = async () => {
    if (activeSource === 'sample_boar') {
      await triggerDemoDetection('wild_boar', 'zone-a');
    } else if (activeSource === 'sample_deer') {
      await triggerDemoDetection('deer', 'zone-b');
    } else {
      await triggerDemoDetection('wild_boar', 'zone-a');
    }
  };

  // Filter detections by threshold
  const visibleDetections = detections.filter(
    (d) => d.confidence >= settings.yoloConfidenceThreshold
  );

  return (
    <div className="space-y-6">
      {/* Top Banner and Source Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Camera Vision & YOLO Wildlife Detection Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time edge frame analysis with bounding box estimation and species classification.
          </p>
        </div>

        {/* Source Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSource('sample_boar')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeSource === 'sample_boar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🐗 Boar Cam (Dusk)
          </button>
          <button
            onClick={() => setActiveSource('sample_deer')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeSource === 'sample_deer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🦌 Deer Cam (Morning)
          </button>
          <label className={`px-3 py-1.5 text-xs font-medium rounded cursor-pointer transition-colors ${
            activeSource === 'upload'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Upload Photo</span>
            </span>
          </label>
          <button
            onClick={toggleWebcam}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
              webcamActive
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>{webcamActive ? 'Stop Webcam' : 'Use Webcam'}</span>
          </button>
        </div>
      </div>

      {webcamError && (
        <div className="bg-amber-950/80 border border-amber-500/50 rounded-lg p-3 text-xs text-amber-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{webcamError}</span>
          </span>
          <button onClick={() => setWebcamError(null)} className="text-amber-300 underline font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Vision Display & Side Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Viewport Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl aspect-video select-none group">
            {/* Video or Image View */}
            {activeSource === 'webcam' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  nightVisionMode ? 'filter grayscale contrast-150 brightness-90 hue-rotate-90' : ''
                }`}
              />
            ) : (
              <img
                src={
                  activeSource === 'upload' && uploadedImageUrl
                    ? uploadedImageUrl
                    : activeSource === 'sample_deer'
                    ? DEER_IMAGE_URL
                    : BOAR_IMAGE_URL
                }
                alt="Agricultural Perimeter Camera Feed"
                className={`w-full h-full object-cover transition-all ${
                  nightVisionMode ? 'filter grayscale contrast-150 brightness-90 hue-rotate-90' : ''
                }`}
              />
            )}

            {/* Bounding Box Annotations Overlay */}
            {visibleDetections.map((box, index) => {
              const isBoar = box.label.toLowerCase().includes('boar');
              const borderColor = isBoar ? 'border-rose-500' : 'border-amber-400';
              const bgColor = isBoar ? 'bg-rose-500' : 'bg-amber-400';

              return (
                <div
                  key={index}
                  className={`absolute border-2 ${borderColor} rounded-sm pointer-events-none transition-all duration-300 animate-in fade-in`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {/* Bounding Box Header Tag */}
                  <div
                    className={`absolute -top-6 left-0 ${bgColor} text-slate-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-t uppercase flex items-center gap-1 shadow`}
                  >
                    <span>{box.label.replace('_', ' ')}</span>
                    <span>{Math.round(box.confidence * 100)}%</span>
                  </div>

                  {/* Corner Targets */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white -mb-0.5 -mr-0.5" />
                </div>
              );
            })}

            {/* Camera OSD (On-Screen Display) Telemetry HUD */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700/60 text-[10px] font-mono text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>LIVE CAM-01 · 1920x1080 · 24 FPS</span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700/60 text-[10px] font-mono text-slate-300">
              {activeSource === 'sample_boar' ? 'ZONE A · NORTH CORN' : 'ZONE B · EAST ORCHARD'}
            </div>

            {/* Ultrasonic Proximity Sensor Gauge HUD */}
            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-200">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">Ultrasonic Distance:</span>
                <span className={`font-bold tabular-nums ${
                  currentUltrasonicDistance < settings.ultrasonicThresholdCm
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}>
                  {currentUltrasonicDistance} cm
                </span>
                <span className="text-slate-500 text-[10px]">
                  (Threshold: {settings.ultrasonicThresholdCm}cm)
                </span>
              </div>
            </div>

            {/* Harmless Mist Status HUD */}
            {waterPumpActive && (
              <div className="absolute bottom-3 right-3 bg-cyan-950/90 backdrop-blur border border-cyan-400 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-200 animate-pulse flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                <span>MIST ACTIVE: {waterPumpRemaining}s REMAINING</span>
              </div>
            )}
          </div>

          {/* Under-Camera Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunDetection}
                disabled={isSimulatingDetection}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulatingDetection ? 'Analyzing Frame...' : 'Run YOLO Detection (Demo)'}</span>
              </button>

              <button
                onClick={() => setNightVisionMode(!nightVisionMode)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  nightVisionMode
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>{nightVisionMode ? 'IR Night Filter: ON' : 'IR Night Filter: OFF'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono">
                {visibleDetections.length} Wildlife Target{visibleDetections.length !== 1 ? 's' : ''} Detected
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-[11px] text-amber-300/80">[SIMULATED INFERENCE]</span>
            </div>
          </div>
        </div>

        {/* Vision Configuration & Model Telemetry */}
        <div className="space-y-4">
          {/* Threshold Tuning Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>YOLO Detection Parameters</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-emerald-400 rounded">
                YOLOv8-Agri
              </span>
            </div>

            {/* Confidence Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Confidence Threshold:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {Math.round(settings.yoloConfidenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.95"
                step="0.05"
                value={settings.yoloConfidenceThreshold}
                onChange={(e) =>
                  updateSettings({ yoloConfidenceThreshold: parseFloat(e.target.value) })
                }
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Detections below {Math.round(settings.yoloConfidenceThreshold * 100)}% will be rejected to avoid false alarms from blowing vegetation.
              </p>
            </div>

            {/* Target Classes Supported */}
            <div className="border-t border-slate-800 pt-3">
              <div className="text-xs font-medium text-slate-300 mb-2">Supported Wildlife Classes:</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-200">🐗 Wild Boar (Sus scrofa)</span>
                  <span className="text-rose-400 font-mono text-[11px]">High Threat</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-200">🦌 Deer (Odocoileus)</span>
                  <span className="text-amber-400 font-mono text-[11px]">Medium Threat</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-200">🐕 Stray Canines / Coyotes</span>
                  <span className="text-sky-400 font-mono text-[11px]">Low Threat</span>
                </div>
              </div>
            </div>

            {/* Ethical Deterrence Callout */}
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200/90 leading-relaxed">
              <strong>Wildlife Safety Protocol:</strong> Detected wildlife will only trigger harmless ambient water spray pulses. Never harmful electric shocks, chemicals, or lethal measures.
            </div>
          </div>

          {/* Integration Architecture Accordion */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <button
              onClick={() => setShowArchDocs(!showArchDocs)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backend YOLO Architecture Adapter</span>
              </span>
              <span className="text-cyan-400 font-mono text-[11px]">
                {showArchDocs ? 'Hide [-]' : 'View Specs [+]'}
              </span>
            </button>

            {showArchDocs && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400 font-mono">
                <p className="text-slate-300">
                  Real YOLO deployment pipeline for production agri-installations:
                </p>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto">
                  {`// FastAPI Python Backend Endpoint
@app.post("/api/v1/detect")
async def detect_wildlife(file: UploadFile):
    image = Image.open(file.file)
    results = yolo_model(image, conf=0.65)
    # Filter for agricultural wildlife classes
    return results.pandas().xyxy[0].to_dict()`}
                </div>
                <p className="text-[10px] text-slate-400">
                  Standard COCO weights lack wild boar categories. The model should be fine-tuned on camera trap datasets (e.g., Snapshot Serengeti & WildlifeInsights).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
