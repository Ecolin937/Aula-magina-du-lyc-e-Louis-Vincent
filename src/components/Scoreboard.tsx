import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Plus, Minus, RotateCcw, UserCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface StudentScore {
  name: string;
  points: number;
}

interface ScoreboardProps {
  students: string[];
  scores: StudentScore[];
  updatePoints: (name: string, delta: number) => void;
  resetScores: () => void;
}

export function Scoreboard({ students, scores, updatePoints, resetScores }: ScoreboardProps) {
  const sortedScores = [...scores].sort((a, b) => b.points - a.points);

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-yellow-900">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Marcador de Puntos
            </CardTitle>
            <CardDescription>
              Asigna puntos a tus alumnos por su participación o buen comportamiento.
            </CardDescription>
          </div>
          {scores.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetScores} className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 rounded-xl">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {students.length === 0 ? (
          <div className="text-center py-16 bg-yellow-50/30 rounded-3xl border border-dashed border-yellow-200">
            <UserCheck className="w-12 h-12 text-yellow-200 mx-auto mb-4" />
            <p className="text-yellow-400 font-medium italic">
              Añade alumnos en el panel lateral para empezar a puntuar
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sortedScores.map((student, index) => (
                  <motion.div
                    key={student.name}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex items-center justify-between p-4 bg-white border border-yellow-100 rounded-2xl shadow-sm hover:border-yellow-300 transition-all group"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                        index === 0 ? 'bg-yellow-400 text-white shadow-lg' : 
                        index === 1 ? 'bg-slate-300 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-bold text-yellow-900 text-sm sm:text-base truncate max-w-[80px] sm:max-w-none">{student.name}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updatePoints(student.name, -1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <div className="w-8 sm:w-12 text-center">
                          <motion.span
                            key={student.points}
                            initial={{ scale: 1.5, color: '#eab308' }}
                            animate={{ scale: 1, color: '#854d0e' }}
                            className="text-lg sm:text-xl font-black"
                          >
                            {student.points}
                          </motion.span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updatePoints(student.name, 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
