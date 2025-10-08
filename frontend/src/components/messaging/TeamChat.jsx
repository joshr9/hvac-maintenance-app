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
        setMessages(prev => [...prev, newMessage]);
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
    setMessages([]);
  };

  const handleUserClick = (user) => {
    setCurrentDmUser(user);
    setCurrentChannel(null);
    setView('conversation');
    setMessages([]);
  };

  const handleBack = () => {
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Channel</h3>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name..."
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
                className="flex-1 px-4 py-3 bg-dc-blue-500 text-white rounded-xl font-medium hover:bg-dc-blue-600 transition-colors"
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
