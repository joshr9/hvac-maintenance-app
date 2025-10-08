// ChatConversation.jsx - Conversation view for channels and DMs
import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, Send, Hash, MessageCircle, MoreVertical, Building2, Briefcase } from 'lucide-react';

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
  const [messageMenuOpen, setMessageMenuOpen] = useState(null);
  const [showSaveToProperty, setShowSaveToProperty] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

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
    <div className="flex flex-col w-full" style={{ height: isMobile ? '100dvh' : '100%' }}>
      {/* Conversation Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
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
              <div className="w-10 h-10 rounded-xl bg-dc-blue-100 flex items-center justify-center">
                <Hash className="w-5 h-5 text-dc-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{currentChannel.name}</h2>
                <p className="text-xs text-gray-500">Channel</p>
              </div>
            </>
          ) : currentDmUser ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                {getUserInitials(currentDmUser.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{currentDmUser.name}</h2>
                <p className="text-xs text-gray-500">{currentDmUser.email}</p>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-5xl mx-auto space-y-4">
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
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'} relative`}>
                  {!isOwnMessage && (
                    <div className="text-xs text-gray-600 mb-1 ml-1">
                      {getMessageAuthorName(msg)}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      isOwnMessage
                        ? 'bg-dc-blue-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-dc-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Message Actions (appears on hover) */}
                  <button
                    onClick={() => {
                      setSelectedMessage(msg);
                      setMessageMenuOpen(messageMenuOpen === msg.id ? null : msg.id);
                    }}
                    className={`absolute top-0 ${isOwnMessage ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100`}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {messageMenuOpen === msg.id && (
                    <div className={`absolute z-10 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 py-1 ${isOwnMessage ? 'right-0' : 'left-0'}`}>
                      <button
                        onClick={() => {
                          setShowSaveToProperty(true);
                          setMessageMenuOpen(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Building2 className="w-4 h-4" />
                        Save to Property
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateJob(true);
                          setMessageMenuOpen(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        Create Job
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3 items-end max-w-5xl mx-auto">
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dc-blue-500 focus:border-dc-blue-500 resize-none text-sm"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!messageContent.trim()}
            className="p-3 bg-dc-blue-500 text-white rounded-xl hover:bg-dc-blue-600 active:bg-dc-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Save to Property Modal */}
      {showSaveToProperty && selectedMessage && (
        <SaveToPropertyModal
          message={selectedMessage}
          onClose={() => {
            setShowSaveToProperty(false);
            setSelectedMessage(null);
          }}
        />
      )}

      {/* Create Job Modal */}
      {showCreateJob && selectedMessage && (
        <CreateJobFromMessageModal
          message={selectedMessage}
          onClose={() => {
            setShowCreateJob(false);
            setSelectedMessage(null);
          }}
        />
      )}
    </div>
  );
};

// Save to Property Modal Component
const SaveToPropertyModal = ({ message, onClose }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/properties`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProperty) return;

    try {
      setSaving(true);
      const response = await fetch(`${apiUrl}/api/messages/${message.id}/save-to-property`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: parseInt(selectedProperty) })
      });

      if (response.ok) {
        alert('Message saved to property successfully!');
        onClose();
      } else {
        alert('Failed to save message to property');
      }
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Failed to save message to property');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Save to Property</h3>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          "{message.content}"
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dc-blue-600"></div>
          </div>
        ) : (
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 mb-4"
          >
            <option value="">Select a property...</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} - {property.address}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedProperty || saving}
            className="flex-1 px-4 py-3 bg-dc-blue-500 text-white rounded-xl font-medium hover:bg-dc-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Job from Message Modal Component
const CreateJobFromMessageModal = ({ message, onClose }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    loadProperties();
    // Pre-fill job title with message content (first 50 chars)
    setJobTitle(message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''));
  }, []);

  const loadProperties = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/properties`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedProperty || !jobTitle.trim()) return;

    try {
      setCreating(true);

      // Create the job
      const jobResponse = await fetch(`${apiUrl}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle.trim(),
          description: message.content,
          propertyId: parseInt(selectedProperty),
          status: 'pending'
        })
      });

      if (jobResponse.ok) {
        const job = await jobResponse.json();

        // Link message to job
        await fetch(`${apiUrl}/api/messages/${message.id}/save-to-job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id })
        });

        alert('Job created successfully!');
        onClose();
      } else {
        alert('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Create Job</h3>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          "{message.content}"
        </div>

        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Job title..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 mb-4"
        />

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dc-blue-600"></div>
          </div>
        ) : (
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 mb-4"
          >
            <option value="">Select a property...</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} - {property.address}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedProperty || !jobTitle.trim() || creating}
            className="flex-1 px-4 py-3 bg-dc-blue-500 text-white rounded-xl font-medium hover:bg-dc-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
