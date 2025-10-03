import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface Track {
  id: number;
  title: string;
  game: string;
  url: string;
  duration: number;
}

const tracks: Track[] = [
  { id: 1, title: 'BFG Division', game: 'DOOM (2016)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 352 },
  { id: 2, title: 'The Only Thing They Fear Is You', game: 'DOOM Eternal', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 261 },
  { id: 3, title: 'Hellwalker', game: 'DOOM (2016)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 244 },
  { id: 4, title: 'Cultist Base', game: 'DOOM Eternal', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 289 },
];

const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => nextTrack();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const previousTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  return (
    <Card className={`fixed bottom-6 right-6 bg-dark-blood/95 border-2 border-neon-red/50 neon-border backdrop-blur-md z-50 transition-all duration-300 ${isMinimized ? 'w-16' : 'w-80'} animate-blood-drip`}>
      <audio ref={audioRef} src={currentTrack.url} />
      
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-neon-red/20 p-2 rounded-lg border border-neon-red/50">
            <Icon name="Music" className="text-neon-red" size={24} />
          </div>
          {!isMinimized && (
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-gray-400 truncate">{currentTrack.game}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white hover:bg-neon-red/20 ml-auto"
          >
            <Icon name={isMinimized ? "Maximize2" : "Minimize2"} size={16} />
          </Button>
        </div>

        {!isMinimized && (
          <>
            <div className="space-y-2 mb-3">
              <Slider
                value={[currentTime]}
                max={currentTrack.duration}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousTrack}
                className="text-electric-cyan hover:text-electric-cyan/80 hover:bg-electric-cyan/10"
              >
                <Icon name="SkipBack" size={20} />
              </Button>

              <Button
                onClick={togglePlay}
                className="bg-neon-red/20 border-2 border-neon-red text-neon-red hover:bg-neon-red hover:text-white transition-all duration-300 w-12 h-12 rounded-full"
              >
                {isPlaying ? <Icon name="Pause" size={20} /> : <Icon name="Play" size={20} />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                className="text-electric-cyan hover:text-electric-cyan/80 hover:bg-electric-cyan/10"
              >
                <Icon name="SkipForward" size={20} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Icon name="Volume2" className="text-gray-400" size={16} />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-8 text-right">{volume}%</span>
            </div>

            <div className="mt-3 pt-3 border-t border-neon-red/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Трек {currentTrackIndex + 1} из {tracks.length}</span>
                <div className="flex items-center gap-1 text-neon-blood">
                  <Icon name="Skull" size={12} />
                  <span className="font-bold">DOOM OST</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default MusicPlayer;