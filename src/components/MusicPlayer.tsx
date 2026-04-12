import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Wind, Coffee, TreePine, CloudRain, Waves, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  isYoutube?: boolean;
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks: Track[] = [
    { 
      id: 'lofi', 
      name: 'Lo-Fi Estudio', 
      icon: <Coffee className="w-5 h-5" />, 
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      color: 'bg-orange-500'
    },
    { 
      id: 'nature', 
      name: 'Bosque Relajante', 
      icon: <TreePine className="w-5 h-5" />, 
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
      color: 'bg-emerald-500'
    },
    { 
      id: 'rain', 
      name: 'Lluvia Suave', 
      icon: <CloudRain className="w-5 h-5" />, 
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
      color: 'bg-blue-500'
    },
    { 
      id: 'waterfall', 
      name: 'Cascada Natural', 
      icon: <Waves className="w-5 h-5" />, 
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Placeholder
      color: 'bg-cyan-500'
    },
    { 
      id: 'zen', 
      name: 'Meditación Zen', 
      icon: <Wind className="w-5 h-5" />, 
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Placeholder
      color: 'bg-purple-500'
    },
    { 
      id: 'yt-study', 
      name: 'Estudio (YouTube)', 
      icon: <Youtube className="w-5 h-5" />, 
      url: 'DNrnDx-KZUY', 
      color: 'bg-red-600',
      isYoutube: true
    },
  ];

  const togglePlay = (track: Track) => {
    if (track.isYoutube) {
      if (currentTrack?.id === track.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentTrack(track);
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
      return;
    }

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play();
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-indigo-900">
            <Music className="w-6 h-6 text-indigo-500" />
            Música para Concentración
          </CardTitle>
          <CardDescription>
            Ambientes sonoros para mejorar el enfoque en clase.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-0 py-6 space-y-8">
        <audio ref={audioRef} loop />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => togglePlay(track)}
              className={`p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left relative overflow-hidden ${
                currentTrack?.id === track.id 
                  ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-100' 
                  : 'border-slate-100 bg-white hover:border-indigo-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${track.color}`}>
                {track.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{track.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {currentTrack?.id === track.id && isPlaying ? 'Reproduciendo' : 'Hacer clic para sonar'}
                </p>
              </div>
              {currentTrack?.id === track.id && isPlaying && (
                <div className="flex gap-1 items-end h-4">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 16, 4] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1 bg-indigo-500 rounded-full"
                    />
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-200">
          {currentTrack?.isYoutube && isPlaying ? (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black mb-4">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentTrack.url}?autoplay=1&controls=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <audio ref={audioRef} loop />
          )}
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/10 ${isPlaying ? 'animate-pulse' : ''}`}>
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </div>
              <div>
                <h5 className="font-bold text-sm truncate max-w-[200px]">
                  {currentTrack ? currentTrack.name : 'Selecciona una pista'}
                </h5>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {isPlaying ? 'En curso' : 'En pausa'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full sm:w-32 accent-indigo-500 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium text-center">
            💡 La música relajante ayuda a reducir la ansiedad y mejora el tiempo de concentración en tareas individuales.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
