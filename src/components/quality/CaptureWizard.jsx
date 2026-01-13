import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, X, Check, ArrowRight, Layout, Info, RotateCw,
    Target, Monitor, Video, ChevronRight, AlertCircle
} from 'lucide-react';

const glassSub = "rounded-[24px] border border-white/50 dark:border-slate-800/40 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 shadow-sm";

export default function CaptureWizard({ scanMode, dimensions, onCapture, onCancel, onSegmentUpdate, isAiEnabled = true, selectedDeviceId }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);

    const [segments, setSegments] = useState([null, null, null]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);

    // Calculate dynamic aspect ratio
    const getTargetRatio = useCallback(() => {
        if (!dimensions) return scanMode === 'SINGLE' ? 9 / 16 : 16 / 9;
        const { width, height } = dimensions;
        if (scanMode === 'SINGLE') {
            return width / height;
        } else {
            // Split height into 3 segments
            return width / (height / 3);
        }
    }, [scanMode, dimensions]);

    // Camera setup uses passed selectedDeviceId from parent
    useEffect(() => {
        if (selectedDeviceId) {
            startCamera();
        } else {
            // Fallback if no device selected (e.g. first load) - parent should handle this but to be safe
            startCamera();
        }
        return () => stopCamera();
    }, [scanMode, dimensions, selectedDeviceId]);



    const startCamera = async () => {
        try {
            stopCamera();
            setError(null);

            const targetRatio = getTargetRatio();

            const constraints = {
                video: {
                    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                    facingMode: selectedDeviceId ? undefined : 'environment', // Fallback to environment if no ID
                    aspectRatio: { ideal: targetRatio },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setStream(newStream);
            setIsReady(true);
        } catch (err) {
            console.error("Camera access failed:", err);
            if (err.name === 'NotAllowedError') {
                setError("Přístup k fotoaparátu byl odepřen.");
            } else if (err.name === 'NotFoundError') {
                setError("Nebyl nalezen žádný fotoaparát.");
            } else {
                setError("Chyba při spouštění kamery. Zkuste obnovit stránku.");
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        saveCapture(dataUrl);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            saveCapture(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const saveCapture = (dataUrl) => {
        if (scanMode === 'SINGLE') {
            setSegments([dataUrl, null, null]);
            setShowResult(true);
            performAiAnalysis(dataUrl);
        } else {
            const newSegments = [...segments];
            newSegments[activeIdx] = dataUrl;
            setSegments(newSegments);
            onSegmentUpdate && onSegmentUpdate(newSegments, activeIdx);

            if (activeIdx < 2) {
                setActiveIdx(activeIdx + 1);
            } else {
                setShowResult(true);
                performAiAnalysis(newSegments[0]); // Analyze based on first segment for mock
            }
        }
    };

    const performAiAnalysis = (image) => {
        if (!isAiEnabled) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
        }, 2000);
    };

    const confirmCapture = () => {
        onCapture && onCapture(scanMode === 'SINGLE' ? segments[0] : segments);
    };

    const reset = () => {
        setSegments([null, null, null]);
        setActiveIdx(0);
        setShowResult(false);
        startCamera();
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex-1 relative bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl border border-slate-800">
                {/* Premium Background Background Pattern/Image */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <img src="/qc-vison-bg.png" className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
                </div>
                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {error ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                                    <AlertCircle size={48} className="text-rose-500" />
                                    <p className="text-white font-black uppercase tracking-widest text-xs">{error}</p>
                                    <button onClick={startCamera} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Zkusit znovu</button>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-opacity duration-1000 ${isReady ? 'opacity-60' : 'opacity-0'}`}
                                    style={{ transform: 'scaleX(1)' }}
                                />
                            )}

                            <canvas ref={canvasRef} className="hidden" />

                            {/* Mask overlay adjusted based on mode and dimensions */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div
                                    className={`relative border-2 border-blue-500/40 rounded-2xl shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] transition-all duration-500 flex items-center justify-center
                                        ${scanMode === '3SEGMENTS' ? 'max-h-[90%] max-w-[90%]' : 'max-h-[80%] max-w-[80%]'}
                                    }`}
                                    style={{
                                        aspectRatio: getTargetRatio(),
                                        width: getTargetRatio() > 1 ? '90%' : 'auto',
                                        height: getTargetRatio() > 1 ? 'auto' : '90%'
                                    }}
                                >
                                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                                        {scanMode === 'SINGLE' ? 'Celé křídlo (Na výšku)' : `Segment ${activeIdx + 1}/3 (Na šířku)`}
                                    </div>

                                    {/* Segment Navigator (Door Silhouette) */}
                                    {scanMode === '3SEGMENTS' && (
                                        <div className="absolute -right-20 top-0 w-12 h-40 bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/20 p-2 flex flex-col gap-1 shadow-2xl overflow-hidden">
                                            {[
                                                { label: 'HOR' },
                                                { label: 'STŘ' },
                                                { label: 'SPOD' }
                                            ].map((seg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex-1 rounded-md border flex items-center justify-center transition-all duration-300 ${activeIdx === idx
                                                        ? 'bg-blue-500 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-105 z-10'
                                                        : 'bg-white/5 border-white/10 opacity-40'
                                                        }`}
                                                >
                                                    <span className={`text-[7px] font-black tracking-tighter ${activeIdx === idx ? 'text-white' : 'text-white/50'}`}>
                                                        {seg.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all shadow-xl"
                                >
                                    <Upload size={20} />
                                </button>

                                <button
                                    onClick={handleCapture}
                                    disabled={!isReady}
                                    className="w-20 h-20 rounded-full border-4 border-white/20 p-1 group transition-transform active:scale-90 disabled:opacity-50"
                                >
                                    <div className="w-full h-full bg-white rounded-full shadow-2xl group-hover:bg-blue-50 transition-colors flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full border border-slate-200" />
                                    </div>
                                </button>

                                <button
                                    onClick={onCancel}
                                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 transition-all shadow-xl"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            <img src={scanMode === 'SINGLE' ? segments[0] : segments[2]} alt="Capture" className="w-full h-full object-cover" />

                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                    <div className="text-center space-y-1">
                                        <h3 className="text-white font-black uppercase tracking-widest text-xs">AI Analýza...</h3>
                                        <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest italic">Skladám detaily a hledám anomálie</p>
                                    </div>
                                </div>
                            )}

                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full max-w-md px-6">
                                <button
                                    onClick={reset}
                                    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all shadow-xl"
                                >
                                    Nové snímkování
                                </button>
                                <button
                                    onClick={confirmCapture}
                                    disabled={isAnalyzing}
                                    className="flex-[1.5] px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50 ring-4 ring-blue-500/20"
                                >
                                    Přejít do laboratoře <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
