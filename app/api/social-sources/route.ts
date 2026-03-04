import { NextResponse } from 'next/server';
import { 
  youtubeChannels as defaultYoutubeChannels, 
  twitterAccounts as defaultTwitterAccounts,
  YouTubeChannel,
  TwitterAccount
} from '@/lib/social-sources';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      youtubeChannels: defaultYoutubeChannels,
      twitterAccounts: defaultTwitterAccounts
    });
  } catch (error) {
    console.error('Error fetching social sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, action, data } = body;

    // 这里返回成功，实际的增删改查由前端localStorage管理
    // 如果需要持久化到数据库，可以在这里添加数据库操作
    
    return NextResponse.json({
      success: true,
      message: `${action} ${type} successfully`
    });
  } catch (error) {
    console.error('Error updating social sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update social sources' },
      { status: 500 }
    );
  }
}
