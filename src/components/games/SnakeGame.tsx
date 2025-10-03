import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

interface SnakeGameProps {
  onClose: () => void;
  onReward: () => void;
}

const SnakeGame = ({ onClose, onReward }: SnakeGameProps) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const directionRef = useRef(direction);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    generateFood();
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      const newDirection = { ...directionRef.current };
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = -1;
          }
          break;
        case 'ArrowDown':
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = 1;
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current.x === 0) {
            newDirection.x = -1;
            newDirection.y = 0;
          }
          break;
        case 'ArrowRight':
          if (directionRef.current.x === 0) {
            newDirection.x = 1;
            newDirection.y = 0;
          }
          break;
      }
      
      setDirection(newDirection);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE ||
          prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10);
          generateFood();
          onReward();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [gameOver, isPaused, food, generateFood, onReward]);

  const handleDirectionClick = (newDir: Position) => {
    if (gameOver) return;
    
    if (newDir.x !== 0 && directionRef.current.x === 0) {
      setDirection(newDir);
    } else if (newDir.y !== 0 && directionRef.current.y === 0) {
      setDirection(newDir);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-dark-blood/95 border-2 border-electric-cyan neon-border p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-electric-cyan cyan-glow">Snake Carnage</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="bg-deep-black rounded-lg p-4 mb-4 border border-electric-cyan/30">
          <div
            className="relative mx-auto"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
              backgroundColor: '#000',
            }}
          >
            {snake.map((segment, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: index === 0 ? '#00FFFF' : '#00FFFF',
                  border: '1px solid #0D0208',
                  boxShadow: '0 0 10px #00FFFF',
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: '#FF0040',
                border: '1px solid #0D0208',
                boxShadow: '0 0 15px #FF0040',
                borderRadius: '50%',
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-white">
            <span className="text-gray-400">Счёт:</span> <span className="text-2xl font-bold text-electric-cyan">{score}</span>
          </div>
          <Button
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver}
            className="bg-neon-red/20 border border-neon-red text-neon-red hover:bg-neon-red hover:text-white"
          >
            {isPaused ? <Icon name="Play" size={16} /> : <Icon name="Pause" size={16} />}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div></div>
          <Button
            onClick={() => handleDirectionClick({ x: 0, y: -1 })}
            className="bg-electric-cyan/20 border border-electric-cyan text-electric-cyan hover:bg-electric-cyan hover:text-black"
          >
            <Icon name="ArrowUp" size={20} />
          </Button>
          <div></div>
          <Button
            onClick={() => handleDirectionClick({ x: -1, y: 0 })}
            className="bg-electric-cyan/20 border border-electric-cyan text-electric-cyan hover:bg-electric-cyan hover:text-black"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div></div>
          <Button
            onClick={() => handleDirectionClick({ x: 1, y: 0 })}
            className="bg-electric-cyan/20 border border-electric-cyan text-electric-cyan hover:bg-electric-cyan hover:text-black"
          >
            <Icon name="ArrowRight" size={20} />
          </Button>
          <div></div>
          <Button
            onClick={() => handleDirectionClick({ x: 0, y: 1 })}
            className="bg-electric-cyan/20 border border-electric-cyan text-electric-cyan hover:bg-electric-cyan hover:text-black"
          >
            <Icon name="ArrowDown" size={20} />
          </Button>
          <div></div>
        </div>

        {gameOver && (
          <div className="text-center mb-4">
            <p className="text-neon-red text-xl font-bold mb-2 neon-glow">ИГРА ОКОНЧЕНА!</p>
            <p className="text-gray-400 mb-3">Заработано: +{score} пятен</p>
            <Button
              onClick={resetGame}
              className="bg-neon-red border-2 border-neon-red text-white hover:bg-neon-red/80"
            >
              Играть снова
            </Button>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm">Используй стрелки или кнопки для управления</p>
      </Card>
    </div>
  );
};

export default SnakeGame;
