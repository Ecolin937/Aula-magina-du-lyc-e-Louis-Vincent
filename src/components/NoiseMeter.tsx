import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Mic, MicOff, Volume2, AlertTriangle, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NoiseMeter() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [volume, setVolume] = useState(0);
  const [threshold, setThreshold] = useState(50);
  const [sensitivity, setSensitivity] = useState(5);
  const [isAlert, setIsAlert] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Ensure context is running (some browsers start it suspended)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // Increased for better resolution
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      setIsMonitoring(true);
      updateVolume();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('No se pudo acceder al micrófono. Por favor, asegúrate de dar permisos.');
    }
  };

  const stopMonitoring = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsMonitoring(false);
    setVolume(0);
    setIsAlert(false);
  };

  const updateVolume = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    // Calculate RMS (Root Mean Square) for more accurate loudness
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    
    // Scale RMS to a 0-100 range and apply sensitivity
    const normalizedVolume = Math.min(100, (rms * 100 * sensitivity));
    
    setVolume(normalizedVolume);
    
    if (normalizedVolume > threshold) {
      setIsAlert(true);
    } else {
      setIsAlert(false);
    }
    
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  useEffect(() => {
    return () => stopMonitoring();
  }, []);

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-900">
              <Volume2 className="w-6 h-6 text-indigo-500" />
              Medidor de Ruido
            </CardTitle>
            <CardDescription>
              Controla el nivel de ruido en el aula en tiempo real.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-full ${showSettings ? 'bg-indigo-50 border-indigo-200' : ''}`}
          >
            <Settings2 className="w-5 h-5 text-indigo-600" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 py-6 space-y-8">
        <div className="relative h-64 flex items-end justify-center gap-2 bg-slate-50 rounded-3xl p-8 border border-slate-100 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
            {[75, 50, 25].map(level => (
              <div key={level} className="border-t border-slate-200/50 relative">
                <span className="absolute -top-2 left-2 text-[10px] font-bold text-slate-300 uppercase">{level}%</span>
              </div>
            ))}
          </div>

          {/* Threshold Line */}
          <motion.div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 z-10"
            style={{ bottom: `${threshold}%` }}
            animate={{ bottom: `${threshold}%` }}
          >
            <span className="absolute -top-5 right-4 text-[10px] font-bold text-red-500 bg-white px-2 py-0.5 rounded-full shadow-sm border border-red-100">
              LÍMITE: {threshold}%
            </span>
          </motion.div>

          {/* Volume Bar */}
          <div className="w-full max-w-xs h-full bg-slate-200/50 rounded-2xl relative overflow-hidden">
            <motion.div 
              className={`absolute bottom-0 left-0 right-0 transition-colors duration-300 ${
                isAlert ? 'bg-gradient-to-t from-red-500 to-orange-400' : 'bg-gradient-to-t from-indigo-500 to-emerald-400'
              }`}
              initial={{ height: 0 }}
              animate={{ height: `${volume}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Alert Overlay */}
          <AnimatePresence>
            {isAlert && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <AlertTriangle className="w-16 h-16 text-red-500" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`w-full max-w-sm h-16 rounded-2xl text-lg font-bold shadow-lg transition-all gap-3 ${
              isMonitoring 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {isMonitoring ? (
              <>
                <MicOff className="w-6 h-6" />
                Detener Medidor
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                Activar Medidor
              </>
            )}
          </Button>
          
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isMonitoring ? 'Escuchando el aula...' : 'Micrófono desactivado'}
          </p>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-6 pt-4 border-t border-slate-100"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Umbral de Alerta</label>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{threshold}%</span>
                </div>
                <Slider 
                  value={[threshold]} 
                  onValueChange={(val) => setThreshold(val[0])} 
                  max={100} 
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Sensibilidad</label>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">x{sensitivity}</span>
                </div>
                <Slider 
                  value={[sensitivity]} 
                  onValueChange={(val) => setSensitivity(val[0])} 
                  max={20} 
                  min={1}
                  step={0.5}
                  className="py-4"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-xs text-amber-700 font-medium text-center">
            💡 Ajusta la sensibilidad si el medidor reacciona demasiado o muy poco al ruido ambiental.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
