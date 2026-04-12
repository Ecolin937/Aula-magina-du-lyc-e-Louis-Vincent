import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StickyNote, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Notes() {
  const [note, setNote] = useState(() => {
    const saved = localStorage.getItem('aula-magica-notes');
    return saved || '';
  });

  useEffect(() => {
    localStorage.setItem('aula-magica-notes', note);
  }, [note]);

  const clearNotes = () => {
    setNote('');
    toast.success('Bloc de notas vaciado');
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-blue-900">
            <StickyNote className="w-6 h-6 text-blue-500" />
            Bloc de Notas
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearNotes}
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe aquí tus notas para la clase, recordatorios o tareas pendientes..."
          className="w-full h-[400px] p-6 rounded-3xl border-2 border-blue-50 bg-blue-50/30 focus:bg-white focus:border-blue-200 focus:outline-none transition-all resize-none font-medium text-slate-700 leading-relaxed"
        />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Save className="w-3 h-3" />
          Se guarda automáticamente en tu navegador
        </div>
      </CardContent>
    </Card>
  );
}
