import { NextResponse } from 'next/server';
import { twitterAccounts as defaultTwitterAccounts, TwitterAccount } from '@/lib/social-sources';

export interface TwitterItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  tags: string[];
  type: 'twitter';
  username: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customAccounts = body.accounts || defaultTwitterAccounts;
    
    return await fetchTwitterFeeds(customAccounts);
  } catch (error) {
    console.error('Twitter collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to collect Twitter feeds' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return await fetchTwitterFeeds(defaultTwitterAccounts);
}

async function fetchTwitterFeeds(twitterAccounts: TwitterAccount[]) {
  try {
    const allItems: TwitterItem[] = [];

    // 使用 Nitter 实例获取推文（RSS 方式）
    // Nitter 是 Twitter 的开源前端，提供 RSS 支持
    const nitterInstances = [
      'nitter.net',
      'nitter.poast.org',
      'nitter.privacydev.net'
    ];

    // 并发抓取所有 Twitter 账号
    const results = await Promise.allSettled(
      twitterAccounts.map(async (account) => {
        // 尝试多个 Nitter 实例
        for (const instance of nitterInstances) {
          try {
            const rssUrl = `https://${instance}/${account.username}/rss`;
            const response = await fetch(rssUrl, {
              next: { revalidate: 300 }, // 缓存5分钟
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AIFeedBot/1.0)'
              }
            });

            if (!response.ok) continue;

            const xmlText = await response.text();
            const items = parseTwitterRSS(xmlText, account);
            
            if (items.length > 0) {
              return items.slice(0, 10); // 每个账号最多10条
            }
          } catch (error) {
            console.log(`Failed to fetch from ${instance} for ${account.username}`);
            continue;
          }
        }
        
        return [];
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
      items: allItems,
      note: 'Twitter data via Nitter RSS. May have delays or limited availability.'
    });
  } catch (error) {
    console.error('Twitter fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Twitter feeds' },
      { status: 500 }
    );
  }
}

function parseTwitterRSS(xmlText: string, account: typeof twitterAccounts[0]): TwitterItem[] {
  const items: TwitterItem[] = [];
  
  try {
    // 简单的 XML 解析
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || '';
      
      // 清理 HTML 标签
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .substring(0, 280);
      
      items.push({
        title: title.substring(0, 100) || `${account.name} 的推文`,
        summary: cleanDescription,
        source: `@${account.username}`,
        url: link,
        date: pubDate || new Date().toISOString(),
        tags: account.tags,
        type: 'twitter',
        username: account.username
      });
    }
  } catch (error) {
    console.error('Parse Twitter RSS error:', error);
  }
  
  return items;
}
