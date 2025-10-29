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
  isFile?: boolean;
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

  const addGame = (name: string, url: string, type: 'link' | 'local', file?: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        const newGame: GameApp = { id: Date.now().toString(), name, url: fileData, type, isFile: true };
        const updatedGames = [...games, newGame];
        setGames(updatedGames);
        if (currentUser) saveUserData(currentUser, updatedGames, files);
        toast({ title: 'Успех', description: `Приложение "${name}" загружено` });
      };
      reader.readAsDataURL(file);
    } else {
      const newGame: GameApp = { id: Date.now().toString(), name, url, type, isFile: false };
      const updatedGames = [...games, newGame];
      setGames(updatedGames);
      if (currentUser) saveUserData(currentUser, updatedGames, files);
      toast({ title: 'Успех', description: `Игра "${name}" добавлена` });
    }
  };

  const addFile = (name: string, url: string, type: 'document' | 'image' | 'video', canViewInSite: boolean, file?: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        const newFile: FileItem = { id: Date.now().toString(), name, url: fileData, type, canViewInSite };
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        if (currentUser) saveUserData(currentUser, games, updatedFiles);
        toast({ title: 'Успех', description: `Файл "${name}" загружен` });
      };
      reader.readAsDataURL(file);
    } else {
      const newFile: FileItem = { id: Date.now().toString(), name, url, type, canViewInSite };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      if (currentUser) saveUserData(currentUser, games, updatedFiles);
      toast({ title: 'Успех', description: `Файл "${name}" добавлен` });
    }
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
        <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-foreground mb-2">ALL IN ONE</CardTitle>
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
                className="bg-input border-border/50 text-foreground focus:border-foreground/30"
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
                className="bg-input border-border/50 text-foreground focus:border-foreground/30"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти / Регистрация
            </Button>
            <Alert className="border-border/30 bg-accent/30">
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
    <div className="min-h-screen">
      <header className="border-b border-border/30 bg-card/80 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">ALL IN ONE</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Пользователь: <span className="text-foreground font-mono font-semibold">{currentUser}</span></span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-border/50 hover:bg-accent">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6 border-border/50 bg-accent/40 shadow-md animate-fade-in">
          <Icon name="Sparkles" size={20} />
          <AlertDescription className="ml-2 text-foreground font-medium">
            🚀 Скоро: Синхронизация данных между устройствами!
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border/30">
            <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Игры / Приложения
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
              <Icon name="Files" size={18} className="mr-2" />
              Файлы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Игры и Приложения</h2>
              <AddGameDialog onAdd={addGame} isOpen={isAddGameOpen} setIsOpen={setIsAddGameOpen} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="border-border/40 bg-card hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-foreground">
                      <span className="flex items-center gap-2">
                        <Icon name="Gamepad2" size={20} className="text-foreground/70" />
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
                      onClick={() => {
                        if (game.isFile) {
                          const link = document.createElement('a');
                          link.href = game.url;
                          link.download = game.name;
                          link.click();
                        } else {
                          window.open(game.url, '_blank');
                        }
                      }}
                      className="w-full bg-primary hover:bg-primary/90 shadow-md"
                    >
                      <Icon name={game.type === 'link' ? 'ExternalLink' : 'Play'} size={16} className="mr-2" />
                      Запустить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {games.length === 0 && (
              <Card className="border-border/30 bg-card/50">
                <CardContent className="py-12 text-center">
                  <Icon name="Gamepad2" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">Пока нет игр. Добавьте первую!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-foreground">Файлы</h2>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={fileFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('all')}
                  className={fileFilter === 'all' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
                >
                  Все
                </Button>
                <Button
                  variant={fileFilter === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('document')}
                  className={fileFilter === 'document' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
                >
                  <Icon name="FileText" size={14} className="mr-1" />
                  Документы
                </Button>
                <Button
                  variant={fileFilter === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('image')}
                  className={fileFilter === 'image' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
                >
                  <Icon name="Image" size={14} className="mr-1" />
                  Изображения
                </Button>
                <Button
                  variant={fileFilter === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFilter('video')}
                  className={fileFilter === 'video' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
                >
                  <Icon name="Video" size={14} className="mr-1" />
                  Видео
                </Button>
              </div>
              <AddFileDialog onAdd={addFile} isOpen={isAddFileOpen} setIsOpen={setIsAddFileOpen} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="border-border/40 bg-card hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-foreground text-base">
                      <span className="flex items-center gap-2 truncate">
                        <Icon
                          name={file.type === 'document' ? 'FileText' : file.type === 'image' ? 'Image' : 'Video'}
                          size={18}
                          className="text-foreground/70 flex-shrink-0"
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
                      className="w-full bg-primary hover:bg-primary/90 shadow-md"
                      size="sm"
                    >
                      <Icon name="ExternalLink" size={14} className="mr-2" />
                      Открыть файл
                    </Button>
                    {file.canViewInSite && (file.type === 'image' || file.type === 'video') && (
                      <Button
                        onClick={() => setViewingMedia(file)}
                        variant="outline"
                        className="w-full border-border/50 hover:bg-accent"
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
              <Card className="border-border/30 bg-card/50">
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
          <DialogContent className="max-w-4xl bg-card border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground font-bold">{viewingMedia.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {viewingMedia.type === 'image' && (
                <img src={viewingMedia.url} alt={viewingMedia.name} className="w-full h-auto rounded border border-border/30" />
              )}
              {viewingMedia.type === 'video' && (
                <video src={viewingMedia.url} controls className="w-full h-auto rounded border border-border/30">
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

function AddGameDialog({ onAdd, isOpen, setIsOpen }: { onAdd: (name: string, url: string, type: 'link' | 'local', file?: File) => void; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'link' | 'local'>('link');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (uploadMode === 'file' && name && selectedFile) {
      onAdd(name, '', type, selectedFile);
      setName('');
      setUrl('');
      setSelectedFile(null);
      setType('link');
      setUploadMode('url');
      setIsOpen(false);
    } else if (uploadMode === 'url' && name && url) {
      onAdd(name, url, type);
      setName('');
      setUrl('');
      setType('link');
      setUploadMode('url');
      setIsOpen(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!name) setName(file.name);
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
          <DialogTitle className="text-foreground font-bold">Добавить игру / приложение</DialogTitle>
          <DialogDescription>Укажите название и ссылку на игру или приложение</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMode('url')}
              className={uploadMode === 'url' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              size="sm"
            >
              <Icon name="Link" size={14} className="mr-2" />
              Ссылка/Путь
            </Button>
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              className={uploadMode === 'file' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              size="sm"
            >
              <Icon name="Upload" size={14} className="mr-2" />
              Загрузить файл
            </Button>
          </div>
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
          {uploadMode === 'url' ? (
            <div>
              <Label htmlFor="game-url">Ссылка или путь</Label>
              <Input
                id="game-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... или C:\Program Files\..."
                className="bg-input border-border/50 focus:border-foreground/30"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="game-file">Выберите файл</Label>
              <Input
                id="game-file"
                type="file"
                onChange={handleFileSelect}
                className="bg-input border-border/50 text-foreground cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:border-foreground/30"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Выбран: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}
          {uploadMode === 'url' && (
            <div className="flex gap-2">
              <Button
                variant={type === 'link' ? 'default' : 'outline'}
                onClick={() => setType('link')}
                className={type === 'link' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              >
                <Icon name="Link" size={16} className="mr-2" />
                Ссылка
              </Button>
              <Button
                variant={type === 'local' ? 'default' : 'outline'}
                onClick={() => setType('local')}
                className={type === 'local' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              >
                <Icon name="HardDrive" size={16} className="mr-2" />
                Локальный путь
              </Button>
            </div>
          )}
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 shadow-md">
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddFileDialog({ onAdd, isOpen, setIsOpen }: { onAdd: (name: string, url: string, type: 'document' | 'image' | 'video', canViewInSite: boolean, file?: File) => void; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'document' | 'image' | 'video'>('document');
  const [canViewInSite, setCanViewInSite] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (uploadMode === 'file' && name && selectedFile) {
      onAdd(name, '', type, canViewInSite, selectedFile);
      setName('');
      setUrl('');
      setSelectedFile(null);
      setType('document');
      setCanViewInSite(false);
      setUploadMode('url');
      setIsOpen(false);
    } else if (uploadMode === 'url' && name && url) {
      onAdd(name, url, type, canViewInSite);
      setName('');
      setUrl('');
      setType('document');
      setCanViewInSite(false);
      setUploadMode('url');
      setIsOpen(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!name) setName(file.name);
      
      if (file.type.startsWith('image/')) {
        setType('image');
        setCanViewInSite(true);
      } else if (file.type.startsWith('video/')) {
        setType('video');
        setCanViewInSite(true);
      } else {
        setType('document');
        setCanViewInSite(false);
      }
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
          <DialogTitle className="text-foreground font-bold">Добавить файл</DialogTitle>
          <DialogDescription>Укажите информацию о файле</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={uploadMode === 'url' ? 'default' : 'outline'}
              onClick={() => setUploadMode('url')}
              className={uploadMode === 'url' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              size="sm"
            >
              <Icon name="Link" size={14} className="mr-2" />
              Ссылка/Путь
            </Button>
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              className={uploadMode === 'file' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              size="sm"
            >
              <Icon name="Upload" size={14} className="mr-2" />
              Загрузить файл
            </Button>
          </div>
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
          {uploadMode === 'url' ? (
            <div>
              <Label htmlFor="file-url">Ссылка или путь</Label>
              <Input
                id="file-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://... или C:\Documents\..."
                className="bg-input border-border/50 focus:border-foreground/30"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="file-file">Выберите файл</Label>
              <Input
                id="file-file"
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                className="bg-input border-border/50 text-foreground cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:border-foreground/30"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Выбран: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}
          {uploadMode === 'url' && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={type === 'document' ? 'default' : 'outline'}
                onClick={() => setType('document')}
                size="sm"
                className={type === 'document' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              >
                <Icon name="FileText" size={14} className="mr-1" />
                Документ
              </Button>
              <Button
                variant={type === 'image' ? 'default' : 'outline'}
                onClick={() => setType('image')}
                size="sm"
                className={type === 'image' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              >
                <Icon name="Image" size={14} className="mr-1" />
                Изображение
              </Button>
              <Button
                variant={type === 'video' ? 'default' : 'outline'}
                onClick={() => setType('video')}
                size="sm"
                className={type === 'video' ? 'bg-primary shadow-md' : 'border-border/50 hover:bg-accent'}
              >
                <Icon name="Video" size={14} className="mr-1" />
                Видео
              </Button>
            </div>
          )}
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
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 shadow-md">
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}