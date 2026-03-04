import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, summary } = await request.json();

    // 使用免费的翻译 API（这里使用简单的方案，生产环境建议使用专业翻译服务）
    // 可以替换为：Google Translate API、DeepL、或其他翻译服务
    
    // 方案1：使用 MyMemory Translation API（免费）
    const translateText = async (text: string): Promise<string> => {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`,
          { next: { revalidate: 86400 } } // 缓存24小时
        );
        const data = await response.json();
        return data.responseData?.translatedText || text;
      } catch (error) {
        console.error('Translation error:', error);
        return text;
      }
    };

    const [translatedTitle, translatedSummary] = await Promise.all([
      translateText(title),
      translateText(summary)
    ]);

    return NextResponse.json({
      success: true,
      translatedTitle,
      translatedSummary
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    );
  }
}
