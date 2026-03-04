import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { sources } from '@/lib/sources';

export interface FeedItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  tags: string[];
}

const parser = new Parser({
  customFields: {
    item: ['description', 'content', 'content:encoded', 'summary']
  }
});

export async function GET() {
  try {
    const allItems: FeedItem[] = [];

    // 并发抓取所有 RSS 源
    const results = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          const feed = await parser.parseURL(source.rssUrl);
          
          return feed.items.map((item) => {
            // 提取摘要，优先级：description > content:encoded > content > summary
            const summary = 
              item.contentSnippet ||
              item.description ||
              (item as any)['content:encoded'] ||
              (item as any).content ||
              (item as any).summary ||
              '';

            return {
              title: item.title || 'Untitled',
              summary: summary.substring(0, 300), // 限制长度
              source: source.name,
              url: item.link || '',
              date: item.pubDate || item.isoDate || new Date().toISOString(),
              tags: source.tags
            };
          });
        } catch (error) {
          console.error(`Failed to fetch ${source.name}:`, error);
          return [];
        }
      })
    );

    // 收集所有成功的结果
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allItems.push(...result.value);
      }
    });

    // 按日期倒序排序
    allItems.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json({
      success: true,
      count: allItems.length,
      items: allItems
    });
  } catch (error) {
    console.error('RSS collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to collect RSS feeds' },
      { status: 500 }
    );
  }
}
