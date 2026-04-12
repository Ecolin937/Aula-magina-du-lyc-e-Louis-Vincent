import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map as MapIcon, Star, Users, X, UserCheck, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClassPlanProps {
  updatePoints: (name: string, delta: number) => void;
  activeClass: string;
  room: string;
}

interface TableData {
  students: string[];
}

export function ClassPlan({ updatePoints, activeClass, room }: ClassPlanProps) {
  const [selectedTable, setSelectedTable] = useState<{ index: number; students: string[] } | null>(null);

  // Seating chart data for E316 (Clase B1)
  const tablesE316: TableData[] = [
    { students: ['NOLAN', 'MOHAMED'] },
    { students: ['CHARLINE', 'GABIN'] },
    { students: ['LUCAS', 'EVAN'] },
    { students: ['LENAICK', 'LEA'] },
    { students: ['NOA', 'HADRIEN'] },
    { students: ['MARCO', 'NATHAN'] },
    { students: ['NAEL', 'MATIS'] },
    { students: ['INAYA', 'LOLA'] },
    { students: ['LEO', 'SAFAE'] },
    { students: ['SACHA', 'LIVIA'] },
    { students: ['MILO', 'CELIA'] },
    { students: ['SAMUEL', 'LEONIE'] },
  ];

  // Seating chart data for E110 (Clase B2) based on the provided image
  const tablesE110: TableData[] = [
    { students: ['NOLAN', 'MOHAMED'] },
    { students: ['CHARLINE', 'GABIN'] },
    { students: ['LUCAS', 'EVAN'] },
    { students: ['LENAICK', 'LEA'] },
    { students: ['NOA', 'HADRIEN'] },
    { students: ['MARCO', 'NATHAN'] },
    { students: ['NAEL', 'MATIS'] },
    { students: ['INAYA', 'LOLA'] },
    { students: ['LEO', 'SAFAE'] },
    { students: ['SACHA', 'LIVIA'] },
    { students: ['MILO', 'CELIA'] },
    { students: ['SAMUEL', 'LEONIE'] },
  ];

  const tables = room === 'E110' ? tablesE110 : tablesE316;
  const gridCols = room === 'E110' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';

  const handlePoint = (names: string[]) => {
    names.forEach(name => updatePoints(name, 1));
    setSelectedTable(null);
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent relative">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-900">
              <MapIcon className="w-6 h-6 text-indigo-500" />
              Plano de Clase - {activeClass} (Sala {room})
            </CardTitle>
            <CardDescription>
              Haz clic en una mesa para asignar puntos.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-6">
        <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
          {tables.map((table, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTable({ index, students: table.students })}
              className={`aspect-video bg-white border-2 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm transition-all group relative overflow-hidden ${
                selectedTable?.index === index ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-indigo-100 hover:border-indigo-400'
              }`}
            >
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              
              <div className="flex items-center gap-2 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-tighter">
                    {table.students[0]}
                  </span>
                </div>
                <div className="w-px h-4 bg-indigo-100" />
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-tighter">
                    {table.students[1]}
                  </span>
                </div>
              </div>
              
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                <Users className="w-3 h-3" />
                Mesa {index + 1}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selection Overlay */}
        <AnimatePresence>
          {selectedTable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedTable(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 w-full max-w-sm space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Asignar Puntos
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTable(null)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-lg shadow-indigo-100 gap-3"
                    onClick={() => handlePoint(selectedTable.students)}
                  >
                    <UserPlus className="w-5 h-5" />
                    Punto para ambos
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      className="h-20 rounded-2xl border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 flex flex-col gap-1"
                      onClick={() => handlePoint([selectedTable.students[0]])}
                    >
                      <UserCheck className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs font-bold uppercase truncate w-full">{selectedTable.students[0]}</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-20 rounded-2xl border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 flex flex-col gap-1"
                      onClick={() => handlePoint([selectedTable.students[1]])}
                    >
                      <UserCheck className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs font-bold uppercase truncate w-full">{selectedTable.students[1]}</span>
                    </Button>
                  </div>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Mesa {selectedTable.index + 1}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium text-center">
            💡 Haz clic en una mesa para elegir a quién dar el punto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
