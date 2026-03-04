'use client';

import { useEffect, useState, useMemo } from 'react';

interface FeedItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  tags: string[];
  translatedTitle?: string;
  translatedSummary?: string;
  type?: 'rss' | 'youtube' | 'twitter';
  videoId?: string;
  transcript?: string;
  thumbnailUrl?: string;
}

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatingIds, setTranslatingIds] = useState<Set<number>>(new Set());
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [dailySummary, setDailySummary] = useState<any>(null);

  useEffect(() => {
    fetchFeeds();
    fetchDailySummary();
  }, []);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      
      // 从localStorage获取自定义配置
      const customYoutubeChannels = localStorage.getItem('customYoutubeChannels');
      const customTwitterAccounts = localStorage.getItem('customTwitterAccounts');
      
      const youtubeChannels = customYoutubeChannels ? JSON.parse(customYoutubeChannels) : null;
      const twitterAccounts = customTwitterAccounts ? JSON.parse(customTwitterAccounts) : null;
      
      // 收集所有数据源
      const dataPromises = [];
      
      // RSS feeds
      dataPromises.push(fetch('/api/collect?rssOnly=true').then(r => r.json()));
      
      // YouTube (使用自定义配置)
      if (youtubeChannels && youtubeChannels.length > 0) {
        dataPromises.push(
          fetch('/api/youtube', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channels: youtubeChannels })
          }).then(r => r.json())
        );
      } else {
        dataPromises.push(fetch('/api/youtube').then(r => r.json()));
      }
      
      // Twitter (使用自定义配置)
      if (twitterAccounts && twitterAccounts.length > 0) {
        dataPromises.push(
          fetch('/api/twitter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accounts: twitterAccounts })
          }).then(r => r.json())
        );
      } else {
        dataPromises.push(fetch('/api/twitter').then(r => r.json()));
      }
      
      const results = await Promise.all(dataPromises);
      
      // 合并所有数据
      const allItems: FeedItem[] = [];
      results.forEach(result => {
        if (result.success && result.items) {
          allItems.push(...result.items);
        }
      });
      
      // 按日期排序
      allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setItems(allItems);
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const response = await fetch('/api/daily-summary');
      const data = await response.json();
      if (data.success) {
        setDailySummary(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch daily summary:', err);
    }
  };

  const translateItem = async (index: number) => {
    const item = filteredItems[index];
    if (item.translatedTitle && item.translatedSummary) return;

    setTranslatingIds(prev => new Set(prev).add(index));
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          summary: item.summary
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updatedItems = [...items];
        const originalIndex = items.findIndex(i => i.url === item.url);
        if (originalIndex !== -1) {
          updatedItems[originalIndex] = {
            ...updatedItems[originalIndex],
            translatedTitle: data.translatedTitle,
            translatedSummary: data.translatedSummary
          };
          setItems(updatedItems);
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // 获取所有唯一的信源
  const sources = useMemo(() => {
    const uniqueSources = Array.from(new Set(items.map(item => item.source)));
    return ['all', ...uniqueSources.sort()];
  }, [items]);

  // 获取所有唯一的标签
  const tags = useMemo(() => {
    const allTags = items.flatMap(item => item.tags);
    const uniqueTags = Array.from(new Set(allTags));
    return ['all', ...uniqueTags.sort()];
  }, [items]);

  // 过滤后的内容
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const sourceMatch = selectedSource === 'all' || item.source === selectedSource;
      const tagMatch = selectedTag === 'all' || item.tags.includes(selectedTag);
      
      // 关键词搜索
      const keyword = searchKeyword.toLowerCase().trim();
      const keywordMatch = !keyword || 
        item.title.toLowerCase().includes(keyword) ||
        item.summary.toLowerCase().includes(keyword) ||
        item.translatedTitle?.toLowerCase().includes(keyword) ||
        item.translatedSummary?.toLowerCase().includes(keyword) ||
        item.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        item.source.toLowerCase().includes(keyword);
      
      return sourceMatch && tagMatch && keywordMatch;
    });
  }, [items, selectedSource, selectedTag, searchKeyword]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI 信息聚合
              </h1>
              <p className="text-gray-600 mt-1">实时追踪 AI 领域最新动态</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/manage"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ⚙️ 管理信源
              </a>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showTranslation
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showTranslation ? '🇨🇳 中文' : '🌍 英文'}
              </button>
              <button
                onClick={fetchFeeds}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '加载中...' : '刷新'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Daily Summary */}
        {dailySummary && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>📊</span>
                <span>昨日 AI 动态总结</span>
              </h3>
              <button
                onClick={() => setShowDailySummary(!showDailySummary)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showDailySummary ? '收起' : '展开'}
              </button>
            </div>
            
            {showDailySummary && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                    {dailySummary.summary}
                  </pre>
                </div>
                
                {dailySummary.topStories && dailySummary.topStories.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {dailySummary.topStories.map((story: any, i: number) => (
                      <a
                        key={i}
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold">{i + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                              {story.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {story.source} · {story.reason}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 筛选器和搜索 - 放在资讯列表上方 */}
        <div className="mb-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信源筛选
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source === 'all' ? '全部信源' : source}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签筛选
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? '全部标签' : tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 关键词搜索
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索标题、摘要、标签..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 清除筛选按钮 */}
          {(selectedSource !== 'all' || selectedTag !== 'all' || searchKeyword) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                当前筛选条件：
                {selectedSource !== 'all' && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">信源: {selectedSource}</span>}
                {selectedTag !== 'all' && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">标签: {selectedTag}</span>}
                {searchKeyword && <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">关键词: {searchKeyword}</span>}
              </span>
              <button
                onClick={() => {
                  setSelectedSource('all');
                  setSelectedTag('all');
                  setSearchKeyword('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                清除所有筛选
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <span className="text-gray-600">
                共 {filteredItems.length} 条资讯
                {(selectedSource !== 'all' || selectedTag !== 'all') && (
                  <span className="ml-2 text-sm">
                    （已过滤）
                  </span>
                )}
              </span>
              {(selectedSource !== 'all' || selectedTag !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedSource('all');
                    setSelectedTag('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  清除筛选
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <article
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* YouTube 缩略图 */}
                  {item.type === 'youtube' && item.thumbnailUrl && (
                    <div className="relative">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        YouTube
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Source and Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-semibold ${
                        item.type === 'youtube' ? 'text-red-600' :
                        item.type === 'twitter' ? 'text-sky-600' :
                        'text-blue-600'
                      }`}>
                        {item.type === 'youtube' && '▶️ '}
                        {item.type === 'twitter' && '🐦 '}
                        {item.source}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 
                      className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      {showTranslation && item.translatedTitle
                        ? item.translatedTitle
                        : item.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {showTranslation && item.translatedSummary
                        ? item.translatedSummary
                        : item.summary}
                    </p>

                    {/* Transcript indicator for YouTube */}
                    {item.type === 'youtube' && item.transcript && (
                      <div className="mb-3 text-xs text-gray-500 flex items-center gap-1">
                        <span>📝</span>
                        <span>包含字幕文稿</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mb-4">
                      {showTranslation && !item.translatedTitle && (
                        <button
                          onClick={() => translateItem(index)}
                          disabled={translatingIds.has(index)}
                          className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 disabled:opacity-50 transition-colors"
                        >
                          {translatingIds.has(index) ? '翻译中...' : '翻译'}
                        </button>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        查看原文 →
                      </a>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg mb-2">没有找到匹配的资讯</p>
                {searchKeyword && (
                  <p className="text-gray-400 text-sm mb-4">
                    搜索关键词 "{searchKeyword}" 无匹配结果
                  </p>
                )}
                <button
                  onClick={() => {
                    setSelectedSource('all');
                    setSelectedTag('all');
                    setSearchKeyword('');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  清除所有筛选条件
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
        <p>数据来自 RSS 源、YouTube 频道、X/Twitter 账号 · 每次访问实时抓取</p>
        <p className="mt-2 text-xs">
          支持筛选、翻译、每日总结功能
        </p>
      </footer>
    </div>
  );
}
