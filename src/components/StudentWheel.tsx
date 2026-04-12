import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Trophy, ListRestart, Type, UserMinus, Settings2, CheckCircle2, Circle } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { secureRandom } from '@/lib/random';

interface StudentWheelProps {
  students: string[];
}

export function StudentWheel({ students }: StudentWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [removeWinner, setRemoveWinner] = useState(false);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);

  // Sound synthesis functions
  const playTick = () => {
    if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playWin = () => {
    if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();

    const playNote = (freq: number, time: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    };

    playNote(523.25, 0, 0.3); // C5
    playNote(659.25, 0.1, 0.3); // E5
    playNote(783.99, 0.2, 0.5); // G5
  };

  // Initialize items with students if items is empty
  useEffect(() => {
    if (items.length === 0 && students.length > 0) {
      setItems(students);
    }
  }, [students]);

  const spin = async () => {
    if (items.length < 2 || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    // Use secure randomness for rotations and final position
    const rotations = 5 + secureRandom() * 5;
    const degrees = rotations * 360;
    const finalRotation = degrees + secureRandom() * 360;

    // Tick sound logic during animation
    let lastTickAngle = 0;
    const segmentSize = 360 / items.length;
    
    const tickInterval = setInterval(() => {
      // We can't easily get the current rotation from motion controls during animation
      // but we can simulate the ticks based on the duration and ease
    }, 50);

    // Better way: use a manual animation frame or just play ticks at intervals
    // For simplicity and sutil effect, we'll play a few ticks
    const totalTicks = Math.floor(finalRotation / segmentSize);
    for (let i = 0; i < 20; i++) {
      setTimeout(() => playTick(), i * 150);
    }

    await controls.start({
      rotate: finalRotation,
      transition: {
        duration: 4,
        ease: [0.15, 0, 0.15, 1],
      },
    });

    clearInterval(tickInterval);
    
    const actualRotation = finalRotation % 360;
    const winnerIndex = Math.floor(((360 - (actualRotation % 360)) % 360) / segmentSize);
    
    const selectedWinner = items[winnerIndex];
    setWinner(selectedWinner);
    setIsSpinning(false);
    playWin();

    if (removeWinner) {
      setTimeout(() => {
        setItems(prev => prev.filter((_, i) => i !== winnerIndex));
        toast.info(`"${selectedWinner}" ha sido removido de la rueda.`);
      }, 3000);
    }

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
  };

  const addItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
      toast.success(`"${newItem.trim()}" añadido a la rueda.`);
    }
  };

  const removeItem = (index: number) => {
    const removed = items[index];
    setItems(items.filter((_, i) => i !== index));
    toast.info(`"${removed}" eliminado.`);
  };

  const resetToStudents = () => {
    if (students.length === 0) {
      toast.error("No hay alumnos en la lista lateral.");
      return;
    }
    setItems(students);
    setWinner(null);
    toast.success("Lista de alumnos cargada en la rueda.");
  };

  const clearItems = () => {
    setItems([]);
    setWinner(null);
    toast.info("Rueda vaciada.");
  };

  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', 
    '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', 
    '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'
  ];

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-purple-900">
          <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
          Rueda de la Fortuna
        </CardTitle>
        <CardDescription>
          Personaliza el contenido de la rueda o usa tu lista de alumnos.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 flex flex-col lg:flex-row gap-8 py-4">
        {/* Left Side: Controls */}
        <div className="w-full lg:w-1/3 space-y-4">
          <form onSubmit={addItem} className="space-y-2">
            <Label htmlFor="wheel-item" className="text-purple-900 font-semibold flex items-center gap-2">
              <Type className="w-4 h-4" />
              Añadir opción
            </Label>
            <div className="flex gap-2">
              <Input
                id="wheel-item"
                placeholder="Ej: Premio, Tarea..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="bg-white border-purple-100"
              />
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                Añadir
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-3">
              <button
                type="button"
                onClick={() => setRemoveWinner(!removeWinner)}
                className="flex items-center justify-between w-full group/toggle"
              >
                <Label className="text-xs font-bold text-purple-700 flex items-center gap-2 cursor-pointer">
                  <UserMinus className="w-3.5 h-3.5" />
                  Eliminar ganador tras girar
                </Label>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${removeWinner ? 'bg-purple-600' : 'bg-purple-200'}`}>
                  <motion.div 
                    animate={{ x: removeWinner ? 20 : 2 }}
                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-purple-900 font-semibold">Opciones actuales</Label>
                <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetToStudents}
                  className="text-purple-600 hover:bg-purple-50 h-7 px-2 text-xs"
                  title="Cargar lista de alumnos"
                >
                  <ListRestart className="w-3 h-3 mr-1" />
                  Alumnos
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearItems}
                  className="text-red-400 hover:text-red-600 h-7 px-2 text-xs"
                >
                  Limpiar
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[200px] rounded-xl border border-purple-50 bg-white/50 p-3">
              <div className="space-y-1">
                {items.length === 0 ? (
                  <p className="text-center py-4 text-purple-300 text-sm italic">Sin opciones</p>
                ) : (
                  items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-purple-50 text-sm">
                      <span className="truncate max-w-[120px] font-medium text-purple-900">{item}</span>
                      <button 
                        onClick={() => removeItem(i)}
                        className="text-purple-200 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Right Side: Wheel */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {items.length < 2 ? (
            <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-purple-300 italic text-center px-10">
              Añade al menos 2 opciones para activar la rueda
            </div>
          ) : (
            <>
              <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px]">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 text-purple-900">
                  <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-current drop-shadow-md" />
                </div>

                <motion.div
                  animate={controls}
                  className="w-full h-full rounded-full border-8 border-purple-100 shadow-2xl overflow-hidden relative"
                  style={{ transformOrigin: 'center' }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {items.map((item, i) => {
                      const angle = 360 / items.length;
                      const startAngle = i * angle;
                      const endAngle = (i + 1) * angle;
                      
                      const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);
                      
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                      return (
                        <g key={i}>
                          <path
                            d={pathData}
                            fill={colors[i % colors.length]}
                            stroke="white"
                            strokeWidth="0.5"
                          />
                          <text
                            x="50"
                            y="20"
                            transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                            fill="white"
                            fontSize={items.length > 10 ? "3" : "4"}
                            fontWeight="bold"
                            textAnchor="middle"
                            style={{ pointerEvents: 'none' }}
                          >
                            {item.length > 12 ? item.substring(0, 10) + '...' : item}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={spin}
                  disabled={isSpinning}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 h-14 text-lg font-bold shadow-lg"
                >
                  {isSpinning ? 'Girando...' : '¡Girar Rueda!'}
                </Button>

                <AnimatePresence>
                  {winner && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="flex items-center gap-2 bg-purple-100 text-purple-700 px-6 py-3 rounded-2xl border-2 border-purple-200"
                    >
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-bold">¡{winner}!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
