import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, UserCheck, Users, RefreshCw, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AttendanceProps {
  students: string[];
  setStudents: (newStudents: string[] | ((prev: string[]) => string[])) => void;
}

export function Attendance({ students, setStudents }: AttendanceProps) {
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {};
    students.forEach(s => initial[s] = true);
    return initial;
  });

  const toggleAttendance = (name: string) => {
    setAttendance(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const markAll = (present: boolean) => {
    const updated: { [key: string]: boolean } = {};
    students.forEach(s => updated[s] = present);
    setAttendance(updated);
  };

  const applyAttendance = () => {
    const absentCount = Object.values(attendance).filter(v => !v).length;
    // In a real app, we might want to filter the students list or just mark them
    // For now, we'll just show a toast and maybe we could add a "hidden" state to students
    toast.success(`Pase de lista completado: ${students.length - absentCount} presentes, ${absentCount} ausentes.`);
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-900">
              <UserCheck className="w-6 h-6 text-indigo-500" />
              Pase de Lista Rápido
            </CardTitle>
            <CardDescription>
              Marca quién ha venido hoy a clase.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => markAll(true)} className="rounded-xl text-xs font-bold">
              Todos
            </Button>
            <Button variant="outline" size="sm" onClick={() => markAll(false)} className="rounded-xl text-xs font-bold">
              Ninguno
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {students.map((name) => (
            <motion.button
              key={name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAttendance(name)}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
                attendance[name] 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-red-50 border-red-200 text-red-900 grayscale opacity-60'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-tighter truncate">{name}</span>
              {attendance[name] ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-500 shrink-0" />
              )}
            </motion.button>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Presentes</span>
              <span className="text-2xl font-black text-emerald-600">
                {Object.values(attendance).filter(v => v).length}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Ausentes</span>
              <span className="text-2xl font-black text-red-600">
                {Object.values(attendance).filter(v => !v).length}
              </span>
            </div>
          </div>

          <Button 
            onClick={applyAttendance}
            className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-lg shadow-indigo-100 gap-3"
          >
            <Save className="w-5 h-5" />
            Guardar Lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
