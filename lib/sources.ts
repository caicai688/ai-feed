export interface Source {
  name: string;
  rssUrl: string;
  category: string;
  tags: string[];
}

export const sources: Source[] = [
  {
    name: 'Anthropic Blog',
    rssUrl: 'https://www.anthropic.com/rss.xml',
    category: 'AI Research',
    tags: ['Claude', 'LLM', 'AI Safety']
  },
  {
    name: 'OpenAI Blog',
    rssUrl: 'https://openai.com/blog/rss.xml',
    category: 'AI Research',
    tags: ['GPT', 'LLM', 'AI Research']
  },
  {
    name: 'MIT Technology Review AI',
    rssUrl: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    category: 'Tech News',
    tags: ['AI News', 'Tech Analysis']
  },
  {
    name: 'The Rundown AI',
    rssUrl: 'https://www.therundown.ai/feed',
    category: 'AI Newsletter',
    tags: ['AI News', 'Daily Updates']
  },
  {
    name: 'TLDR AI',
    rssUrl: 'https://tldr.tech/ai/feed',
    category: 'AI Newsletter',
    tags: ['AI News', 'Quick Read']
  },
  {
    name: 'Hugging Face Blog',
    rssUrl: 'https://huggingface.co/blog/feed.xml',
    category: 'AI Research',
    tags: ['Open Source', 'ML Models', 'AI Tools']
  },
  {
    name: 'Google AI Blog',
    rssUrl: 'https://blog.research.google/feeds/posts/default',
    category: 'AI Research',
    tags: ['Google', 'AI Research', 'DeepMind']
  },
  {
    name: 'Meta AI Blog',
    rssUrl: 'https://ai.meta.com/blog/rss/',
    category: 'AI Research',
    tags: ['Meta', 'LLaMA', 'AI Research']
  },
  {
    name: 'DeepMind Blog',
    rssUrl: 'https://deepmind.google/blog/rss.xml',
    category: 'AI Research',
    tags: ['DeepMind', 'AGI', 'Reinforcement Learning']
  },
  {
    name: 'Towards Data Science',
    rssUrl: 'https://towardsdatascience.com/feed',
    category: 'AI Community',
    tags: ['ML', 'Data Science', 'AI Tutorials']
  }
];
