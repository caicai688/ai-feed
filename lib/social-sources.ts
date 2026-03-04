export interface YouTubeChannel {
  id: string;
  name: string;
  channelId: string;
  tags: string[];
}

export interface TwitterAccount {
  id: string;
  name: string;
  username: string;
  tags: string[];
}

// YouTube 频道配置
export const youtubeChannels: YouTubeChannel[] = [
  {
    id: 'yt-1',
    name: 'OpenAI',
    channelId: 'UCXZCJLdBC09xxGZ6gcdrc6A',
    tags: ['OpenAI', 'GPT', 'Demo']
  },
  {
    id: 'yt-2',
    name: 'Anthropic',
    channelId: 'UC3FGAtGzL_vTkXIcLNkpVtA',
    tags: ['Claude', 'AI Safety', 'Demo']
  },
  {
    id: 'yt-3',
    name: 'Google DeepMind',
    channelId: 'UCP7jMXSY2xbc3KCAE0MHQ-A',
    tags: ['DeepMind', 'AGI', 'Research']
  },
  {
    id: 'yt-4',
    name: 'Lex Fridman',
    channelId: 'UCSHZKyawb77ixDdsGog4iWA',
    tags: ['Interview', 'AI Discussion', 'Podcast']
  },
  {
    id: 'yt-5',
    name: 'Two Minute Papers',
    channelId: 'UCbfYPyITQ-7l4upoX8nvctg',
    tags: ['AI Research', 'Paper Review', 'Visualization']
  }
];

// X/Twitter 账号配置
export const twitterAccounts: TwitterAccount[] = [
  {
    id: 'x-1',
    name: 'Sam Altman',
    username: 'sama',
    tags: ['OpenAI', 'CEO', 'Industry']
  },
  {
    id: 'x-2',
    name: 'Dario Amodei',
    username: 'DarioAmodei',
    tags: ['Anthropic', 'CEO', 'AI Safety']
  },
  {
    id: 'x-3',
    name: 'Yann LeCun',
    username: 'ylecun',
    tags: ['Meta', 'AI Research', 'Deep Learning']
  },
  {
    id: 'x-4',
    name: 'Andrew Ng',
    username: 'AndrewYNg',
    tags: ['Education', 'AI Leader', 'ML']
  },
  {
    id: 'x-5',
    name: 'Greg Brockman',
    username: 'gdb',
    tags: ['OpenAI', 'CTO', 'Engineering']
  },
  {
    id: 'x-6',
    name: 'Andrej Karpathy',
    username: 'karpathy',
    tags: ['AI Research', 'Education', 'Former Tesla']
  },
  {
    id: 'x-7',
    name: 'Ilya Sutskever',
    username: 'ilyasut',
    tags: ['OpenAI', 'Research', 'Deep Learning']
  },
  {
    id: 'x-8',
    name: 'Demis Hassabis',
    username: 'demishassabis',
    tags: ['DeepMind', 'CEO', 'AGI']
  }
];
