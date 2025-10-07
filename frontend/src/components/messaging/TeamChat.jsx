import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  MessageSquare, Send, Plus, Hash, X, ChevronLeft, MoreVertical, Loader
} from 'lucide-react';

const TeamChat = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [view, setView] = useState('channels'); // 'channels' or 'chat'
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load channels on mount
  useEffect(() => {
    if (isSignedIn) {
      loadChannels();
    }
  }, [isSignedIn]);

  // Load messages when channel changes
  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel);
    }
  }, [currentChannel]);

  const loadChannels = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/messages/channels`);

      if (response.ok) {
        const data = await response.json();
        setChannels(Array.isArray(data) ? data : []);
      } else {
        // If fails, start with empty array (no error shown)
        setChannels([]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      setChannels([]);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/messages?channelId=${channelId}`);

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
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
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/messages/channels`, {
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
        setView('chat');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChannel || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      setSending(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          channelId: currentChannel,
          authorId: user.id
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
      } else {
        // If send fails, restore message
        setNewMessage(messageContent);
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore on error
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getCurrentChannel = () => {
    return channels.find(c => c.id === currentChannel);
  };

  const getUserDisplayName = (authorId) => {
    if (authorId === user?.id) return 'You';
    // For now, just show User - can enhance later with team member lookup
    return 'Team Member';
  };

  const getUserInitial = (authorId) => {
    if (authorId === user?.id) return user.firstName?.[0] || user.email?.[0] || 'Y';
    return 'T';
  };

  // Auth check
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access team chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
      {view === 'channels' ? (
        // Channels List View
        <>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Team Chat</h1>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus className="w-6 h-6 text-blue-600" />
            </button>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto">
            {channels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Start Chatting</h2>
                <p className="text-gray-600 mb-6">Create a channel to communicate with your team</p>
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold shadow-lg active:scale-95 transition-transform"
                >
                  Create Channel
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setCurrentChannel(channel.id);
                      setView('chat');
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Hash className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-gray-900">#{channel.name}</h3>
                      <p className="text-sm text-gray-500">{channel.description || 'Tap to open'}</p>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // Chat View
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setView('channels')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">#{getCurrentChannel()?.name}</h2>
              {getCurrentChannel()?.description && (
                <p className="text-xs text-gray-500">{getCurrentChannel().description}</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                      {getUserInitial(message.authorId)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{getUserDisplayName(message.authorId)}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2">
                        <p className="text-gray-900">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Message"
                  disabled={sending}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
              >
                {sending ? (
                  <Loader className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" style={{ transform: 'translateX(1px)' }} />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 animate-fadeIn">
          <div
            className="bg-white w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-2xl p-6 transform transition-transform"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">New Channel</h3>
              <button
                onClick={() => {
                  setShowCreateChannel(false);
                  setNewChannelName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Channel Name
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="general, hvac-team..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Use lowercase and dashes</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateChannel(false);
                  setNewChannelName('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold active:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelName.trim()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40 active:scale-98 transition-transform"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
      </div>
    </div>
  );
};

export default TeamChat;
