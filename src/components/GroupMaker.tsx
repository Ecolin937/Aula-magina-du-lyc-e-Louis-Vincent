import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Shuffle, Users, Copy, Check, Trash2, Plus, X, Pencil, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';

import { shuffleArray } from '@/lib/random';

interface GroupMakerProps {
  students: string[];
}

type GroupMode = 'count' | 'size';

interface GroupData {
  id: string;
  name: string;
  members: string[];
}

export function GroupMaker({ students }: GroupMakerProps) {
  const [value, setValue] = useState(2);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Reset value to stay within bounds
  useEffect(() => {
    setValue(Math.min(value, Math.max(2, students.length || 2)));
  }, [students.length]);

  const generateGroups = () => {
    if (students.length < 2) {
      toast.error("Añade al menos 2 alumnos para formar grupos.");
      return;
    }

    // Use the secure shuffle from our lib
    const shuffled = shuffleArray(students);
    let generatedGroups: string[][] = [];

    const groupSize = Math.max(1, Math.min(value, students.length));
    for (let i = 0; i < shuffled.length; i += groupSize) {
      generatedGroups.push(shuffled.slice(i, i + groupSize));
    }

    const finalGroups: GroupData[] = generatedGroups
      .filter(g => g.length > 0)
      .map((members, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: `Grupo ${i + 1}`,
        members
      }));

    setGroups(finalGroups);
    toast.success(`${finalGroups.length} grupos generados con éxito.`);
  };

  const updateGroupName = (id: string, name: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, name } : g));
  };

  const addMemberToGroup = (id: string, memberName: string) => {
    if (!memberName.trim()) return;
    setGroups(groups.map(g => g.id === id ? { ...g, members: [...g.members, memberName.trim()] } : g));
    toast.success(`Añadido a ${memberName.trim()}`);
  };

  const removeMemberFromGroup = (groupId: string, memberIndex: number) => {
    const group = groups.find(g => g.id === groupId);
    const memberName = group?.members[memberIndex];
    setGroups(groups.map(g => g.id === groupId ? { 
      ...g, 
      members: g.members.filter((_, i) => i !== memberIndex) 
    } : g));
    if (memberName) toast.info(`${memberName} removido del grupo.`);
  };

  const copyGroup = (group: GroupData, index: number) => {
    const text = `${group.name}:\n${group.members.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Lista copiada al portapapeles.");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearGroups = () => {
    setGroups([]);
    toast.info("Grupos borrados.");
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-emerald-900">
          <LayoutGrid className="w-6 h-6" />
          Formador de Grupos
        </CardTitle>
        <CardDescription>
          Organiza a tu clase de forma aleatoria por número de grupos o por tamaño de grupo.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="space-y-6 bg-white/50 p-6 rounded-3xl border border-emerald-50 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-emerald-900 font-semibold">
                ¿Cuántos alumnos por grupo?
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-9 text-center font-bold text-emerald-700 border-emerald-200 focus-visible:ring-emerald-500 rounded-full"
                />
              </div>
            </div>
            <Slider
              value={[value]}
              onValueChange={(val) => setValue(val[0])}
              min={1}
              max={Math.max(2, students.length)}
              step={1}
              className="py-4"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateGroups}
              disabled={students.length < 2}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Generar Grupos
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-12 px-4 rounded-xl"
              title="Actualizar página"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {groups.length > 0 && (
              <Button
                variant="outline"
                onClick={clearGroups}
                className="border-red-100 text-red-500 hover:bg-red-50 h-12 px-4 rounded-xl"
                title="Borrar grupos"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {groups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.05 }}
                className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-colors group relative"
              >
                <div className="flex items-center gap-3 mb-4 border-b border-emerald-50 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    {editingGroupId === group.id ? (
                      <Input
                        autoFocus
                        value={group.name}
                        onChange={(e) => updateGroupName(group.id, e.target.value)}
                        onBlur={() => setEditingGroupId(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingGroupId(null)}
                        className="h-7 py-0 px-2 text-sm font-bold text-emerald-900 border-emerald-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <h4 className="font-bold text-emerald-900 leading-none">{group.name}</h4>
                        <button 
                          onClick={() => setEditingGroupId(group.id)}
                          className="opacity-0 group-hover/title:opacity-100 text-emerald-300 hover:text-emerald-500 transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      {group.members.length} integrantes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyGroup(group, i)}
                      className="text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
                    >
                      {copiedIndex === i ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {group.members.map((student, j) => (
                    <motion.li 
                      key={j} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-emerald-800 flex items-center justify-between group/member font-medium"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                        {student}
                      </div>
                      <button 
                        onClick={() => removeMemberFromGroup(group.id, j)}
                        className="opacity-0 group-hover/member:opacity-100 text-emerald-200 hover:text-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.li>
                  ))}
                </ul>

                <div className="relative pt-2">
                  <Separator className="bg-emerald-50 mb-3" />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Añadir alumno..."
                      className="h-8 text-xs bg-emerald-50/50 border-none focus-visible:ring-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addMemberToGroup(group.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addMemberToGroup(group.id, input.value);
                        input.value = '';
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {students.length < 2 ? (
          <div className="text-center py-16 bg-emerald-50/30 rounded-3xl border border-dashed border-emerald-200">
            <Users className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
            <p className="text-emerald-400 font-medium italic">
              Añade al menos 2 alumnos en el panel lateral para formar grupos
            </p>
          </div>
        ) : groups.length === 0 && (
          <div className="text-center py-16 text-emerald-300 italic">
            Configura las opciones arriba y haz clic en "Generar Grupos"
          </div>
        )}
      </CardContent>
    </Card>
  );
}
