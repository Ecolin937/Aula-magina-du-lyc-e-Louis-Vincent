import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Plus, Minus, BellRing, Clock, Maximize2, X, ListOrdered, Trash2, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface PlannedActivity {
  id: string;
  name: string;
  duration: number; // in seconds
}

export function Timer() {
  const [timeLeft, setTimeLeft] = useState(300); // Default 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(300);
  const [isFinished, setIsFinished] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Planning state
  const [showPlanning, setShowPlanning] = useState(false);
  const [plan, setPlan] = useState<PlannedActivity[]>(() => {
    const saved = localStorage.getItem('aula-magica-timer-plan');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number | null>(null);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDuration, setNewActivityDuration] = useState(5); // minutes

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('aula-magica-timer-plan', JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // If we are in a plan, move to next activity
      if (currentActivityIndex !== null && currentActivityIndex < plan.length - 1) {
        const nextIndex = currentActivityIndex + 1;
        toast.success(`¡${plan[currentActivityIndex].name} terminado!`, {
          description: `Siguiente: ${plan[nextIndex].name}`,
          duration: 5000,
        });
        
        // Short delay before starting next activity
        setTimeout(() => {
          startActivity(nextIndex);
        }, 3000);
      } else {
        toast.error("¡TIEMPO AGOTADO!", {
          description: currentActivityIndex !== null ? `Plan "${plan[currentActivityIndex].name}" finalizado.` : "El cronómetro ha llegado a cero.",
          duration: 5000,
        });
        setCurrentActivityIndex(null);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, currentActivityIndex, plan]);

  const toggleTimer = () => {
    if (timeLeft === 0) return;
    setIsActive(!isActive);
    setIsFinished(false);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
    setIsFinished(false);
    setCurrentActivityIndex(null);
  };

  const adjustTime = (seconds: number) => {
    const newTime = Math.max(0, timeLeft + seconds);
    setTimeLeft(newTime);
    if (!isActive) setInitialTime(newTime);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const presets = [
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
    { label: '5m', value: 300 },
    { label: '10m', value: 600 },
    { label: '15m', value: 900 },
    { label: '20m', value: 1200 },
  ];

  const addActivity = () => {
    if (!newActivityName.trim()) {
      toast.error("Ponle un nombre a la actividad");
      return;
    }
    const newActivity: PlannedActivity = {
      id: Math.random().toString(36).substr(2, 9),
      name: newActivityName.trim(),
      duration: newActivityDuration * 60
    };
    setPlan([...plan, newActivity]);
    setNewActivityName('');
    toast.success("Actividad añadida al plan");
  };

  const removeActivity = (id: string) => {
    setPlan(plan.filter(a => a.id !== id));
    if (currentActivityIndex !== null && plan[currentActivityIndex].id === id) {
      resetTimer();
    }
  };

  const startActivity = (index: number) => {
    const activity = plan[index];
    setCurrentActivityIndex(index);
    setTimeLeft(activity.duration);
    setInitialTime(activity.duration);
    setIsActive(true);
    setIsFinished(false);
    setShowPlanning(false);
    toast.info(`Iniciando: ${activity.name}`);
  };

  return (
    <>
      <Card className="h-full border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-orange-900">
                <TimerIcon className="w-6 h-6" />
                Cronómetro
              </CardTitle>
              {currentActivityIndex !== null && (
                <CardDescription className="text-orange-600 font-bold flex items-center gap-1 mt-1">
                  <ChevronRight className="w-4 h-4" />
                  Plan: {plan[currentActivityIndex].name}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlanning(!showPlanning)}
                className={`rounded-xl ${showPlanning ? 'bg-orange-100 text-orange-600' : 'text-orange-400 hover:text-orange-600'}`}
                title="Planificar actividades"
              >
                <ListOrdered className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(true)}
                className="text-orange-400 hover:text-orange-600 rounded-xl"
                title="Pantalla completa"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 flex flex-col items-center justify-center space-y-8 py-6">
          
          <AnimatePresence mode="wait">
            {showPlanning ? (
              <motion.div
                key="planning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full space-y-6"
              >
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-4">
                  <h4 className="font-bold text-orange-900 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva actividad
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Ej: Lectura individual"
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      className="bg-white border-orange-200 focus-visible:ring-orange-500"
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1 sm:w-24">
                        <Input
                          type="number"
                          value={newActivityDuration}
                          onChange={(e) => setNewActivityDuration(parseInt(e.target.value) || 1)}
                          className="bg-white border-orange-200 focus-visible:ring-orange-500 pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-300">MIN</span>
                      </div>
                      <Button onClick={addActivity} className="bg-orange-600 hover:bg-orange-700">
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-orange-900 text-sm uppercase tracking-widest px-2">Tu Plan de Clase</h4>
                  {plan.length === 0 ? (
                    <div className="text-center py-8 text-orange-300 italic text-sm">
                      No hay actividades planificadas
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                      {plan.map((activity, index) => (
                        <div 
                          key={activity.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            currentActivityIndex === index 
                              ? 'bg-orange-100 border-orange-300 shadow-sm' 
                              : 'bg-white border-orange-50 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-[10px] font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-bold text-orange-900 text-sm">{activity.name}</p>
                              <p className="text-[10px] text-orange-400 font-medium">{Math.floor(activity.duration / 60)} minutos</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startActivity(index)}
                              className="h-8 w-8 text-orange-500 hover:bg-orange-50"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeActivity(activity.id)}
                              className="h-8 w-8 text-orange-200 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                  onClick={() => setShowPlanning(false)}
                >
                  Cerrar Planificador
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="timer-main"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center space-y-8"
              >
                <div className="relative w-64 h-64">
                  {/* Progress Ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-orange-50"
                    />
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 120}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ 
                        strokeDashoffset: 2 * Math.PI * 120 * (1 - timeLeft / (initialTime || 1)) 
                      }}
                      transition={{ duration: 1, ease: "linear" }}
                      className="text-orange-500"
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      {isFinished ? (
                        <motion.div
                          key="finished"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="flex flex-col items-center text-red-600"
                        >
                          <BellRing className="w-20 h-20 animate-bounce mb-2" />
                          <span className="text-4xl font-black uppercase tracking-tighter">¡Tiempo!</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="timer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <span className={`text-6xl font-black font-mono tracking-tighter ${
                            timeLeft < 10 && isActive ? 'text-red-500 animate-pulse' : 'text-orange-600'
                          }`}>
                            {formatTime(timeLeft)}
                          </span>
                          {isActive && (
                            <div className="flex items-center gap-1 mt-2 text-orange-400 font-bold text-[10px] uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              En curso
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustTime(-30)}
                    className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className={`w-32 rounded-full h-16 text-xl font-bold shadow-lg transition-all ${
                      isActive 
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 border-2 border-orange-600' 
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustTime(30)}
                    className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      onClick={() => {
                        setIsActive(false);
                        setTimeLeft(preset.value);
                        setInitialTime(preset.value);
                        setCurrentActivityIndex(null);
                      }}
                      className="text-orange-600 hover:bg-orange-50 font-medium"
                    >
                      {preset.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetTimer}
                    className="text-orange-400 hover:text-orange-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-orange-600 flex flex-col items-center justify-center p-8"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(false)}
              className="absolute top-8 right-8 text-white hover:bg-white/20 rounded-full w-12 h-12"
            >
              <X className="w-8 h-8" />
            </Button>

            {currentActivityIndex !== null && (
              <div className="absolute top-8 left-8 text-white/80 font-black text-2xl uppercase tracking-widest flex items-center gap-3">
                <ListOrdered className="w-8 h-8" />
                Plan: {plan[currentActivityIndex].name}
              </div>
            )}

            <div className="relative w-[80vw] h-[80vw] max-w-[600px] max-h-[600px]">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="20"
                  fill="transparent"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="white"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray="283%"
                  initial={{ strokeDashoffset: "0%" }}
                  animate={{ 
                    strokeDashoffset: `${283 * (1 - timeLeft / (initialTime || 1))}%` 
                  }}
                  transition={{ duration: 1, ease: "linear" }}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <AnimatePresence mode="wait">
                  {isFinished ? (
                    <motion.div
                      key="fs-finished"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <BellRing className="w-40 h-40 animate-bounce mb-4" />
                      <span className="text-8xl font-black uppercase tracking-tighter">¡Tiempo!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="fs-timer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <span className={`text-[15vw] sm:text-[180px] font-black font-mono tracking-tighter leading-none ${
                        timeLeft < 10 && isActive ? 'animate-pulse' : ''
                      }`}>
                        {formatTime(timeLeft)}
                      </span>
                      {isActive && (
                        <div className="flex items-center gap-2 mt-4 text-white/60 font-bold text-xl uppercase tracking-widest">
                          <Clock className="w-6 h-6" />
                          En curso
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustTime(-30)}
                className="w-16 h-16 rounded-full border-white/30 text-white hover:bg-white/20"
              >
                <Minus className="w-8 h-8" />
              </Button>
              
              <Button
                onClick={toggleTimer}
                className={`w-40 h-40 rounded-full text-4xl font-bold shadow-2xl transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white border-4 border-white' 
                    : 'bg-white text-orange-600 hover:bg-orange-50'
                }`}
              >
                {isActive ? <Pause className="w-16 h-16" /> : <Play className="w-16 h-16 ml-2" />}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustTime(30)}
                className="w-16 h-16 rounded-full border-white/30 text-white hover:bg-white/20"
              >
                <Plus className="w-8 h-8" />
              </Button>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="ghost"
                onClick={resetTimer}
                className="text-white/60 hover:text-white hover:bg-white/10 text-lg"
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                Reiniciar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
