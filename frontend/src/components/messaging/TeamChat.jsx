// TeamChatNew.jsx - Responsive Team Chat with Desktop/Mobile layouts
import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import ChatSidebar from './ChatSidebar';
import ChatConversation from './ChatConversation';

const TeamChat = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // State
  const [view, setView] = useState('list'); // 'list' for mobile sidebar, 'conversation' for mobile chat
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

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Load channels and users
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

  // Restore last conversation on mount (only if coming back to chat)
  useEffect(() => {
    if (!isSignedIn) return;

    const savedConversation = sessionStorage.getItem('lastConversation');
    if (savedConversation && !currentChannel && !currentDmUser && channels.length > 0 && users.length > 0) {
      try {
        const { type, data } = JSON.parse(savedConversation);
        if (type === 'channel' && data) {
          // Verify channel still exists
          const channelExists = channels.find(c => c.id === data.id);
          if (channelExists) {
            setCurrentChannel(channelExists);
            setView('conversation');
          }
        } else if (type === 'dm' && data) {
          // Verify user still exists
          const userExists = users.find(u => u.id === data.id);
          if (userExists) {
            setCurrentDmUser(userExists);
            setView('conversation');
          }
        }
      } catch (error) {
        console.error('Error restoring conversation:', error);
      }
    }
  }, [isSignedIn, channels, users]);

  // Save current conversation
  useEffect(() => {
    if (currentChannel) {
      sessionStorage.setItem('lastConversation', JSON.stringify({ type: 'channel', data: currentChannel }));
    } else if (currentDmUser) {
      sessionStorage.setItem('lastConversation', JSON.stringify({ type: 'dm', data: currentDmUser }));
    }
  }, [currentChannel, currentDmUser]);

  // Real-time message updates via SSE
  useEffect(() => {
    if (!isSignedIn) return;

    let eventSource;

    const connectSSE = async () => {
      try {
        const token = await getToken();
        // EventSource doesn't support custom headers, so we'll use a library or query param
        // For now, using fetch with streaming
        const response = await fetch(`${apiUrl}/api/messages/events`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));

                    if (data.type === 'connected') {
                      console.log('✅ Connected to real-time messages');
                    } else if (data.type === 'newMessage') {
                      const newMsg = data.message;

                      // Only add if relevant to current conversation
                      const isCurrentChannel = currentChannel && newMsg.channelId === currentChannel.id;
                      const isCurrentDM = currentDmUser && (
                        (newMsg.authorId === currentDmUser.id && newMsg.directRecipientId === user.id) ||
                        (newMsg.authorId === user.id && newMsg.directRecipientId === currentDmUser.id)
                      );

                      if (isCurrentChannel || isCurrentDM) {
                        setMessages(prev => {
                          // Avoid duplicates
                          if (prev.find(m => m.id === newMsg.id)) return prev;
                          return [...prev, newMsg];
                        });
                      }
                    }
                  } catch (err) {
                    console.error('Error parsing SSE message:', err);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Stream reading error:', error);
            // Reconnect after 5 seconds
            setTimeout(connectSSE, 5000);
          }
        };

        readStream();
      } catch (error) {
        console.error('Error connecting to SSE:', error);
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      // Cleanup will happen when component unmounts
    };
  }, [isSignedIn, currentChannel, currentDmUser, user, getToken, apiUrl]);

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
      console.log('Loading users... Current user ID:', user?.id);

      const response = await fetch(`${apiUrl}/api/clerk/users`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded users from Clerk:', data);

        const mappedUsers = data
          .filter(clerkUser => clerkUser && clerkUser.id)
          .map(clerkUser => {
            const firstName = clerkUser.first_name || clerkUser.firstName || '';
            const lastName = clerkUser.last_name || clerkUser.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            const email = clerkUser.email_addresses?.[0]?.email_address ||
                         clerkUser.emailAddresses?.[0]?.emailAddress ||
                         clerkUser.primaryEmailAddress?.emailAddress ||
                         'No email';

            return {
              id: clerkUser.id,
              name: fullName || email,
              email: email,
              role: 'Team Member'
            };
          });

        const currentUserId = user?.id;
        const otherUsers = currentUserId
          ? mappedUsers.filter(u => u && u.id && u.id !== currentUserId)
          : mappedUsers;

        console.log('Other users (excluding current):', otherUsers);
        setUsers(otherUsers);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load users:', response.status, errorData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error, error.stack);
      setUsers([]);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/messages?channelId=${channelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded messages:', data.messages?.length || 0);
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load messages:', response.status);
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
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/messages/direct/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded direct messages:', data.messages?.length || 0);
        setMessages(data.messages || []);
      } else {
        console.error('Failed to load direct messages:', response.status);
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
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/messages/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newChannelName.trim(),
          type: 'channel'
        })
      });

      if (response.ok) {
        const newChannel = await response.json();
        console.log('Channel created:', newChannel);
        setChannels(prev => [...prev, newChannel]);
        setNewChannelName('');
        setShowCreateChannel(false);
        // Auto-select the new channel
        setCurrentChannel(newChannel);
        setView('conversation');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create channel:', response.status, errorData);
        alert(`Failed to create channel: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) return;

    try {
      const token = await getToken();
      const body = {
        content: messageContent.trim()
      };

      if (currentChannel) {
        body.channelId = currentChannel.id;
      } else if (currentDmUser) {
        body.directRecipientId = currentDmUser.id;
      }

      console.log('Sending message:', body);

      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const newMessage = await response.json();
        console.log('Message sent successfully:', newMessage);

        // Add immediately for instant feedback (SSE duplicate check will prevent double-add)
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setMessageContent('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', response.status, errorData);
        alert(`Failed to send message: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleChannelClick = (channel) => {
    setCurrentChannel(channel);
    setCurrentDmUser(null);
    setView('conversation');
    // Messages will load via useEffect
  };

  const handleUserClick = (user) => {
    setCurrentDmUser(user);
    setCurrentChannel(null);
    setView('conversation');
    // Messages will load via useEffect
  };

  const handleBack = () => {
    setView('list');
    setCurrentChannel(null);
    setCurrentDmUser(null);
    // Keep messages in state for when user returns
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dc-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access team chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop: Two-column layout (sidebar always visible) */}
      <div className="hidden lg:flex lg:w-80 xl:w-96">
        <ChatSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredChannels={filteredChannels}
          filteredUsers={filteredUsers}
          onChannelClick={handleChannelClick}
          onUserClick={handleUserClick}
          onCreateChannel={() => setShowCreateChannel(true)}
          getUserInitials={getUserInitials}
          currentChannel={currentChannel}
          currentDmUser={currentDmUser}
        />
      </div>

      <div className="hidden lg:flex lg:flex-1">
        <ChatConversation
          currentChannel={currentChannel}
          currentDmUser={currentDmUser}
          messages={messages}
          messageContent={messageContent}
          setMessageContent={setMessageContent}
          sendMessage={sendMessage}
          onBack={handleBack}
          loading={loading}
          user={user}
          getUserInitials={getUserInitials}
          getMessageAuthorName={getMessageAuthorName}
          isMobile={false}
        />
      </div>

      {/* Mobile: Single view (either sidebar or conversation) */}
      <div className="flex-1 lg:hidden h-full">
        {view === 'list' ? (
          <ChatSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredChannels={filteredChannels}
            filteredUsers={filteredUsers}
            onChannelClick={handleChannelClick}
            onUserClick={handleUserClick}
            onCreateChannel={() => setShowCreateChannel(true)}
            getUserInitials={getUserInitials}
            currentChannel={currentChannel}
            currentDmUser={currentDmUser}
          />
        ) : (
          <ChatConversation
            currentChannel={currentChannel}
            currentDmUser={currentDmUser}
            messages={messages}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
            sendMessage={sendMessage}
            onBack={handleBack}
            loading={loading}
            user={user}
            getUserInitials={getUserInitials}
            getMessageAuthorName={getMessageAuthorName}
            isMobile={true}
          />
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Channel</h3>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newChannelName.trim()) {
                  createChannel();
                }
              }}
              placeholder="Channel name..."
              autoFocus
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateChannel(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelName.trim()}
                className="flex-1 px-4 py-3 bg-dc-blue-500 text-white rounded-xl font-medium hover:bg-dc-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamChat;
