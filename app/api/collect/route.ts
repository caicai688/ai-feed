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
  type?: 'rss' | 'youtube' | 'twitter';
  videoId?: string;
  transcript?: string;
  thumbnailUrl?: string;
}

const parser = new Parser({
  customFields: {
    item: ['description', 'content', 'content:encoded', 'summary']
  }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeYoutube = searchParams.get('youtube') !== 'false';
    const includeTwitter = searchParams.get('twitter') !== 'false';
    
    const allItems: FeedItem[] = [];

    // 并发抓取所有数据源
    const fetchPromises: Promise<any>[] = [
      // RSS 源
      ...sources.map(async (source) => {
        try {
          const feed = await parser.parseURL(source.rssUrl);
          
          return feed.items.map((item) => {
            const summary = 
              item.contentSnippet ||
              item.description ||
              (item as any)['content:encoded'] ||
              (item as any).content ||
              (item as any).summary ||
              '';

            return {
              title: item.title || 'Untitled',
              summary: summary.substring(0, 300),
              source: source.name,
              url: item.link || '',
              date: item.pubDate || item.isoDate || new Date().toISOString(),
              tags: source.tags,
              type: 'rss' as const
            };
          });
        } catch (error) {
          console.error(`Failed to fetch ${source.name}:`, error);
          return [];
        }
      })
    ];

    // 添加 YouTube 数据
    if (includeYoutube) {
      fetchPromises.push(
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/youtube`)
          .then(res => res.json())
          .then(data => data.success ? data.items : [])
          .catch(() => [])
      );
    }

    // 添加 Twitter 数据
    if (includeTwitter) {
      fetchPromises.push(
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/twitter`)
          .then(res => res.json())
          .then(data => data.success ? data.items : [])
          .catch(() => [])
      );
    }

    const results = await Promise.allSettled(fetchPromises);

    // 收集所有成功的结果
    results.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
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
      items: allItems,
      sources: {
        rss: sources.length,
        youtube: includeYoutube,
        twitter: includeTwitter
      }
    });
  } catch (error) {
    console.error('Collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to collect feeds' },
      { status: 500 }
    );
  }
}
