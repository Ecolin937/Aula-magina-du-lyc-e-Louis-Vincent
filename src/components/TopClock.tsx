import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar } from 'lucide-react';

export function TopClock() {
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
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <div className="flex items-center gap-4 text-white/90 text-xs font-bold font-mono">
      <div className="flex items-center gap-1.5">
        <ClockIcon className="w-3.5 h-3.5 text-indigo-200" />
        <span className="tabular-nums">{formatTime(time)}</span>
      </div>
      <div className="w-px h-3 bg-white/20" />
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-indigo-200" />
        <span className="capitalize">{formatDate(time)}</span>
      </div>
    </div>
  );
}
