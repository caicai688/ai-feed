import { NextResponse } from 'next/server';

export interface DailySummary {
  date: string;
  summary: string;
  topStories: Array<{
    title: string;
    source: string;
    url: string;
    reason: string;
  }>;
  trends: string[];
  generatedAt: string;
}

export async function GET() {
  try {
    // 获取昨天的日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // 获取所有数据
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/collect`,
      { next: { revalidate: 3600 } } // 缓存1小时
    );
    const data = await response.json();

    if (!data.success) {
      throw new Error('Failed to fetch feeds');
    }

    // 过滤昨天的数据
    const yesterdayItems = data.items.filter((item: any) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.toISOString().split('T')[0] === dateStr ||
        yesterday.getTime() - itemDate.getTime() < 48 * 60 * 60 * 1000 // 48小时内
      );
    });

    // 使用简单的算法选择重点内容
    // 生产环境建议使用 AI 模型（如 OpenAI GPT-4）进行总结
    const topStories = selectTopStories(yesterdayItems);
    const trends = extractTrends(yesterdayItems);
    const summary = generateSummary(topStories, trends, dateStr);

    const dailySummary: DailySummary = {
      date: dateStr,
      summary,
      topStories,
      trends,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: dailySummary,
      totalItems: yesterdayItems.length
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily summary' },
      { status: 500 }
    );
  }
}

function selectTopStories(items: any[]): DailySummary['topStories'] {
  // 优先级评分系统
  const scoredItems = items.map(item => {
    let score = 0;
    
    // 来源权重
    const highPrioritySources = ['OpenAI', 'Anthropic', 'Google AI', 'DeepMind'];
    if (highPrioritySources.some(s => item.source.includes(s))) {
      score += 10;
    }
    
    // 关键词权重
    const keywords = [
      'GPT', 'Claude', 'breakthrough', 'launch', 'announce', 'release',
      '发布', '推出', '突破', 'AGI', 'model', '模型'
    ];
    const text = `${item.title} ${item.summary}`.toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 5;
      }
    });
    
    // 标签权重
    if (item.tags.some((t: string) => ['LLM', 'AI Research', 'GPT'].includes(t))) {
      score += 3;
    }
    
    return { ...item, score };
  });

  // 排序并选择前5条
  const top = scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return top.map(item => ({
    title: item.title,
    source: item.source,
    url: item.url,
    reason: generateReason(item)
  }));
}

function generateReason(item: any): string {
  const reasons = [];
  
  if (['OpenAI', 'Anthropic', 'DeepMind'].some(s => item.source.includes(s))) {
    reasons.push('来自顶级 AI 公司');
  }
  
  const text = `${item.title} ${item.summary}`.toLowerCase();
  if (text.includes('gpt') || text.includes('claude')) {
    reasons.push('涉及主流 AI 模型');
  }
  
  if (text.includes('breakthrough') || text.includes('突破')) {
    reasons.push('技术突破');
  }
  
  if (text.includes('release') || text.includes('launch') || text.includes('发布')) {
    reasons.push('新产品发布');
  }
  
  return reasons.length > 0 ? reasons.join('、') : '重要更新';
}

function extractTrends(items: any[]): string[] {
  // 统计高频标签和关键词
  const tagCount: Record<string, number> = {};
  const keywords: Record<string, number> = {};

  items.forEach(item => {
    // 统计标签
    item.tags.forEach((tag: string) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });

    // 统计关键词
    const text = `${item.title} ${item.summary}`;
    const keywordList = [
      'GPT', 'Claude', 'LLaMA', 'Gemini', 'AI Safety', 'AGI',
      'Multimodal', 'Vision', 'Code', 'Reasoning', 'Training'
    ];
    
    keywordList.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords[keyword] = (keywords[keyword] || 0) + 1;
      }
    });
  });

  // 合并并排序
  const trends = [
    ...Object.entries(tagCount).map(([tag, count]) => ({ name: tag, count })),
    ...Object.entries(keywords).map(([word, count]) => ({ name: word, count }))
  ];

  return trends
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(t => t.name);
}

function generateSummary(
  topStories: DailySummary['topStories'],
  trends: string[],
  date: string
): string {
  const parts = [];
  
  parts.push(`📅 ${date} AI 领域动态总结：`);
  parts.push('');
  parts.push(`今日共收集到 ${topStories.length} 条重要资讯。`);
  
  if (trends.length > 0) {
    parts.push('');
    parts.push(`🔥 热门话题：${trends.slice(0, 5).join('、')}`);
  }
  
  if (topStories.length > 0) {
    parts.push('');
    parts.push('📰 重点关注：');
    topStories.forEach((story, i) => {
      parts.push(`${i + 1}. ${story.title} - ${story.source}`);
    });
  }
  
  return parts.join('\n');
}
