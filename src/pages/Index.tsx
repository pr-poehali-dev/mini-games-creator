import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Game {
  id: number;
  title: string;
  description: string;
  cost: number;
  isFree: boolean;
  icon: string;
}

const Index = () => {
  const [bloodPoints, setBloodPoints] = useState(0);

  const freeGames: Game[] = [
    { id: 1, title: 'Snake Carnage', description: 'Классическая змейка с кровавыми эффектами', cost: 0, isFree: true, icon: 'Gamepad2' },
    { id: 2, title: 'Neon Tetris', description: 'Тетрис в неоновом стиле', cost: 0, isFree: true, icon: 'Grid3x3' },
    { id: 3, title: 'Blood Runner', description: 'Бегалка по мрачным коридорам', cost: 0, isFree: true, icon: 'Zap' },
  ];

  const premiumGames: Game[] = [
    { id: 4, title: 'Doom Arena', description: 'FPS шутер в арена режиме', cost: 500, isFree: false, icon: 'Crosshair' },
    { id: 5, title: 'Mario Nightmare', description: 'Платформер с темным сюжетом', cost: 300, isFree: false, icon: 'Ghost' },
    { id: 6, title: 'Doodle Hell Jump', description: 'Прыжки в адскую бездну', cost: 200, isFree: false, icon: 'Flame' },
  ];

  const playGame = (game: Game) => {
    if (game.isFree) {
      setBloodPoints(prev => prev + 10);
    } else if (bloodPoints >= game.cost) {
      setBloodPoints(prev => prev - game.cost);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-black via-dark-blood to-deep-black">
      <nav className="border-b border-neon-red/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-black text-neon-red neon-glow tracking-wider">
            GAME PORTAL
          </h1>
          <div className="flex items-center gap-4">
            <Badge className="bg-dark-blood border-2 border-neon-blood blood-glow px-6 py-2 text-lg">
              <Icon name="Droplet" className="mr-2 text-neon-blood" size={20} />
              <span className="text-white font-bold">{bloodPoints}</span>
            </Badge>
            <Button className="bg-electric-cyan/20 border-2 border-electric-cyan text-electric-cyan hover:bg-electric-cyan hover:text-black transition-all duration-300">
              <Icon name="DollarSign" className="mr-2" size={18} />
              Купить пятна
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center relative">
          <div className="absolute inset-0 bg-neon-red/5 blur-3xl rounded-full"></div>
          <h2 className="text-6xl md:text-8xl font-black mb-4 relative">
            <span className="text-neon-red neon-glow animate-neon-pulse">BRUTAL</span>
            <br />
            <span className="text-electric-cyan cyan-glow">ARCADE</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto relative">
            Играй в ретро-игры, зарабатывай кровавые пятна и открывай легендарные аркады
          </p>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Icon name="Sparkles" className="text-electric-cyan" size={32} />
            <h3 className="text-3xl font-bold text-electric-cyan cyan-glow">Бесплатные мини-игры</h3>
          </div>
          <p className="text-gray-400 mb-6">Играй бесплатно и зарабатывай кровавые пятна за каждую игру</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeGames.map((game) => (
              <Card 
                key={game.id} 
                className="bg-dark-blood/50 border-2 border-electric-cyan/30 hover:border-electric-cyan transition-all duration-300 p-6 group hover:scale-105 cursor-pointer backdrop-blur-sm animate-blood-drip"
                onClick={() => playGame(game)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-electric-cyan/10 p-3 rounded-lg border border-electric-cyan/30">
                    <Icon name={game.icon as any} className="text-electric-cyan" size={32} />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">
                    БЕСПЛАТНО
                  </Badge>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-electric-cyan transition-colors">
                  {game.title}
                </h4>
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                <div className="flex items-center gap-2 text-green-400">
                  <Icon name="Plus" size={16} />
                  <span className="text-sm font-semibold">+10 пятен за игру</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <Icon name="Skull" className="text-neon-blood" size={32} />
            <h3 className="text-3xl font-bold text-neon-blood neon-glow">Премиум игры за валюту</h3>
          </div>
          <p className="text-gray-400 mb-6">Используй кровавые пятна чтобы открыть легендарные игры</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumGames.map((game) => (
              <Card 
                key={game.id} 
                className={`bg-dark-blood/50 border-2 p-6 group cursor-pointer backdrop-blur-sm transition-all duration-300 animate-blood-drip ${
                  bloodPoints >= game.cost 
                    ? 'border-neon-blood/50 hover:border-neon-blood blood-glow hover:scale-105' 
                    : 'border-red-900/30 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => playGame(game)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-neon-blood/10 p-3 rounded-lg border border-neon-blood/30">
                    <Icon name={game.icon as any} className="text-neon-blood" size={32} />
                  </div>
                  <Badge className="bg-neon-blood/20 text-neon-blood border border-neon-blood/50">
                    {game.cost} <Icon name="Droplet" size={14} className="inline ml-1" />
                  </Badge>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-neon-blood transition-colors">
                  {game.title}
                </h4>
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                {bloodPoints >= game.cost ? (
                  <div className="flex items-center gap-2 text-neon-blood">
                    <Icon name="Unlock" size={16} />
                    <span className="text-sm font-semibold">Нажми чтобы играть</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500/70">
                    <Icon name="Lock" size={16} />
                    <span className="text-sm">Не хватает {game.cost - bloodPoints} пятен</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neon-red/30 mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            <span className="text-neon-red neon-glow font-bold">GAME PORTAL</span> © 2025 - Погрузись в неоновый кошмар
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
