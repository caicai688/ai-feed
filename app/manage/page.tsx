'use client';

import { useEffect, useState } from 'react';
import { YouTubeChannel, TwitterAccount } from '@/lib/social-sources';
import Link from 'next/link';

export default function ManagePage() {
  const [youtubeChannels, setYoutubeChannels] = useState<YouTubeChannel[]>([]);
  const [twitterAccounts, setTwitterAccounts] = useState<TwitterAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'youtube' | 'twitter'>('youtube');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<YouTubeChannel | TwitterAccount | null>(null);

  // YouTube表单
  const [ytName, setYtName] = useState('');
  const [ytChannelId, setYtChannelId] = useState('');
  const [ytTags, setYtTags] = useState('');

  // Twitter表单
  const [twName, setTwName] = useState('');
  const [twUsername, setTwUsername] = useState('');
  const [twTags, setTwTags] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      // 从localStorage加载用户自定义配置
      const customYt = localStorage.getItem('customYoutubeChannels');
      const customTw = localStorage.getItem('customTwitterAccounts');

      if (customYt) {
        setYoutubeChannels(JSON.parse(customYt));
      } else {
        // 加载默认配置
        const response = await fetch('/api/social-sources');
        const data = await response.json();
        if (data.success) {
          setYoutubeChannels(data.youtubeChannels);
          setTwitterAccounts(data.twitterAccounts);
          // 保存到localStorage
          localStorage.setItem('customYoutubeChannels', JSON.stringify(data.youtubeChannels));
          localStorage.setItem('customTwitterAccounts', JSON.stringify(data.twitterAccounts));
        }
      }

      if (customTw) {
        setTwitterAccounts(JSON.parse(customTw));
      }
    } catch (error) {
      console.error('Failed to load sources:', error);
    }
  };

  const saveToStorage = (type: 'youtube' | 'twitter', data: any[]) => {
    if (type === 'youtube') {
      localStorage.setItem('customYoutubeChannels', JSON.stringify(data));
      setYoutubeChannels(data);
    } else {
      localStorage.setItem('customTwitterAccounts', JSON.stringify(data));
      setTwitterAccounts(data);
    }
  };

  const handleAddYouTube = () => {
    if (!ytName || !ytChannelId) {
      alert('请填写频道名称和频道ID');
      return;
    }

    const newChannel: YouTubeChannel = {
      id: `yt-custom-${Date.now()}`,
      name: ytName,
      channelId: ytChannelId,
      tags: ytTags.split(',').map(t => t.trim()).filter(t => t)
    };

    const updated = [...youtubeChannels, newChannel];
    saveToStorage('youtube', updated);
    resetYouTubeForm();
    setShowAddForm(false);
  };

  const handleAddTwitter = () => {
    if (!twName || !twUsername) {
      alert('请填写账号名称和用户名');
      return;
    }

    const newAccount: TwitterAccount = {
      id: `tw-custom-${Date.now()}`,
      name: twName,
      username: twUsername,
      tags: twTags.split(',').map(t => t.trim()).filter(t => t)
    };

    const updated = [...twitterAccounts, newAccount];
    saveToStorage('twitter', updated);
    resetTwitterForm();
    setShowAddForm(false);
  };

  const handleEditYouTube = (channel: YouTubeChannel) => {
    setEditingItem(channel);
    setYtName(channel.name);
    setYtChannelId(channel.channelId);
    setYtTags(channel.tags.join(', '));
    setShowAddForm(true);
  };

  const handleEditTwitter = (account: TwitterAccount) => {
    setEditingItem(account);
    setTwName(account.name);
    setTwUsername(account.username);
    setTwTags(account.tags.join(', '));
    setShowAddForm(true);
  };

  const handleUpdateYouTube = () => {
    if (!editingItem || !ytName || !ytChannelId) return;

    const updated = youtubeChannels.map(ch =>
      ch.id === editingItem.id
        ? {
            ...ch,
            name: ytName,
            channelId: ytChannelId,
            tags: ytTags.split(',').map(t => t.trim()).filter(t => t)
          }
        : ch
    );

    saveToStorage('youtube', updated);
    resetYouTubeForm();
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleUpdateTwitter = () => {
    if (!editingItem || !twName || !twUsername) return;

    const updated = twitterAccounts.map(acc =>
      acc.id === editingItem.id
        ? {
            ...acc,
            name: twName,
            username: twUsername,
            tags: twTags.split(',').map(t => t.trim()).filter(t => t)
          }
        : acc
    );

    saveToStorage('twitter', updated);
    resetTwitterForm();
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleDeleteYouTube = (id: string) => {
    if (!confirm('确定要删除此频道吗？')) return;
    const updated = youtubeChannels.filter(ch => ch.id !== id);
    saveToStorage('youtube', updated);
  };

  const handleDeleteTwitter = (id: string) => {
    if (!confirm('确定要删除此账号吗？')) return;
    const updated = twitterAccounts.filter(acc => acc.id !== id);
    saveToStorage('twitter', updated);
  };

  const resetYouTubeForm = () => {
    setYtName('');
    setYtChannelId('');
    setYtTags('');
  };

  const resetTwitterForm = () => {
    setTwName('');
    setTwUsername('');
    setTwTags('');
  };

  const handleResetToDefaults = async () => {
    if (!confirm('确定要恢复默认配置吗？这将清除所有自定义设置。')) return;

    try {
      const response = await fetch('/api/social-sources');
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('customYoutubeChannels', JSON.stringify(data.youtubeChannels));
        localStorage.setItem('customTwitterAccounts', JSON.stringify(data.twitterAccounts));
        setYoutubeChannels(data.youtubeChannels);
        setTwitterAccounts(data.twitterAccounts);
        alert('已恢复默认配置');
      }
    } catch (error) {
      alert('恢复失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                管理信源
              </h1>
              <p className="text-gray-600 mt-1">添加或管理 YouTube 频道和 Twitter 账号</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                恢复默认
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('youtube');
              setShowAddForm(false);
              setEditingItem(null);
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'youtube'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ▶️ YouTube 频道 ({youtubeChannels.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('twitter');
              setShowAddForm(false);
              setEditingItem(null);
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'twitter'
                ? 'text-sky-600 border-b-2 border-sky-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🐦 Twitter 账号 ({twitterAccounts.length})
          </button>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingItem(null);
              resetYouTubeForm();
              resetTwitterForm();
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {showAddForm ? '取消' : `+ 添加${activeTab === 'youtube' ? 'YouTube频道' : 'Twitter账号'}`}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-bold mb-4">
              {editingItem ? '编辑' : '添加'}
              {activeTab === 'youtube' ? 'YouTube频道' : 'Twitter账号'}
            </h3>
            
            {activeTab === 'youtube' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    频道名称 *
                  </label>
                  <input
                    type="text"
                    value={ytName}
                    onChange={(e) => setYtName(e.target.value)}
                    placeholder="例如: OpenAI"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    频道 ID *
                  </label>
                  <input
                    type="text"
                    value={ytChannelId}
                    onChange={(e) => setYtChannelId(e.target.value)}
                    placeholder="例如: UCXZCJLdBC09xxGZ6gcdrc6A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    可在频道页面URL中找到，或访问频道 → 关于 → 分享频道 → 复制频道ID
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={ytTags}
                    onChange={(e) => setYtTags(e.target.value)}
                    placeholder="例如: AI, OpenAI, Demo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={editingItem ? handleUpdateYouTube : handleAddYouTube}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? '更新' : '添加'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      resetYouTubeForm();
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    账号名称 *
                  </label>
                  <input
                    type="text"
                    value={twName}
                    onChange={(e) => setTwName(e.target.value)}
                    placeholder="例如: Sam Altman"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户名 * (不含@)
                  </label>
                  <input
                    type="text"
                    value={twUsername}
                    onChange={(e) => setTwUsername(e.target.value)}
                    placeholder="例如: sama"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={twTags}
                    onChange={(e) => setTwTags(e.target.value)}
                    placeholder="例如: OpenAI, CEO, Industry"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={editingItem ? handleUpdateTwitter : handleAddTwitter}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingItem ? '更新' : '添加'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      resetTwitterForm();
                    }}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {activeTab === 'youtube' ? (
            youtubeChannels.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">暂无YouTube频道</p>
              </div>
            ) : (
              youtubeChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {channel.name}
                        </h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          YouTube
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        频道ID: <code className="bg-gray-100 px-2 py-1 rounded">{channel.channelId}</code>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {channel.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditYouTube(channel)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteYouTube(channel.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            twitterAccounts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">暂无Twitter账号</p>
              </div>
            ) : (
              twitterAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {account.name}
                        </h3>
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                          Twitter
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        用户名: <span className="font-medium">@{account.username}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {account.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditTwitter(account)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteTwitter(account.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 text-sm">
        <p>配置保存在浏览器本地存储中</p>
        <p className="mt-2 text-xs">
          如需在多设备间同步，请考虑导出/导入配置功能
        </p>
      </footer>
    </div>
  );
}
