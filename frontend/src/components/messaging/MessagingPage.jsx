// components/messaging/MessagingPage.jsx - Complete with Job & Task Creation
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Camera, 
  Phone, 
  Video,
  MoreHorizontal,
  Hash,
  User, 
  Users,
  Building, 
  Zap,
  CheckCircle,
  Circle,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Image,
  File,
  Smile,
  AtSign,
  Pin,
  Star,
  Edit3,
  Reply,
  Clock,
  MapPin,
  Wrench,
  Archive,
  ExternalLink,
  Save,
  Bookmark,
  CheckSquare  // Added for task creation
} from 'lucide-react';

const MessagingPage = ({ 
  onNavigate, 
  onOpenModal, 
  allProperties = [], 
  globalJobsData = {} 
}) => {
  // 🔐 Clerk Authentication
  const { isLoaded, isSignedIn, user, getToken } = useAuth();
  
  // 📱 Core State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [users, setUsers] = useState({});
  
  // 💬 Message State
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  
  // 🔍 UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannels, setShowChannels] = useState(true);
  const [showDirectMessages, setShowDirectMessages] = useState(true);
  const [showMembersList, setShowMembersList] = useState(true);
  
  // 🎯 Modal State
  const [showSaveToModal, setShowSaveToModal] = useState(null);
  const [showJobCreation, setShowJobCreation] = useState(null);  // For job creation
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [showStartDM, setShowStartDM] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 📚 Reference for auto-scroll
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 🔄 API Helper Function
  const apiCall = async (endpoint, options = {}) => {
    if (!isSignedIn) throw new Error('Not authenticated');
    
    const token = await getToken();
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // 📋 Load Channels
  const loadChannels = async () => {
    try {
      const data = await apiCall('/messages/channels');
      setChannels(data);

      // Set first channel as default if none selected
      if (!currentChannel && data.length > 0) {
        setCurrentChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      setError('Failed to load channels');
    }
  };

  // ➕ Create New Channel
  const createChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Please enter a channel name');
      return;
    }

    try {
      setCreatingChannel(true);
      const newChannel = await apiCall('/messages/channels', {
        method: 'POST',
        body: JSON.stringify({
          name: newChannelName.trim(),
          description: newChannelDescription.trim() || null,
          type: 'channel'
        })
      });

      // Add to channels list
      setChannels(prev => [...prev, newChannel]);

      // Select the new channel
      setCurrentChannel(newChannel.id);

      // Reset and close modal
      setNewChannelName('');
      setNewChannelDescription('');
      setShowCreateChannel(false);
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel: ' + error.message);
    } finally {
      setCreatingChannel(false);
    }
  };

  // 💬 Load Messages for Current Channel
  const loadMessages = async (channelId) => {
    if (!channelId) return;
    
    try {
      setLoading(true);
      const data = await apiCall(`/messages?channelId=${channelId}&limit=50`);
      setMessages(data.messages || []);
      setUsers(data.users || {});
      
      // Auto-scroll to bottom
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // 📤 Send New Message
  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !currentChannel) return;

    try {
      const attachments = selectedFiles.map(file => ({
        type: file.type.startsWith('image/') ? 'photo' : 'file',
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      }));

      const messageData = {
        content: newMessage.trim() || null,
        channelId: currentChannel,
        attachments: attachments.length > 0 ? attachments : []
      };

      const sentMessage = await apiCall('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      
      // Clear input
      setNewMessage('');
      setSelectedFiles([]);
      
      // Auto-scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // 👍 Add/Remove Reaction
  const toggleReaction = async (messageId, emoji) => {
    try {
      const updatedMessage = await apiCall(`/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji })
      });

      // Update message in list
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // 💾 Save Message to Job
  const saveMessageToJob = async (messageId, jobId) => {
    try {
      const updatedMessage = await apiCall(`/messages/${messageId}/save-to-job`, {
        method: 'POST',
        body: JSON.stringify({ jobId })
      });

      // Update message in list
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
      
      setShowSaveToModal(null);
    } catch (error) {
      console.error('Error saving message to job:', error);
      setError('Failed to save message to job');
    }
  };

  // 🏢 Save Message to Property
  const saveMessageToProperty = async (messageId, propertyId) => {
    try {
      const updatedMessage = await apiCall(`/messages/${messageId}/save-to-property`, {
        method: 'POST',
        body: JSON.stringify({ propertyId })
      });

      // Update message in list
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
      
      setShowSaveToModal(null);
    } catch (error) {
      console.error('Error saving message to property:', error);
      setError('Failed to save message to property');
    }
  };

  // 🔨 Create Job from Message
  const createJobFromMessage = (message) => {
    setShowJobCreation(message);
  };

  // ✅ Create Task from Message
  const createTaskFromMessage = (message) => {
    onNavigate('tasks', { 
      action: 'create',
      fromMessage: {
        content: message.content,
        id: message.id,
        authorId: message.authorId
      }
    });
  };

  // 📁 File Handling
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 🎯 Utility Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getCurrentChannelData = () => {
    return channels.find(c => c.id === currentChannel) || {};
  };

  // 🚀 Effects
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadChannels();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (currentChannel) {
      loadMessages(currentChannel);
    }
  }, [currentChannel]);

  // Handle Enter key for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🔐 Authentication Check
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access team messaging.</p>
        </div>
      </div>
    );
  }

  const currentChannelData = getCurrentChannelData();

  return (
    <div className="p-6" style={{ background: 'linear-gradient(135deg, #fafbff 0%, #e8eafc 100%)', minHeight: '100vh' }}>
      <div className="flex h-[calc(100vh-8rem)] bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-white/20">
      {/* Left Sidebar - Channels */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Team Chat</h1>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Create new channel"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Channel Categories */}
            <div className="mb-4">
              <button 
                onClick={() => setShowChannels(!showChannels)}
                className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span className="flex items-center gap-2">
                  {showChannels ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  Channels
                </span>
                <span className="text-xs text-gray-500">{channels.length}</span>
              </button>
              
              {showChannels && (
                <div className="mt-2 space-y-1">
                  {channels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setCurrentChannel(channel.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 ${
                        currentChannel === channel.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <Hash className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-sm">{channel.name}</span>
                      {channel.unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {channel.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-gray-500" />
            <div>
              <h2 className="font-semibold text-gray-900">{currentChannelData.name || 'Select a channel'}</h2>
              {currentChannelData.description && (
                <p className="text-sm text-gray-500">{currentChannelData.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded" title="Voice Call">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="Video Call">
              <Video className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowMembersList(!showMembersList)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Toggle Members List"
            >
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded" title="More Options">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-2">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-1 text-xs text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const author = message.author || users[message.authorId] || { 
                name: 'Unknown User', 
                avatar: null, 
                role: 'user' 
              };
              
              return (
                <div key={message.id} className="group flex gap-3 hover:bg-gray-50 p-2 rounded">
                  <div className="flex-shrink-0">
                    {author.avatar ? (
                      <img 
                        src={author.avatar} 
                        alt={author.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{author.name}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                      {message.pinned && <Pin className="w-4 h-4 text-blue-600" />}
                      {message.edited && <span className="text-xs text-gray-400">(edited)</span>}
                      
                      {/* Badges */}
                      <div className="flex gap-1">
                        {message.savedToJob && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Saved to Job
                          </span>
                        )}
                        {message.savedToProperty && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Saved to Property
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    {message.content && (
                      <div className="text-gray-800 mb-2">{message.content}</div>
                    )}
                    
                    {/* Location */}
                    {message.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{message.location.address}</span>
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="mb-2">
                            {attachment.type === 'photo' ? (
                              <div className="relative inline-block">
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="max-w-xs max-h-64 rounded-lg border"
                                />
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {attachment.name}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-gray-100 rounded p-3 max-w-xs">
                                <File className="w-5 h-5 text-gray-600" />
                                <div>
                                  <div className="font-medium text-sm">{attachment.name}</div>
                                  <div className="text-xs text-gray-500">{attachment.size}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reactions */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {Object.entries(message.reactions).map(([emoji, userIds]) => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(message.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-1 rounded border text-sm hover:bg-gray-100 ${
                              userIds.includes(user.id) ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{userIds.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Message Actions (show on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleReaction(message.id, '👍')}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                          title="React"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-gray-600 text-sm"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowSaveToModal(message)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                          title="Save to Job/Property"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        
                        {/* Create Job Button */}
                        <button 
                          onClick={() => createJobFromMessage(message)}
                          className="text-blue-400 hover:text-blue-600 text-sm"
                          title="Create Job (Billable Work Order)"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        
                        {/* Create Task Button */}
                        <button 
                          onClick={() => createTaskFromMessage(message)}
                          className="text-green-400 hover:text-green-600 text-sm"
                          title="Create Task (To-Do Item)"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
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
        <div className="bg-white border-t border-gray-200 p-4">
          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 flex gap-2 flex-wrap">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative bg-gray-100 rounded p-2 flex items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-5 h-5 text-gray-600" />
                  ) : (
                    <File className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 border border-gray-300 rounded-lg flex items-center">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message #${currentChannelData.name || 'channel'}`}
                className="flex-1 border-0 resize-none focus:ring-0 p-3 max-h-32 min-h-[44px]"
                rows={1}
                style={{ resize: 'none' }}
              />
              
              {/* Input Actions */}
              <div className="flex items-center gap-2 px-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-gray-600"
                  title="Attach File"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  title="Add Photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  title="Add Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Team Panel */}
      {showMembersList && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-2">
            {Object.values(users).map(member => (
              <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save to Job/Property Modal */}
      {showSaveToModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Save to Job
                </label>
                <select 
                  onChange={(e) => e.target.value && saveMessageToJob(showSaveToModal.id, parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a job...</option>
                  {(globalJobsData.jobs || []).map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.jobNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Save to Property
                </label>
                <select 
                  onChange={(e) => e.target.value && saveMessageToProperty(showSaveToModal.id, parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a property...</option>
                  {allProperties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSaveToModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Channel</h3>
              <button
                onClick={() => {
                  setShowCreateChannel(false);
                  setNewChannelName('');
                  setNewChannelDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="general, hvac-team, announcements..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Use lowercase and dashes (e.g., hvac-maintenance)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="What's this channel about?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateChannel(false);
                  setNewChannelName('');
                  setNewChannelDescription('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={creatingChannel || !newChannelName.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingChannel ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Channel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showJobCreation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Job from Message</h3>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm">{showJobCreation.content}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowJobCreation(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Navigate to job creation with message context
                  onNavigate('jobs', {
                    action: 'create',
                    fromMessage: showJobCreation.content,
                    messageId: showJobCreation.id
                  });
                  setShowJobCreation(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MessagingPage;