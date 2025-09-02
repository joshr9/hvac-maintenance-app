// TechnicianHeader.jsx - Simplified Personal Header for Field Workers
import React from 'react';
import moment from 'moment';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin
} from 'lucide-react';

const TechnicianHeader = ({ 
  currentUser,
  date, 
  onNavigate, 
  onView, 
  view,
  myStats,
  jobCount
}) => {
  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToToday = () => onNavigate('TODAY');

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

  const getTechnicianInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
      
      {/* Main Header Row */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left: Personal Greeting & Date */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {/* User Avatar */}
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                <span className="text-white font-bold text-lg">
                  {getTechnicianInitials(currentUser.name)}
                </span>
              </div>
              
              {/* Personal Greeting */}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {getGreeting()}, {currentUser.name?.split(' ')[0]}!
                </h1>
                <p className="text-blue-200 text-sm font-medium">
                  {formatDateRange()}
                </p>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              <button
                onClick={goToBack}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                aria-label="Previous period"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-3 text-sm font-semibold text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 min-w-[70px]"
              >
                Today
              </button>
              
              <button
                onClick={goToNext}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                aria-label="Next period"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: View Controls & Personal Stats */}
          <div className="flex items-center gap-4">
            
            {/* View Toggle */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              {['week', 'day'].map((viewOption) => (
                <button
                  key={viewOption}
                  onClick={() => onView(viewOption)}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    view === viewOption
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
                </button>
              ))}
            </div>

            {/* Personal Stats Badges */}
            <div className="flex items-center gap-3">
              {/* Today's Jobs */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <CalendarIcon className="w-4 h-4 text-blue-200" />
                <span className="text-white font-semibold">{jobCount}</span>
                <span className="text-blue-200 text-sm">today</span>
              </div>

              {/* Completed This Week */}
              {myStats.completed > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30">
                  <CheckCircle className="w-4 h-4 text-green-200" />
                  <span className="text-white font-semibold">{myStats.completed}</span>
                  <span className="text-green-200 text-sm">done</span>
                </div>
              )}

              {/* Urgent Jobs */}
              {myStats.urgent > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-400/30 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-red-200" />
                  <span className="text-white font-semibold">{myStats.urgent}</span>
                  <span className="text-red-200 text-sm">urgent</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Info Bar */}
      <div className="px-6 py-3 bg-white/5 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          
          {/* Left: Current Location/Zone */}
          <div className="flex items-center gap-4 text-blue-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Primary Zone: {currentUser.primaryZone || 'Not assigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>ID: {currentUser.employeeId || currentUser.id}</span>
            </div>
          </div>

          {/* Right: Current Time & Status */}
          <div className="flex items-center gap-4 text-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianHeader;