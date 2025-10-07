// TeamChat.jsx - iOS-Optimized Mobile Chat with Channels & DMs
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  MessageCircle,
  Plus,
  Hash,
  Users,
  Send,
  ChevronLeft,
  Search
} from 'lucide-react';

const TeamChat = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  // State
  const [view, setView] = useState('list'); // 'list', 'channel', 'dm'
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentDmUser, setCurrentDmUser] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' or 'people'
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load channels
  useEffect(() => {
    if (isSignedIn) {
      loadChannels();
      loadUsers();
    }
  }, [isSignedIn]);

  // Load messages when channel/DM changes
  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel.id);
    } else if (currentDmUser) {
      loadDirectMessages(currentDmUser.id);
    }
  }, [currentChannel, currentDmUser]);

  const loadChannels = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/messages/channels`);
      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels || []);
      } else {
        setChannels([]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      setChannels([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        const otherUsers = data.filter(u => u.clerkUserId !== user?.id);
        setUsers(otherUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      setLoading(true);
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

  const loadDirectMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/messages/direct/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading direct messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const response = await fetch(`${apiUrl}/api/messages/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName.trim(),
          type: 'channel'
        })
      });

      if (response.ok) {
        const newChannel = await response.json();
        setChannels(prev => [...prev, newChannel]);
        setNewChannelName('');
        setShowCreateChannel(false);
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      const body = {
        content: messageContent.trim(),
        authorId: user.id
      };

      if (currentChannel) {
        body.channelId = currentChannel.id;
      } else if (currentDmUser) {
        body.directRecipientId = currentDmUser.id;
      }

      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
        setMessageContent('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const openChannel = (channel) => {
    setCurrentChannel(channel);
    setCurrentDmUser(null);
    setView('channel');
    setMessages([]);
  };

  const openDM = (user) => {
    setCurrentDmUser(user);
    setCurrentChannel(null);
    setView('dm');
    setMessages([]);
  };

  const backToList = () => {
    setView('list');
    setCurrentChannel(null);
    setCurrentDmUser(null);
    setMessages([]);
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getMessageAuthorName = (msg) => {
    if (msg.authorId === user?.id) return 'You';
    // In a real app, fetch user details from Clerk
    return msg.authorId.substring(0, 8);
  };

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access team chat.</p>
        </div>
      </div>
    );
  }

  // List View - Channels & People
  if (view === 'list') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 mx-4 rounded-xl p-1 mb-3">
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                activeTab === 'channels'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <Hash className="w-5 h-5 inline mr-2" />
              Channels
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                activeTab === 'people'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              People
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'channels' ? (
            <div className="space-y-3">
              {filteredChannels.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">No channels yet</p>
                  <button
                    onClick={() => setShowCreateChannel(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Create Channel
                  </button>
                </div>
              ) : (
                filteredChannels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => openChannel(channel)}
                    className="bg-white rounded-2xl p-5 shadow-lg active:bg-gray-50 transition-colors flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Hash className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{channel.name}</h3>
                      <p className="text-sm text-gray-600">{channel.description || 'No description'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                filteredUsers.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => openDM(person)}
                    className="bg-white rounded-2xl p-5 shadow-lg active:bg-gray-50 transition-colors flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-green-700">
                        {getUserInitials(person.name || person.email)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{person.name || person.email}</h3>
                      <p className="text-sm text-gray-600">{person.role || 'Team Member'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button - Only for Channels */}
        {activeTab === 'channels' && (
          <button
            onClick={() => setShowCreateChannel(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center z-20"
            style={{ boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)' }}
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Create Channel Modal */}
        {showCreateChannel && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Channel</h3>
              <input
                type="text"
                placeholder="Channel name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateChannel(false);
                    setNewChannelName('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={createChannel}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Chat View - Channel or DM
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={backToList} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {currentChannel ? `# ${currentChannel.name}` : currentDmUser?.name || currentDmUser?.email}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = msg.authorId === user?.id;
            return (
              <div key={idx} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isOwnMessage ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'} rounded-2xl px-4 py-3 shadow-md`}>
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {getMessageAuthorName(msg)}
                    </p>
                  )}
                  <p className="text-base">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!messageContent.trim()}
            className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;
