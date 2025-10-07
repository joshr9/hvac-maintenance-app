// ChatConversation.jsx - Conversation view for channels and DMs
import React, { useRef, useEffect } from 'react';
import { ChevronLeft, Send, Hash, MessageCircle } from 'lucide-react';

const ChatConversation = ({
  currentChannel,
  currentDmUser,
  messages,
  messageContent,
  setMessageContent,
  sendMessage,
  onBack,
  loading,
  user,
  getUserInitials,
  getMessageAuthorName,
  isMobile = false
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Empty state when no conversation selected (desktop only)
  if (!currentChannel && !currentDmUser) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversation selected</h3>
          <p className="text-gray-600">Choose a channel or person to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white lg:bg-gray-50">
      {/* Conversation Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-5">
        <div className="flex items-center gap-3">
          {/* Back button (mobile only) */}
          {isMobile && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}

          {/* Channel/User Info */}
          {currentChannel ? (
            <>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-dc-blue-100 flex items-center justify-center">
                <Hash className="w-5 h-5 lg:w-6 lg:h-6 text-dc-blue-600" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{currentChannel.name}</h2>
                <p className="text-xs lg:text-sm text-gray-600">Channel</p>
              </div>
            </>
          ) : currentDmUser ? (
            <>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold">
                {getUserInitials(currentDmUser.name)}
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{currentDmUser.name}</h2>
                <p className="text-xs lg:text-sm text-gray-600">{currentDmUser.email}</p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dc-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.authorId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-sm lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <div className="text-xs text-gray-600 mb-1 ml-1">
                      {getMessageAuthorName(msg)}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isOwnMessage
                        ? 'bg-dc-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm lg:text-base whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-dc-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 lg:p-6">
        <div className="flex gap-3 items-end">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 resize-none text-sm lg:text-base"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!messageContent.trim()}
            className="p-3 lg:p-4 bg-dc-blue-500 text-white rounded-xl hover:bg-dc-blue-600 active:bg-dc-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
