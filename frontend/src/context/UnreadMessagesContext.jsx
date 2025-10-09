import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error('useUnreadMessages must be used within UnreadMessagesProvider');
  }
  return context;
};

export const UnreadMessagesProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Don't load initial unread count from backend - it counts all messages from last 24h
  // Instead, rely on real-time SSE notifications for accurate unread tracking
  // useEffect(() => {
  //   if (!isSignedIn) return;
  //   loadUnreadCount();
  // }, [isSignedIn]);

  const loadUnreadCount = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
        setHasUnread(data.count > 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Listen for new messages via SSE
  useEffect(() => {
    if (!isSignedIn) return;

    const connectSSE = async () => {
      try {
        const token = await getToken();
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

                    if (data.type === 'newMessage') {
                      const newMsg = data.message;

                      // Increment unread if message is not from current user
                      if (newMsg.authorId !== user?.id) {
                        // Notify for:
                        // 1. Direct messages to me
                        // 2. ANY channel message (all users should be notified)
                        const isDirectToMe = newMsg.directRecipientId === user?.id;
                        const isChannelMessage = newMsg.channelId && !newMsg.directRecipientId;

                        if (isDirectToMe || isChannelMessage) {
                          setUnreadCount(prev => prev + 1);
                          setHasUnread(true);
                        }
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
          }
        };

        readStream();
      } catch (error) {
        console.error('SSE connection error:', error);
      }
    };

    connectSSE();
  }, [isSignedIn, user?.id]);

  const markAsRead = () => {
    setUnreadCount(0);
    setHasUnread(false);
  };

  const incrementUnread = () => {
    setUnreadCount(prev => prev + 1);
    setHasUnread(true);
  };

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        hasUnread,
        markAsRead,
        incrementUnread,
        refreshUnreadCount: loadUnreadCount
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};
