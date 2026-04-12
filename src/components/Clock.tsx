import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-600">
        <ClockIcon className="w-4 h-4" />
        <span className="font-mono font-bold text-lg tabular-nums">
          {formatTime(time)}
        </span>
      </div>
      <div className="w-px h-4 bg-slate-200 hidden sm:block" />
      <span className="text-xs font-semibold text-slate-500 capitalize hidden sm:block">
        {formatDate(time)}
      </span>
    </div>
  );
}
