export interface AppProtocol {
  name: string;
  protocol: string;
  description: string;
  icon: string;
  category: 'game' | 'communication' | 'media' | 'productivity' | 'dev' | 'other';
}

export const popularProtocols: AppProtocol[] = [
  { name: 'Steam', protocol: 'steam://', description: 'Игровая платформа Steam', icon: 'Gamepad2', category: 'game' },
  { name: 'Discord', protocol: 'discord://', description: 'Мессенджер Discord', icon: 'MessageCircle', category: 'communication' },
  { name: 'Telegram', protocol: 'tg://', description: 'Мессенджер Telegram', icon: 'Send', category: 'communication' },
  { name: 'Skype', protocol: 'skype:', description: 'Видеосвязь Skype', icon: 'Video', category: 'communication' },
  { name: 'Zoom', protocol: 'zoommtg://', description: 'Видеоконференции Zoom', icon: 'Users', category: 'communication' },
  { name: 'Spotify', protocol: 'spotify:', description: 'Музыкальный сервис Spotify', icon: 'Music', category: 'media' },
  { name: 'iTunes', protocol: 'itunes://', description: 'Медиаплеер iTunes', icon: 'Music', category: 'media' },
  { name: 'VLC', protocol: 'vlc://', description: 'Медиаплеер VLC', icon: 'Play', category: 'media' },
  { name: 'VS Code', protocol: 'vscode://', description: 'Редактор кода VS Code', icon: 'Code', category: 'dev' },
  { name: 'Notion', protocol: 'notion://', description: 'Notion для заметок', icon: 'FileText', category: 'productivity' },
  { name: 'Slack', protocol: 'slack://', description: 'Корпоративный мессенджер Slack', icon: 'Hash', category: 'communication' },
  { name: 'Microsoft Teams', protocol: 'msteams://', description: 'Microsoft Teams', icon: 'Users', category: 'communication' },
  { name: 'WhatsApp', protocol: 'whatsapp://', description: 'Мессенджер WhatsApp', icon: 'Phone', category: 'communication' },
  { name: 'Epic Games', protocol: 'com.epicgames.launcher://', description: 'Epic Games Store', icon: 'Gamepad2', category: 'game' },
  { name: 'Battle.net', protocol: 'battlenet://', description: 'Blizzard Battle.net', icon: 'Gamepad2', category: 'game' },
  { name: 'Origin', protocol: 'origin://', description: 'EA Origin', icon: 'Gamepad2', category: 'game' },
  { name: 'Uplay', protocol: 'uplay://', description: 'Ubisoft Connect', icon: 'Gamepad2', category: 'game' },
  { name: 'GOG Galaxy', protocol: 'goggalaxy://', description: 'GOG Galaxy', icon: 'Gamepad2', category: 'game' },
];

export const getProtocolsByCategory = (category: string) => {
  if (category === 'all') return popularProtocols;
  return popularProtocols.filter(p => p.category === category);
};

export const isCustomProtocol = (url: string): boolean => {
  return url.includes('://') && !url.startsWith('http://') && !url.startsWith('https://');
};

export const testProtocol = (protocol: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 2000);
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = protocol;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      document.body.removeChild(iframe);
      clearTimeout(timeout);
      resolve(true);
    }, 500);
  });
};
