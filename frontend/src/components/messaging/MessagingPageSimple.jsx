import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Plus, Hash, X, Search, Users
} from 'lucide-react';

const MessagingPageSimple = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [loading, setLoading] = useState(false);

  // Load channels on mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel);
    }
  }, [currentChannel]);

  const loadChannels = async () => {
    try {
      // For now, just show empty state
      setChannels([]);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      setLoading(true);
      // Load messages from API
      const response = await fetch(`/api/messages?channelId=${channelId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Please enter a channel name');
      return;
    }

    try {
      const response = await fetch('/api/messages/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName.trim().toLowerCase(),
          type: 'channel'
        })
      });

      if (response.ok) {
        const newChannel = await response.json();
        setChannels([...channels, newChannel]);
        setCurrentChannel(newChannel.id);
        setNewChannelName('');
        setShowCreateChannel(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          channelId: currentChannel
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="p-6" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Team Chat</h2>
                  <button
                    onClick={() => setShowCreateChannel(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Channels List */}
              <div className="flex-1 overflow-y-auto p-4">
                {channels.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No channels yet</p>
                    <button
                      onClick={() => setShowCreateChannel(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create First Channel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {channels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => setCurrentChannel(channel.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          currentChannel === channel.id
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Hash className="w-4 h-4" />
                        <span className="font-medium">{channel.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {!currentChannel ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Team Chat</h3>
                    <p className="text-gray-600">Create a channel to get started</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {message.author?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{message.author || 'User'}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create Channel</h3>
              <button
                onClick={() => {
                  setShowCreateChannel(false);
                  setNewChannelName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="general, hvac-team..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateChannel(false);
                  setNewChannelName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPageSimple;
