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
      const response = await fetch('/api/collect');
      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
      } else {
        setError('Failed to load feeds');
      }
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
      return sourceMatch && tagMatch;
    });
  }, [items, selectedSource, selectedTag]);

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI 信息聚合
              </h1>
              <p className="text-gray-600 mt-1">实时追踪 AI 领域最新动态</p>
            </div>
            <div className="flex gap-3">
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

          {/* 筛选器 */}
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
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">没有找到匹配的资讯</p>
                <button
                  onClick={() => {
                    setSelectedSource('all');
                    setSelectedTag('all');
                  }}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  清除筛选条件
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
