import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: number;
  username: string;
  blood_points: number;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

interface AdminPanelProps {
  userId: number;
  onClose: () => void;
}

const AdminPanel = ({ userId, onClose }: AdminPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState('');
  
  const [musicTitle, setMusicTitle] = useState('');
  const [musicGame, setMusicGame] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicDuration, setMusicDuration] = useState('');
  
  const [partnerName, setPartnerName] = useState('');
  const [partnerUrl, setPartnerUrl] = useState('');
  const [partnerLogo, setPartnerLogo] = useState('');
  const [partnerDesc, setPartnerDesc] = useState('');

  const API_URL = 'https://functions.poehali.dev/a2f643cc-471d-443a-8c0c-df4d34efed27';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({ action: 'get_users' }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (action: string, payload: any = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString()
        },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchUsers();
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
    }
    return false;
  };

  const banUser = (id: number) => handleAction('ban_user', { user_id: id });
  const unbanUser = (id: number) => handleAction('unban_user', { user_id: id });
  const setAdmin = (id: number, isAdmin: boolean) => handleAction('set_admin', { user_id: id, is_admin: isAdmin });
  
  const addPoints = async () => {
    if (selectedUser && pointsToAdd) {
      await handleAction('add_blood_points', { user_id: selectedUser, points: parseInt(pointsToAdd) });
      setPointsToAdd('');
      setSelectedUser(null);
    }
  };

  const addMusic = async () => {
    if (musicTitle && musicGame && musicUrl && musicDuration) {
      await handleAction('add_music', {
        title: musicTitle,
        game: musicGame,
        url: musicUrl,
        duration: parseInt(musicDuration)
      });
      setMusicTitle('');
      setMusicGame('');
      setMusicUrl('');
      setMusicDuration('');
    }
  };

  const addPartner = async () => {
    if (partnerName && partnerUrl) {
      await handleAction('add_partner', {
        name: partnerName,
        url: partnerUrl,
        logo_url: partnerLogo,
        description: partnerDesc
      });
      setPartnerName('');
      setPartnerUrl('');
      setPartnerLogo('');
      setPartnerDesc('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <Card className="bg-gray-800 border-gray-700 max-w-7xl mx-auto">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-100">Админ Панель</h1>
            <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">
              <Icon name="X" size={24} />
            </Button>
          </div>

          <Tabs defaultValue="users" className="p-6">
            <TabsList className="bg-gray-700 mb-6">
              <TabsTrigger value="users" className="data-[state=active]:bg-gray-600">
                <Icon name="Users" size={16} className="mr-2" />
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="music" className="data-[state=active]:bg-gray-600">
                <Icon name="Music" size={16} className="mr-2" />
                Музыка
              </TabsTrigger>
              <TabsTrigger value="partners" className="data-[state=active]:bg-gray-600">
                <Icon name="Handshake" size={16} className="mr-2" />
                Партнеры
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-3">Добавить пятна пользователю</h3>
                <div className="flex gap-2 flex-wrap">
                  <select 
                    value={selectedUser || ''} 
                    onChange={(e) => setSelectedUser(Number(e.target.value))}
                    className="bg-gray-600 text-white border-gray-500 rounded px-3 py-2"
                  >
                    <option value="">Выберите пользователя</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Количество пятен"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white w-40"
                  />
                  <Button onClick={addPoints} className="bg-green-600 hover:bg-green-700">
                    Добавить
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Имя</th>
                      <th className="px-4 py-3 text-left">Пятна</th>
                      <th className="px-4 py-3 text-left">Статус</th>
                      <th className="px-4 py-3 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="px-4 py-3">{user.id}</td>
                        <td className="px-4 py-3">{user.username}</td>
                        <td className="px-4 py-3">{user.blood_points}</td>
                        <td className="px-4 py-3">
                          {user.is_admin && <span className="bg-yellow-600 px-2 py-1 rounded text-xs mr-1">Admin</span>}
                          {user.is_banned && <span className="bg-red-600 px-2 py-1 rounded text-xs">Banned</span>}
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          {user.is_banned ? (
                            <Button size="sm" onClick={() => unbanUser(user.id)} className="bg-green-600 hover:bg-green-700">
                              Разбанить
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => banUser(user.id)} className="bg-red-600 hover:bg-red-700">
                              Забанить
                            </Button>
                          )}
                          {!user.is_admin ? (
                            <Button size="sm" onClick={() => setAdmin(user.id, true)} className="bg-yellow-600 hover:bg-yellow-700">
                              Сделать админом
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => setAdmin(user.id, false)} className="bg-gray-600 hover:bg-gray-700">
                              Снять админа
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <Card className="bg-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Добавить музыку</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Название</Label>
                    <Input
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Игра</Label>
                    <Input
                      value={musicGame}
                      onChange={(e) => setMusicGame(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">URL</Label>
                    <Input
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Длительность (сек)</Label>
                    <Input
                      type="number"
                      value={musicDuration}
                      onChange={(e) => setMusicDuration(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>
                <Button onClick={addMusic} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Добавить трек
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="space-y-4">
              <Card className="bg-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Добавить партнера</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Название</Label>
                    <Input
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">URL сайта</Label>
                    <Input
                      value={partnerUrl}
                      onChange={(e) => setPartnerUrl(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">URL логотипа</Label>
                    <Input
                      value={partnerLogo}
                      onChange={(e) => setPartnerLogo(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Описание</Label>
                    <Input
                      value={partnerDesc}
                      onChange={(e) => setPartnerDesc(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>
                <Button onClick={addPartner} className="mt-4 bg-purple-600 hover:bg-purple-700">
                  Добавить партнера
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
