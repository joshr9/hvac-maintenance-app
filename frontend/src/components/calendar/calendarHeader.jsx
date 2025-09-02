// Enhanced CalendarHeader.jsx - Modern, Professional Design
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  Users, 
  Building,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  MapPin,
  Grid,
  Filter,
  User,
  Home
} from 'lucide-react';
import { getTechnicianInitials } from './calendarHelpers';

const EnhancedCalendarHeader = ({ 
  date, 
  onNavigate, 
  onView, 
  view, 
  onCreateJob,
  searchQuery,
  setSearchQuery,
  teamMembers,
  filterTeamMember,
  setFilterTeamMember,
  filterProperty,
  setFilterProperty,
  activeFilters,
  onRemoveFilter,
  calendarViewType = 'combined',
  setCalendarViewType,
  allProperties = []
}) => {
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowTeamDropdown(false);
        setShowPropertyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation functions
  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToToday = () => onNavigate('TODAY');

  // Date formatting
  const formatDateRange = () => {
    const momentDate = moment(date);
    switch (view) {
      case 'month':
        return momentDate.format('MMMM YYYY');
      case 'week':
        { const start = momentDate.clone().startOf('week');
        const end = momentDate.clone().endOf('week');
        return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`; }
      case 'day':
        return momentDate.format('dddd, MMMM D, YYYY');
      default:
        return momentDate.format('MMMM YYYY');
    }
  };

  const totalJobs = teamMembers.reduce((sum, member) => sum + member.jobCount, 0);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-2xl border-b border-blue-800/30">
      
      {/* Row 1: Enhanced Main Navigation */}
      <div className="px-6 py-4 border-b border-blue-800/20">
        <div className="flex items-center justify-between">
          
          {/* Left: Date and Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{formatDateRange()}</h1>
                <p className="text-blue-200 text-sm font-medium">Property Management Calendar</p>
              </div>
            </div>
            
            {/* Enhanced Navigation Controls */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
              <button
                onClick={goToBack}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                aria-label="Previous period"
              >
                <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-3 text-sm font-semibold text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 min-w-[70px]"
              >
                Today
              </button>
              
              <button
                onClick={goToNext}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                aria-label="Next period"
              >
                <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: View Controls */}
          <div className="flex items-center gap-4">
            
            {/* Calendar View Toggle */}
            <div className="flex bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
              {['month', 'week', 'day'].map((viewOption) => (
                <button
                  key={viewOption}
                  onClick={() => onView(viewOption)}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 min-w-[80px] ${
                    view === viewOption
                      ? 'bg-white text-blue-900 shadow-lg transform scale-105'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
                </button>
              ))}
            </div>

            {/* Enhanced Zone/Team View Toggle */}
            {setCalendarViewType && (
              <div className="flex bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-1 border border-blue-400/30">
                <button
                  onClick={() => setCalendarViewType('team')}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    calendarViewType === 'team'
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                  title="Group by team members"
                >
                  <Users className="w-4 h-4" />
                  Team
                </button>
                <button
                  onClick={() => setCalendarViewType('zone')}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    calendarViewType === 'zone'
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                  title="Group by property zones"
                >
                  <MapPin className="w-4 h-4" />
                  Zones
                </button>
                <button
                  onClick={() => setCalendarViewType('combined')}
                  className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    calendarViewType === 'combined'
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                  title="Show all jobs together"
                >
                  <Grid className="w-4 h-4" />
                  All
                </button>
              </div>
            )}

            {/* Enhanced Create Job Button */}
            <button
              onClick={onCreateJob}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Job
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Enhanced Search and Filters */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-4 flex-1">
            
            {/* Enhanced Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-300" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                placeholder="Search jobs, properties, technicians..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Enhanced Team Filter - Visual Chips */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  {filterTeamMember !== 'all' ? (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getTechnicianInitials(filterTeamMember)}
                    </div>
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                  <span>{filterTeamMember === 'all' ? 'All Team' : filterTeamMember}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showTeamDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => {
                        setFilterTeamMember('all');
                        setShowTeamDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                        filterTeamMember === 'all' ? 'bg-blue-100 text-blue-900 shadow-md' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">All Team Members</div>
                        <div className="text-sm text-gray-600">{totalJobs} total jobs</div>
                      </div>
                    </button>
                    
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setFilterTeamMember(member.name);
                          setShowTeamDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                          member.name === filterTeamMember ? 'bg-blue-100 text-blue-900 shadow-md' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getTechnicianInitials(member.name)}
                        </div>
                        <div>
                          <div className="font-semibold">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.jobCount} jobs</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Property Filter */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span className="capitalize">{filterProperty === 'all' ? 'All Properties' : filterProperty}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showPropertyDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 space-y-2">
                    {['All Properties', ...allProperties.map(p => p.name)].map((property) => (
                      <button
                        key={property}
                        onClick={() => {
                          setFilterProperty(property === 'All Properties' ? 'all' : property.toLowerCase());
                          setShowPropertyDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                          (property === 'All Properties' && filterProperty === 'all') || 
                          property.toLowerCase() === filterProperty 
                            ? 'bg-green-100 text-green-900 shadow-md' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Building className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold">{property}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Filters and Current Time */}
          <div className="flex items-center gap-4">
            
            {/* Active Filter Pills */}
            <div className="flex items-center gap-2">
              {filterTeamMember !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-100 rounded-full text-sm border border-blue-400/30 backdrop-blur-sm">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getTechnicianInitials(filterTeamMember)}
                  </div>
                  <span className="font-medium">{filterTeamMember}</span>
                  <button 
                    onClick={() => setFilterTeamMember('all')}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {filterProperty !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-100 rounded-full text-sm border border-green-400/30 backdrop-blur-sm">
                  <Building className="w-4 h-4" />
                  <span className="font-medium capitalize">{filterProperty}</span>
                  <button 
                    onClick={() => setFilterProperty('all')}
                    className="text-green-200 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {setCalendarViewType && calendarViewType !== 'combined' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-100 rounded-full text-sm border border-purple-400/30 backdrop-blur-sm">
                  {calendarViewType === 'team' ? <Users className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  <span className="font-medium">View: {calendarViewType.charAt(0).toUpperCase() + calendarViewType.slice(1)}</span>
                </div>
              )}
            </div>

            {/* Current Time Display */}
            <div className="text-blue-200 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })} • {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCalendarHeader;