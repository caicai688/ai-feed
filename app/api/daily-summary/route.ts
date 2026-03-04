import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: Request) {
  try {
    // 获取昨天的日期
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // 获取所有数据 - 使用请求的 origin 构建完整 URL
    const origin = request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      : 'http://localhost:3002';
    
    // 获取所有类型的数据
    const [rssResponse, youtubeResponse, twitterResponse] = await Promise.all([
      fetch(`${origin}/api/collect?rssOnly=true`, { cache: 'no-store' }),
      fetch(`${origin}/api/youtube`, { cache: 'no-store' }),
      fetch(`${origin}/api/twitter`, { cache: 'no-store' })
    ]);

    const rssData = await rssResponse.json();
    const youtubeData = await youtubeResponse.json();
    const twitterData = await twitterResponse.json();

    // 合并所有数据
    const allItems = [
      ...(rssData.success ? rssData.items : []),
      ...(youtubeData.success ? youtubeData.items : []),
      ...(twitterData.success ? twitterData.items : [])
    ];

    if (allItems.length === 0) {
      throw new Error('No data available');
    }

    // 过滤最新一天的数据（最近24小时）
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentItems = allItems
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= oneDayAgo;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // 最多取30条最新的

    if (recentItems.length === 0) {
      throw new Error('No recent items found');
    }

    // 使用 Gemini 生成总结
    const summary = await generateAISummary(recentItems, dateStr);
    
    // 选择前5条作为重点资讯
    const topStories = recentItems.slice(0, 5).map(item => ({
      title: item.title,
      source: item.source,
      url: item.url,
      reason: getItemReason(item)
    }));

    // 提取趋势标签
    const trends = extractTrends(recentItems);

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
      totalItems: recentItems.length
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily summary' },
      { status: 500 }
    );
  }
}

async function generateAISummary(items: any[], date: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      throw new Error('API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 准备内容摘要
    const contentSummary = items.slice(0, 20).map((item, index) => {
      let content = `${index + 1}. [${item.source}] ${item.title}`;
      if (item.summary && item.summary.length < 200) {
        content += `\n   ${item.summary.substring(0, 150)}`;
      }
      return content;
    }).join('\n\n');

    const prompt = `你是一个 AI 资讯分析专家。请根据以下最新的 AI 领域资讯，生成一份简洁的每日总结。

日期: ${date}
资讯数量: ${items.length} 条

最新资讯:
${contentSummary}

请生成一份简洁的总结（200-300字），包括：
1. 今日 AI 领域的主要动态概览
2. 最值得关注的2-3个重点话题
3. 整体趋势或特点

要求：
- 简洁明了，重点突出
- 使用中文
- 不要列举所有资讯，只提炼核心内容
- 语气专业但易懂
- 不要使用 markdown 格式`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini API response received:', text.substring(0, 100));
    return text;
  } catch (error: any) {
    console.error('Gemini API error:', error.message || error);
    // 如果 AI 生成失败，返回简单的统计总结
    return `📅 ${date} AI 领域动态\n\n今日共收集到 ${items.length} 条资讯，涵盖了 AI 模型、技术突破、产品发布等多个领域的最新动态。`;
  }
}

function getItemReason(item: any): string {
  const reasons = [];
  
  if (['OpenAI', 'Anthropic', 'DeepMind', 'Google AI'].some(s => item.source.includes(s))) {
    reasons.push('顶级 AI 公司');
  }
  
  if (item.type === 'youtube') {
    reasons.push('视频内容');
  } else if (item.type === 'twitter') {
    reasons.push('实时动态');
  }
  
  const text = `${item.title} ${item.summary || ''}`.toLowerCase();
  if (text.includes('gpt') || text.includes('claude') || text.includes('gemini')) {
    reasons.push('主流模型');
  }
  
  if (text.includes('breakthrough') || text.includes('突破') || text.includes('release') || text.includes('发布')) {
    reasons.push('重大更新');
  }
  
  return reasons.length > 0 ? reasons.join('、') : '最新资讯';
}

function extractTrends(items: any[]): string[] {
  const tagCount: Record<string, number> = {};

  items.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag: string) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}
