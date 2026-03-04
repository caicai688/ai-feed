import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { youtubeChannels } from '@/lib/social-sources';
import { YoutubeTranscript } from 'youtube-transcript';

export interface YouTubeItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  tags: string[];
  type: 'youtube';
  videoId: string;
  transcript?: string;
  thumbnailUrl?: string;
}

const parser = new Parser({
  customFields: {
    item: ['media:group', 'yt:videoId', 'media:thumbnail']
  }
});

export async function GET() {
  try {
    const allItems: YouTubeItem[] = [];

    // 并发抓取所有 YouTube 频道
    const results = await Promise.allSettled(
      youtubeChannels.map(async (channel) => {
        try {
          // YouTube RSS Feed URL
          const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
          const feed = await parser.parseURL(rssUrl);
          
          const items = await Promise.all(
            feed.items.slice(0, 5).map(async (item: any) => {
              const videoId = item['yt:videoId'] || extractVideoId(item.link || '');
              let transcript = '';
              
              // 尝试获取字幕（可能失败，不影响主流程）
              try {
                if (videoId) {
                  const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
                  transcript = transcriptData
                    .map((t: any) => t.text)
                    .join(' ')
                    .substring(0, 500); // 限制长度
                }
              } catch (err) {
                console.log(`No transcript for video ${videoId}`);
              }

              return {
                title: item.title || 'Untitled',
                summary: item.contentSnippet || item.content || transcript.substring(0, 300),
                source: channel.name,
                url: item.link || `https://www.youtube.com/watch?v=${videoId}`,
                date: item.pubDate || item.isoDate || new Date().toISOString(),
                tags: channel.tags,
                type: 'youtube' as const,
                videoId: videoId || '',
                transcript: transcript || undefined,
                thumbnailUrl: item['media:thumbnail']?.url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
              };
            })
          );
          
          return items;
        } catch (error) {
          console.error(`Failed to fetch ${channel.name}:`, error);
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
    console.error('YouTube collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to collect YouTube feeds' },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : '';
}
