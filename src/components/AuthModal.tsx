import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  username: string;
  blood_points: number;
}

interface AuthModalProps {
  onClose: () => void;
  onAuth: (user: User, token: string) => void;
}

const AuthModal = ({ onClose, onAuth }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/47279c49-bea2-4d75-a5ea-7f9cc30fa563', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isLogin ? 'login' : 'register',
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onAuth(data.user, data.token);
        onClose();
      } else {
        setError(data.error || 'Ошибка аутентификации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-dark-blood/95 border-2 border-neon-red neon-border p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neon-red neon-glow">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <Icon name="X" size={24} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-white mb-2 block">
              Имя пользователя
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-deep-black border-electric-cyan/30 text-white focus:border-electric-cyan"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white mb-2 block">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-deep-black border-electric-cyan/30 text-white focus:border-electric-cyan"
              required
            />
          </div>

          {error && (
            <div className="bg-neon-red/20 border border-neon-red rounded p-3 text-neon-red text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-red border-2 border-neon-red text-white hover:bg-neon-red/80"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-electric-cyan hover:text-electric-cyan/80 text-sm"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AuthModal;