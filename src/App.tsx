/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer } from './components/Timer';
import { StudentWheel } from './components/StudentWheel';
import { GroupMaker } from './components/GroupMaker';
import { StudentManager } from './components/StudentManager';
import { Scoreboard } from './components/Scoreboard';
import { Toaster } from '@/components/ui/sonner';
import { GraduationCap, Timer as TimerIcon, RotateCw, LayoutGrid, Trophy, RefreshCw, StickyNote, BookOpen, Users2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Notes } from './components/Notes';
import { Clock } from './components/Clock';
import { TopClock } from './components/TopClock';
import { ClassPlan } from './components/ClassPlan';
import { Attendance } from './components/Attendance';
import { MusicPlayer } from './components/MusicPlayer';
import { toast } from 'sonner';
import { UserCheck, Music } from 'lucide-react';

interface StudentScore {
  name: string;
  points: number;
}

export default function App() {
  const [activeClass, setActiveClass] = useState(() => {
    return localStorage.getItem('aula-magica-active-class') || '50407';
  });

  const b1Students = [
    'NOLAN', 'MOHAMED', 'CHARLINE', 'GABIN', 'LUCAS', 'EVAN', 'LENAICK', 'LEA',
    'NOA', 'HADRIEN', 'MARCO', 'NATHAN', 'NAEL', 'MATIS', 'INAYA', 'LOLA',
    'LEO', 'SAFAE', 'SACHA', 'LIVIA', 'MILO', 'CELIA', 'SAMUEL', 'LEONIE'
  ];

  const class51011Students = [
    'LOUNA', 'AXEL', 'LEO', 'TESSA', 'BASILE', 'HUGO', 'TOM', 'AVA',
    'MELISSA', 'MEHDI', 'SARAH', 'MAHAUT', 'ILAN', 'PAUL L', 'LEON', 'ALEXIS',
    'MAEL', 'AMELIE', 'PAUL C', 'PIERRE', 'EMMA', 'JULIETTE', 'CLEA', 'LOLA'
  ];

  const [allStudents, setAllStudents] = useState<{ [key: string]: string[] }>(() => {
    const saved = localStorage.getItem('aula-magica-all-students');
    const defaultState = {
      '50407': class51011Students,
      '51011-E316': class51011Students,
      '51011-E110': class51011Students,
      'Clase D': []
    };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if old keys exist, move them to new keys
      if (parsed['E316']) parsed['50407'] = parsed['E316'];
      if (parsed['E110']) parsed['51011-E316'] = parsed['E110'];
      if (parsed['Clase C']) parsed['51011-E110'] = parsed['Clase C'];
      if (parsed['50407-E316']) parsed['50407'] = parsed['50407-E316'];
      if (parsed['50407-E110']) parsed['51011-E316'] = parsed['50407-E110'];
      if (parsed['51011']) parsed['51011-E110'] = parsed['51011'];

      // If keys exist but are empty, we populate it with defaults to help the user
      if (parsed['50407'] && parsed['50407'].length === 0) {
        parsed['50407'] = class51011Students;
      }
      if (parsed['51011-E316'] && parsed['51011-E316'].length === 0) {
        parsed['51011-E316'] = class51011Students;
      }
      if (parsed['51011-E110'] && parsed['51011-E110'].length === 0) {
        parsed['51011-E110'] = class51011Students;
      }
      // Force sync 50407 and 51011-E316 on load
      if (parsed['50407']) {
        parsed['51011-E316'] = parsed['50407'];
      }
      return { ...defaultState, ...parsed };
    }
    return defaultState;
  });

  const [allScores, setAllScores] = useState<{ [key: string]: StudentScore[] }>(() => {
    const saved = localStorage.getItem('aula-magica-all-scores');
    const defaultScores = {
      '50407': class51011Students.map(name => ({ name, points: 0 })),
      '51011-E316': class51011Students.map(name => ({ name, points: 0 })),
      '51011-E110': class51011Students.map(name => ({ name, points: 0 })),
      'Clase D': []
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration
      if (parsed['E316']) parsed['50407'] = parsed['E316'];
      if (parsed['E110']) parsed['51011-E316'] = parsed['E110'];
      if (parsed['Clase C']) parsed['51011-E110'] = parsed['Clase C'];
      if (parsed['50407-E316']) parsed['50407'] = parsed['50407-E316'];
      if (parsed['50407-E110']) parsed['51011-E316'] = parsed['50407-E110'];
      if (parsed['51011']) parsed['51011-E110'] = parsed['51011'];

      if (parsed['50407'] && parsed['50407'].length === 0) {
        parsed['50407'] = class51011Students.map(name => ({ name, points: 0 }));
      }
      if (parsed['51011-E316'] && parsed['51011-E316'].length === 0) {
        parsed['51011-E316'] = class51011Students.map(name => ({ name, points: 0 }));
      }
      if (parsed['51011-E110'] && parsed['51011-E110'].length === 0) {
        parsed['51011-E110'] = class51011Students.map(name => ({ name, points: 0 }));
      }
      // Force sync 50407 and 51011-E316 scores on load
      if (parsed['50407']) {
        parsed['51011-E316'] = parsed['50407'];
      }
      return { ...defaultScores, ...parsed };
    }
    return defaultScores;
  });

  const effectiveClass = activeClass === '51011-E316' ? '50407' : activeClass;
  const students = allStudents[effectiveClass] || [];
  const scores = allScores[effectiveClass] || [];

  useEffect(() => {
    // Sync scores with students list for effective class
    const currentNames = scores.map(s => s.name);
    const newStudents = students.filter(name => !currentNames.includes(name));
    const removedStudents = currentNames.filter(name => !students.includes(name));

    if (newStudents.length > 0 || removedStudents.length > 0) {
      const updatedScores = [
        ...scores.filter(s => students.includes(s.name)),
        ...newStudents.map(name => ({ name, points: 0 }))
      ];
      
      setAllScores(prev => {
        const newState = { ...prev, [effectiveClass]: updatedScores };
        // If we are updating 50407, also update 51011-E316 to keep them in sync in the state object
        if (effectiveClass === '50407') {
          newState['51011-E316'] = updatedScores;
        }
        return newState;
      });
    }
  }, [students, effectiveClass]);

  useEffect(() => {
    localStorage.setItem('aula-magica-all-scores', JSON.stringify(allScores));
  }, [allScores]);

  const updatePoints = (name: string, delta: number) => {
    setAllScores(prev => {
      const currentScores = prev[effectiveClass] || [];
      const updatedScores = currentScores.map(s => 
        s.name === name ? { ...s, points: s.points + delta } : s
      );
      
      const newState = { ...prev, [effectiveClass]: updatedScores };
      if (effectiveClass === '50407') {
        newState['51011-E316'] = updatedScores;
      }
      return newState;
    });

    if (delta > 0) {
      toast.success(`+${delta} puntos para ${name}`);
    } else if (delta < 0) {
      toast.error(`${delta} puntos para ${name}`);
    }
  };

  const resetScores = () => {
    setAllScores(prev => {
      const currentScores = prev[effectiveClass] || [];
      const updatedScores = currentScores.map(s => ({ ...s, points: 0 }));
      
      const newState = { ...prev, [effectiveClass]: updatedScores };
      if (effectiveClass === '50407') {
        newState['51011-E316'] = updatedScores;
      }
      return newState;
    });
    toast.info("Puntuaciones reiniciadas");
  };

  const setStudents = (newStudents: string[] | ((prev: string[]) => string[])) => {
    setAllStudents(prev => {
      const currentList = prev[effectiveClass] || [];
      const updatedList = typeof newStudents === 'function' ? newStudents(currentList) : newStudents;
      
      const newState = { ...prev, [effectiveClass]: updatedList };
      if (effectiveClass === '50407') {
        newState['51011-E316'] = updatedList;
      }
      
      localStorage.setItem('aula-magica-all-students', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    localStorage.setItem('aula-magica-active-class', activeClass);
  }, [activeClass]);

  useEffect(() => {
    const welcomeShown = sessionStorage.getItem('aula-magica-welcome');
    if (!welcomeShown) {
      toast('Aula Mágica', {
        description: 'Sitio creado por Diego Hamon Bayard',
        duration: 7000,
      });
      sessionStorage.setItem('aula-magica-welcome', 'true');
    }
  }, []);

  const classRooms: { [key: string]: string } = {
    '50407': 'E316',
    '51011-E316': 'E110',
    '51011-E110': 'C'
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-indigo-100">
      <Toaster position="top-center" />
      
      {/* Top Utility Bar */}
      <div className="bg-indigo-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <TopClock />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-white hover:bg-indigo-500 rounded-lg gap-2 h-8 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar Página
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-auto py-4 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900">Aula Mágica</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-500 leading-none">Toolkit para Profes</p>
            </div>
          </div>
          
          <div className="hidden sm:block">
            {/* Clock moved to top bar */}
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              {['50407', '51011-E316', '51011-E110', 'Clase D'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setActiveClass(cls)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    activeClass === cls 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {classRooms[activeClass] ? `Sala: ${classRooms[activeClass]}` : <span className="hidden md:inline">Activa</span>}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar - Student Management */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <StudentManager students={students} setStudents={setStudents} />
            </div>
          </aside>

          {/* Main Content - Tools */}
          <div className="lg:col-span-8 overflow-hidden">
            <Tabs defaultValue="timer" className="w-full">
              <div className="overflow-x-auto no-scrollbar mb-8">
                <TabsList className="flex w-max bg-slate-100/50 p-1 rounded-2xl h-14">
                  <TabsTrigger value="timer" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <TimerIcon className="w-4 h-4" />
                    <span className="whitespace-nowrap">Cronómetro</span>
                  </TabsTrigger>
                  <TabsTrigger value="wheel" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <RotateCw className="w-4 h-4" />
                    <span className="whitespace-nowrap">Rueda</span>
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <LayoutGrid className="w-4 h-4" />
                    <span className="whitespace-nowrap">Grupos</span>
                  </TabsTrigger>
                  <TabsTrigger value="scores" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <Trophy className="w-4 h-4" />
                    <span className="whitespace-nowrap">Puntos</span>
                  </TabsTrigger>
                  {(activeClass === '50407' || activeClass === '51011-E316' || activeClass === '51011-E110') && (
                    <TabsTrigger value="plan" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                      <BookOpen className="w-4 h-4" />
                      <span className="whitespace-nowrap">Plano</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="attendance" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <UserCheck className="w-4 h-4" />
                    <span className="whitespace-nowrap">Lista</span>
                  </TabsTrigger>
                  <TabsTrigger value="music" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <Music className="w-4 h-4" />
                    <span className="whitespace-nowrap">Música</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 px-4">
                    <StickyNote className="w-4 h-4" />
                    <span className="whitespace-nowrap">Notas</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="timer" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <Timer />
                  </motion.div>
                </TabsContent>

                <TabsContent value="wheel" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <StudentWheel students={students} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="groups" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <GroupMaker students={students} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="scores" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <Scoreboard 
                      students={students} 
                      scores={scores} 
                      updatePoints={updatePoints} 
                      resetScores={resetScores} 
                    />
                  </motion.div>
                </TabsContent>

                {(activeClass === '50407' || activeClass === '51011-E316' || activeClass === '51011-E110') && (
                  <TabsContent value="plan" className="mt-0 focus-visible:outline-none">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                    >
                      <ClassPlan 
                        updatePoints={updatePoints} 
                        activeClass={activeClass}
                        room={classRooms[activeClass]}
                      />
                    </motion.div>
                  </TabsContent>
                )}

                <TabsContent value="attendance" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <Attendance students={students} setStudents={setStudents} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="music" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <MusicPlayer />
                  </motion.div>
                </TabsContent>
                <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[550px]"
                  >
                    <Notes />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2026 Aula Mágica • Sitio creado por Diego Hamon Bayard • Hecho con ❤️ para educadores</p>
      </footer>
    </div>
  );
}

