import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  username: string;
  password: string;
}

interface GameApp {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'local';
}

interface FileItem {
  id: string;
  name: string;
  url: string;
  type: 'document' | 'image' | 'video';
  canViewInSite: boolean;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [games, setGames] = useState<GameApp[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [fileFilter, setFileFilter] = useState<'all' | 'document' | 'image' | 'video'>('all');
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<FileItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
      loadUserData(savedUser);
    }
  }, []);

  const loadUserData = (username: string) => {
    const userGames = localStorage.getItem(`${username}_games`);
    const userFiles = localStorage.getItem(`${username}_files`);
    
    if (userGames) setGames(JSON.parse(userGames));
    if (userFiles) setFiles(JSON.parse(userFiles));
  };

  const saveUserData = (username: string, gamesData: GameApp[], filesData: FileItem[]) => {
    localStorage.setItem(`${username}_games`, JSON.stringify(gamesData));
    localStorage.setItem(`${username}_files`, JSON.stringify(filesData));
  };

  const handleLogin = () => {
    if (!loginUsername || !loginPassword) {
      toast({ title: 'Ошибка', description: 'Введите логин и пароль', variant: 'destructive' });
      return;
    }

    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.username === loginUsername);

    if (existingUser) {
      if (existingUser.password === loginPassword) {
        setCurrentUser(loginUsername);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', loginUsername);
        loadUserData(loginUsername);
        toast({ title: 'Добро пожаловать!', description: `Вход выполнен: ${loginUsername}` });
      } else {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
      }
    } else {
      users.push({ username: loginUsername, password: loginPassword });
      localStorage.setItem('users', JSON.stringify(users));
      setCurrentUser(loginUsername);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', loginUsername);
      toast({ title: 'Регистрация', description: `Новый пользователь создан: ${loginUsername}` });
    }

    setLoginUsername('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    if (currentUser) {
      saveUserData(currentUser, games, files);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setGames([]);
    setFiles([]);
    toast({ title: 'Выход', description: 'Вы вышли из системы' });
  };

  const addGame = (name: string, url: string, type: 'link' | 'local') => {
    const newGame: GameApp = { id: Date.now().toString(), name, url, type };
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    if (currentUser) saveUserData(currentUser, updatedGames, files);
    toast({ title: 'Успех', description: `Игра "${name}" добавлена` });
  };

  const addFile = (name: string, url: string, type: 'document' | 'image' | 'video', canViewInSite: boolean) => {
    const newFile: FileItem = { id: Date.now().toString(), name, url, type, canViewInSite };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    if (currentUser) saveUserData(currentUser, games, updatedFiles);
    toast({ title: 'Успех', description: `Файл "${name}" добавлен` });
  };

  const deleteGame = (id: string) => {
    const updatedGames = games.filter(g => g.id !== id);
    setGames(updatedGames);
    if (currentUser) saveUserData(currentUser, updatedGames, files);
  };

  const deleteFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    if (currentUser) saveUserData(currentUser, games, updatedFiles);
  };

  const filteredFiles = fileFilter === 'all' ? files : files.filter(f => f.type === fileFilter);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid p-4">
        <Card className="w-full max-w-md border-primary/30 neon-border bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-orbitron neon-glow text-primary mb-2">ALL IN ONE</CardTitle>
            <CardDescription className="text-muted-foreground">Персональное хранилище данных</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Логин</Label>
              <Input
                id="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Введите логин"
                className="bg-secondary border-primary/30 text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Введите пароль"
                className="bg-secondary border-primary/30 text-foreground"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full neon-border bg-primary text-primary-foreground hover:bg-primary/80">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти / Регистрация
            </Button>
            <Alert className="border-accent/50 bg-accent/20">
              <Icon name="Info" size={18} />
              <AlertDescription className="text-xs text-muted-foreground ml-2">
                Если пользователь не существует, он будет создан автоматически
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      <header className="border-b border-primary/30 bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-orbitron font-bold neon-glow text-primary">ALL IN ONE</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Пользователь: <span className="text-primary font-mono">{currentUser}</span></span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-primary/30 neon-border">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6 border-primary/50 bg-accent/30 neon-border animate-glow-pulse">
          <Icon name="Sparkles" size={20} />
          <AlertDescription className="ml-2 text-accent-foreground font-semibold">
            🚀 Скоро: Синхронизация данных между устройствами!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 border border-primary/30">
            <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Игры / Приложения
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Files" size={18} className="mr-2" />
              Файлы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-orbitron text-primary">Игры и Приложения</h2>
              <AddGameDialog onAdd={addGame} isOpen={isAddGameOpen} setIsOpen={setIsAddGameOpen} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="border-primary/30 bg-card/90 hover:neon-border transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-foreground">
                      <span className="flex items-center gap-2">
                        <Icon name="Gamepad2" size={20} className="text-primary" />
                        {game.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGame(game.id)}
                        className="text-destructive hover:bg-destructive/20"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => window.open(game.url, '_blank')}
                      className="w-full neon-border bg-primary/80 hover:bg-primary"
                    >
                      <Icon name={game.type === 'link' ? 'ExternalLink' : 'Play'} size={16} className="mr-2" />
                      Запустить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {games.length === 0 && (
              <Card className="border-primary/20 bg-card/50">
                <CardContent className="py-12 text-center">
                  <Icon name="Gamepad2" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">Пока нет игр. Добавьте первую!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-orbitron text-primary">Файлы</h2>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={fileFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('all')}
                  className={fileFilter === 'all' ? 'bg-primary' : 'border-primary/30'}
                >
                  Все
                </Button>
                <Button
                  variant={fileFilter === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('document')}
                  className={fileFilter === 'document' ? 'bg-primary' : 'border-primary/30'}
                >
                  <Icon name="FileText" size={14} className="mr-1" />
                  Документы
                </Button>
                <Button
                  variant={fileFilter === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('image')}
                  className={fileFilter === 'image' ? 'bg-primary' : 'border-primary/30'}
                >
                  <Icon name="Image" size={14} className="mr-1" />
                  Изображения
                </Button>
                <Button
                  variant={fileFilter === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('video')}
                  className={fileFilter === 'video' ? 'bg-primary' : 'border-primary/30'}
                >
                  <Icon name="Video" size={14} className="mr-1" />
                  Видео
                </Button>
              </div>
              <AddFileDialog onAdd={addFile} isOpen={isAddFileOpen} setIsOpen={setIsAddFileOpen} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="border-primary/30 bg-card/90 hover:neon-border transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-foreground text-base">
                      <span className="flex items-center gap-2 truncate">
                        <Icon
                          name={file.type === 'document' ? 'FileText' : file.type === 'image' ? 'Image' : 'Video'}
                          size={18}
                          className="text-primary flex-shrink-0"
                        />
                        <span className="truncate">{file.name}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFile(file.id)}
                        className="text-destructive hover:bg-destructive/20 flex-shrink-0"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => window.open(file.url, '_blank')}
                      className="w-full neon-border bg-primary/80 hover:bg-primary"
                      size="sm"
                    >
                      <Icon name="ExternalLink" size={14} className="mr-2" />
                      Открыть файл
                    </Button>
                    {file.canViewInSite && (file.type === 'image' || file.type === 'video') && (
                      <Button
                        onClick={() => setViewingMedia(file)}
                        variant="outline"
                        className="w-full border-primary/30"
                        size="sm"
                      >
                        <Icon name="Eye" size={14} className="mr-2" />
                        Просмотр на сайте
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFiles.length === 0 && (
              <Card className="border-primary/20 bg-card/50">
                <CardContent className="py-12 text-center">
                  <Icon name="Files" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">Файлы не найдены. Добавьте первый!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {viewingMedia && (
        <Dialog open={!!viewingMedia} onOpenChange={() => setViewingMedia(null)}>
          <DialogContent className="max-w-4xl bg-card border-primary/50 neon-border">
            <DialogHeader>
              <DialogTitle className="text-primary font-orbitron">{viewingMedia.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {viewingMedia.type === 'image' && (
                <img src={viewingMedia.url} alt={viewingMedia.name} className="w-full h-auto rounded border border-primary/30" />
              )}
              {viewingMedia.type === 'video' && (
                <video src={viewingMedia.url} controls className="w-full h-auto rounded border border-primary/30">
                  Ваш браузер не поддерживает видео.
                </video>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddGameDialog({ onAdd, isOpen, setIsOpen }: { onAdd: (name: string, url: string, type: 'link' | 'local') => void; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'link' | 'local'>('link');

  const handleSubmit = () => {
    if (name && url) {
      onAdd(name, url, type);
      setName('');
      setUrl('');
      setType('link');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="neon-border bg-primary hover:bg-primary/80">
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить игру
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/50 neon-border">
        <DialogHeader>
          <DialogTitle className="text-primary font-orbitron">Добавить игру / приложение</DialogTitle>
          <DialogDescription>Укажите название и ссылку на игру или приложение</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="game-name">Название</Label>
            <Input
              id="game-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Steam, Epic Games"
              className="bg-secondary border-primary/30"
            />
          </div>
          <div>
            <Label htmlFor="game-url">Ссылка или путь</Label>
            <Input
              id="game-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... или C:\Program Files\..."
              className="bg-secondary border-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={type === 'link' ? 'default' : 'outline'}
              onClick={() => setType('link')}
              className={type === 'link' ? 'bg-primary' : 'border-primary/30'}
            >
              <Icon name="Link" size={16} className="mr-2" />
              Ссылка
            </Button>
            <Button
              variant={type === 'local' ? 'default' : 'outline'}
              onClick={() => setType('local')}
              className={type === 'local' ? 'bg-primary' : 'border-primary/30'}
            >
              <Icon name="HardDrive" size={16} className="mr-2" />
              Локальный путь
            </Button>
          </div>
          <Button onClick={handleSubmit} className="w-full neon-border bg-primary hover:bg-primary/80">
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddFileDialog({ onAdd, isOpen, setIsOpen }: { onAdd: (name: string, url: string, type: 'document' | 'image' | 'video', canViewInSite: boolean) => void; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'document' | 'image' | 'video'>('document');
  const [canViewInSite, setCanViewInSite] = useState(false);

  const handleSubmit = () => {
    if (name && url) {
      onAdd(name, url, type, canViewInSite);
      setName('');
      setUrl('');
      setType('document');
      setCanViewInSite(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="neon-border bg-primary hover:bg-primary/80">
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить файл
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary/50 neon-border">
        <DialogHeader>
          <DialogTitle className="text-primary font-orbitron">Добавить файл</DialogTitle>
          <DialogDescription>Укажите информацию о файле</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-name">Название</Label>
            <Input
              id="file-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Отчет 2024"
              className="bg-secondary border-primary/30"
            />
          </div>
          <div>
            <Label htmlFor="file-url">Ссылка или путь</Label>
            <Input
              id="file-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... или C:\Documents\..."
              className="bg-secondary border-primary/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={type === 'document' ? 'default' : 'outline'}
              onClick={() => setType('document')}
              size="sm"
              className={type === 'document' ? 'bg-primary' : 'border-primary/30'}
            >
              <Icon name="FileText" size={14} className="mr-1" />
              Документ
            </Button>
            <Button
              variant={type === 'image' ? 'default' : 'outline'}
              onClick={() => setType('image')}
              size="sm"
              className={type === 'image' ? 'bg-primary' : 'border-primary/30'}
            >
              <Icon name="Image" size={14} className="mr-1" />
              Изображение
            </Button>
            <Button
              variant={type === 'video' ? 'default' : 'outline'}
              onClick={() => setType('video')}
              size="sm"
              className={type === 'video' ? 'bg-primary' : 'border-primary/30'}
            >
              <Icon name="Video" size={14} className="mr-1" />
              Видео
            </Button>
          </div>
          {(type === 'image' || type === 'video') && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="view-in-site"
                checked={canViewInSite}
                onChange={(e) => setCanViewInSite(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <Label htmlFor="view-in-site" className="cursor-pointer">Разрешить просмотр внутри сайта</Label>
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full neon-border bg-primary hover:bg-primary/80">
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
