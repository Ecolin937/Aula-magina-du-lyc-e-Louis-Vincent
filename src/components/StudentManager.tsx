import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Trash2, Users, Camera, Loader2, Image as ImageIcon, SortAsc, Shuffle, Download, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createWorker } from 'tesseract.js';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface StudentManagerProps {
  students: string[];
  setStudents: (students: string[]) => void;
}

export function StudentManager({ students, setStudents }: StudentManagerProps) {
  const [newStudent, setNewStudent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addStudent = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newStudent.trim() && !students.includes(newStudent.trim())) {
      setStudents([...students, newStudent.trim()]);
      setNewStudent('');
      toast.success(`¡${newStudent.trim()} añadido!`);
    } else if (students.includes(newStudent.trim())) {
      toast.error("Este alumno ya está en la lista.");
    }
  };

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const toastId = toast.loading("Analizando imagen...");

    try {
      // Create a canvas to preprocess the image for better OCR quality
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw and apply basic preprocessing (Grayscale + High Contrast)
      ctx.filter = 'grayscale(100%) contrast(150%) brightness(110%)';
      ctx.drawImage(img, 0, 0);
      
      const processedBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      URL.revokeObjectURL(objectUrl);
      
      if (!processedBlob) throw new Error("Failed to process image");

      const worker = await createWorker('spa'); // Spanish OCR
      
      // Set parameters for better quality (though limited in JS worker)
      await worker.setParameters({
        tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúÁÉÍÓÚñÑ ',
      });

      const { data: { text } } = await worker.recognize(processedBlob);
      await worker.terminate();

      // Clean up text: split by lines, commas, or semicolons
      const uiKeywords = ['añadir', 'eliminar', 'borrar', 'importar', 'captura', 'lista', 'alumnos', 'cronómetro', 'rueda', 'grupos', 'puntos', 'marcador', 'total', 'cancelar', 'aceptar', 'ordenar', 'azar', 'exportar', 'actualizar'];
      
      const detectedNames = text
        .split(/[\n,;]/)
        .map(name => {
          // Remove non-alpha characters but keep spaces and accented characters
          let cleaned = name.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
          // Remove extra internal spaces
          cleaned = cleaned.replace(/\s+/g, ' ');
          // Capitalize each word correctly
          if (cleaned.length < 2) return '';
          return cleaned.split(' ')
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        })
        .filter(name => {
          const lowerName = name.toLowerCase();
          return (
            name.length > 2 && 
            !uiKeywords.some(kw => lowerName.includes(kw)) &&
            !students.includes(name)
          );
        });

      // Remove duplicates from the detected list itself
      const uniqueDetected = Array.from(new Set(detectedNames));

      if (uniqueDetected.length > 0) {
        setStudents([...students, ...uniqueDetected]);
        toast.success(`¡Se han detectado y añadido ${uniqueDetected.length} alumnos!`, { id: toastId });
      } else {
        toast.info("No se detectaron nombres nuevos en la imagen.", { id: toastId });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Error al procesar la imagen. Inténtalo de nuevo.", { id: toastId });
    } finally {
      setIsProcessing(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeStudent = (name: string) => {
    setStudents(students.filter(s => s !== name));
    toast.info(`${name} eliminado.`);
  };

  const clearAll = () => {
    setStudents([]);
    toast.success("Lista de alumnos borrada.");
  };

  const sortStudents = () => {
    setStudents([...students].sort((a, b) => a.localeCompare(b)));
    toast.success("Lista ordenada alfabéticamente.");
  };

  const pickRandom = () => {
    if (students.length === 0) return;
    const random = students[Math.floor(Math.random() * students.length)];
    toast(`Alumno seleccionado: ${random}`, {
      icon: <UserCheck className="w-4 h-4 text-indigo-600" />,
      duration: 5000,
    });
  };

  const exportStudents = () => {
    const blob = new Blob([students.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista-alumnos.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Lista exportada como .txt");
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-900">
          <Users className="w-6 h-6" />
          Lista de Alumnos
        </CardTitle>
        <CardDescription>
          Añade los nombres de tus alumnos para usar la rueda y formar grupos.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <div className="flex flex-col gap-3">
          <form onSubmit={addStudent} className="flex gap-2">
            <Input
              placeholder="Nombre del alumno..."
              value={newStudent}
              onChange={(e) => setNewStudent(e.target.value)}
              className="bg-white border-indigo-100 focus-visible:ring-indigo-500"
            />
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Añadir
            </Button>
          </form>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
              className="hidden"
              id="screenshot-upload"
              disabled={isProcessing}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 h-12 rounded-xl"
              disabled={isProcessing}
              onClick={() => document.getElementById('screenshot-upload')?.click()}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Procesando captura...' : 'Importar desde captura'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={sortStudents}
            className="flex-1 text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl h-9"
          >
            <SortAsc className="w-3.5 h-3.5 mr-1.5" />
            Ordenar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={pickRandom}
            className="flex-1 text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl h-9"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1.5" />
            Azar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportStudents}
            className="flex-1 text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar
          </Button>
        </div>

        <ScrollArea className="h-[350px] rounded-xl border border-indigo-50 bg-white/50 p-4">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {students.length === 0 ? (
                <div className="text-center py-8 text-indigo-300 italic">
                  No hay alumnos en la lista
                </div>
              ) : (
                students.map((student) => (
                  <motion.div
                    key={student}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-indigo-50 shadow-sm group hover:border-indigo-200 transition-colors"
                  >
                    <span className="font-medium text-indigo-900">{student}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStudent(student)}
                      className="text-indigo-200 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {students.length > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-indigo-500 font-medium">
              Total: {students.length} alumnos
            </span>
            
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="link"
                    className="text-red-400 hover:text-red-600 p-0 h-auto"
                  >
                    Borrar todos
                  </Button>
                }
              />
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se borrarán todos los nombres de tu lista actual.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel variant="outline" size="default" className="rounded-xl">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAll} className="bg-red-600 hover:bg-red-700 rounded-xl">
                    Borrar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
