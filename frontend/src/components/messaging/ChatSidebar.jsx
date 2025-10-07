// ChatSidebar.jsx - Left sidebar for channels and people (desktop/mobile)
import React from 'react';
import { Hash, Users, Search, Plus } from 'lucide-react';

const ChatSidebar = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  filteredChannels,
  filteredUsers,
  onChannelClick,
  onUserClick,
  onCreateChannel,
  getUserInitials,
  currentChannel,
  currentDmUser
}) => {
  return (
    <div className="flex flex-col h-full bg-white lg:border-r lg:border-gray-200">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Team Chat</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 mx-4 lg:mx-6 mt-4 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-lg text-sm lg:text-base font-medium transition-colors ${
            activeTab === 'channels'
              ? 'bg-white text-dc-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Hash className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" />
          Channels
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-lg text-sm lg:text-base font-medium transition-colors ${
            activeTab === 'people'
              ? 'bg-white text-dc-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 lg:w-5 lg:h-5 inline mr-1 lg:mr-2" />
          People
        </button>
      </div>

      {/* Search */}
      <div className="px-4 lg:px-6 py-3 lg:py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 lg:pl-12 pr-3 py-2 lg:py-3 text-sm lg:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-dc-blue-200 focus:border-dc-blue-500 transition-all"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4">
        {activeTab === 'channels' ? (
          <div className="space-y-2">
            {/* Create Channel Button */}
            <button
              onClick={onCreateChannel}
              className="w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-dc-blue-50 text-dc-blue-600 hover:bg-dc-blue-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-dc-blue-100 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Create Channel</span>
            </button>

            {/* Channels List */}
            {filteredChannels.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchQuery ? 'No channels found' : 'No channels yet'}
              </div>
            ) : (
              filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelClick(channel)}
                  className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl transition-all ${
                    currentChannel?.id === channel.id
                      ? 'bg-dc-blue-50 border-2 border-dc-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentChannel?.id === channel.id ? 'bg-dc-blue-100' : 'bg-gray-100'
                  }`}>
                    <Hash className={`w-5 h-5 ${
                      currentChannel?.id === channel.id ? 'text-dc-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${
                      currentChannel?.id === channel.id ? 'text-dc-blue-900' : 'text-gray-900'
                    }`}>
                      {channel.name}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* People List */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchQuery ? 'No people found' : 'No team members yet'}
              </div>
            ) : (
              filteredUsers.map((person) => (
                <button
                  key={person.id}
                  onClick={() => onUserClick(person)}
                  className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl transition-all ${
                    currentDmUser?.id === person.id
                      ? 'bg-dc-blue-50 border-2 border-dc-blue-500'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                    currentDmUser?.id === person.id ? 'bg-dc-blue-500' : 'bg-green-500'
                  }`}>
                    {getUserInitials(person.name)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${
                      currentDmUser?.id === person.id ? 'text-dc-blue-900' : 'text-gray-900'
                    }`}>
                      {person.name}
                    </div>
                    <div className="text-xs text-gray-500">{person.role}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
