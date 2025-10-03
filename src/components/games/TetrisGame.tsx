import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 20;

const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

const COLORS = ['#FF0040', '#00FFFF', '#FF00FF', '#FFA500', '#00FF00', '#FFFF00', '#FF1493'];

interface TetrisGameProps {
  onClose: () => void;
  onReward: () => void;
}

const TetrisGame = ({ onClose, onReward }: TetrisGameProps) => {
  const [board, setBoard] = useState<number[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState(SHAPES[0]);
  const [currentColor, setCurrentColor] = useState(0);
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const createNewPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    setCurrentPiece(SHAPES[shapeIndex]);
    setCurrentColor(shapeIndex);
    setPosition({ x: 4, y: 0 });
  }, []);

  const checkCollision = useCallback((piece: number[][], pos: { x: number; y: number }) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    
    currentPiece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentColor + 1;
          }
        }
      });
    });

    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      setScore(prev => prev + linesCleared * 100);
      onReward();
    }

    setBoard(newBoard);
    createNewPiece();
  }, [board, currentPiece, currentColor, position, createNewPiece, onReward]);

  const moveDown = useCallback(() => {
    const newPos = { x: position.x, y: position.y + 1 };
    if (!checkCollision(currentPiece, newPos)) {
      setPosition(newPos);
    } else {
      if (position.y <= 0) {
        setGameOver(true);
      } else {
        mergePiece();
      }
    }
  }, [position, currentPiece, checkCollision, mergePiece]);

  const moveLeft = () => {
    const newPos = { x: position.x - 1, y: position.y };
    if (!checkCollision(currentPiece, newPos)) {
      setPosition(newPos);
    }
  };

  const moveRight = () => {
    const newPos = { x: position.x + 1, y: position.y };
    if (!checkCollision(currentPiece, newPos)) {
      setPosition(newPos);
    }
  };

  const rotate = () => {
    const rotated = currentPiece[0].map((_, i) =>
      currentPiece.map(row => row[i]).reverse()
    );
    if (!checkCollision(rotated, position)) {
      setCurrentPiece(rotated);
    }
  };

  useEffect(() => {
    if (gameOver || isPaused) return;

    const interval = setInterval(moveDown, 500);
    return () => clearInterval(interval);
  }, [moveDown, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused, moveDown]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    createNewPiece();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-dark-blood/95 border-2 border-neon-blood neon-border p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-neon-blood neon-glow">Neon Tetris</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <Icon name="X" size={24} />
          </Button>
        </div>

        <div className="bg-deep-black rounded-lg p-4 mb-4 border border-neon-blood/30">
          <div
            className="relative mx-auto"
            style={{
              width: BOARD_WIDTH * CELL_SIZE,
              height: BOARD_HEIGHT * CELL_SIZE,
              backgroundColor: '#000',
            }}
          >
            {board.map((row, y) =>
              row.map((cell, x) =>
                cell ? (
                  <div
                    key={`${y}-${x}`}
                    style={{
                      position: 'absolute',
                      left: x * CELL_SIZE,
                      top: y * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: COLORS[cell - 1],
                      border: '1px solid #0D0208',
                      boxShadow: `0 0 10px ${COLORS[cell - 1]}`,
                    }}
                  />
                ) : null
              )
            )}
            {currentPiece.map((row, y) =>
              row.map((cell, x) =>
                cell ? (
                  <div
                    key={`current-${y}-${x}`}
                    style={{
                      position: 'absolute',
                      left: (position.x + x) * CELL_SIZE,
                      top: (position.y + y) * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: COLORS[currentColor],
                      border: '1px solid #0D0208',
                      boxShadow: `0 0 15px ${COLORS[currentColor]}`,
                    }}
                  />
                ) : null
              )
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-white">
            <span className="text-gray-400">Счёт:</span> <span className="text-2xl font-bold text-neon-blood">{score}</span>
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
            onClick={rotate}
            className="bg-neon-blood/20 border border-neon-blood text-neon-blood hover:bg-neon-blood hover:text-white"
          >
            <Icon name="RotateCw" size={20} />
          </Button>
          <div></div>
          <Button
            onClick={moveLeft}
            className="bg-neon-blood/20 border border-neon-blood text-neon-blood hover:bg-neon-blood hover:text-white"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <Button
            onClick={moveDown}
            className="bg-neon-blood/20 border border-neon-blood text-neon-blood hover:bg-neon-blood hover:text-white"
          >
            <Icon name="ArrowDown" size={20} />
          </Button>
          <Button
            onClick={moveRight}
            className="bg-neon-blood/20 border border-neon-blood text-neon-blood hover:bg-neon-blood hover:text-white"
          >
            <Icon name="ArrowRight" size={20} />
          </Button>
        </div>

        {gameOver && (
          <div className="text-center mb-4">
            <p className="text-neon-red text-xl font-bold mb-2 neon-glow">ИГРА ОКОНЧЕНА!</p>
            <p className="text-gray-400 mb-3">Заработано: +{score / 10} пятен</p>
            <Button
              onClick={resetGame}
              className="bg-neon-red border-2 border-neon-red text-white hover:bg-neon-red/80"
            >
              Играть снова
            </Button>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm">Стрелки: движение, ↑ поворот</p>
      </Card>
    </div>
  );
};

export default TetrisGame;
