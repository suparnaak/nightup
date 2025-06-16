import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Wallet, Book, Bookmark, StickyNote, Inbox, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chat badge
  const { conversations, listConversations } = useChatStore();
  const chatUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  // Notification badge
  const { unreadCount: notifUnread, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    listConversations();
    fetchUnreadCount();
  }, [listConversations, fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: string) => {
    setIsOpen(false);
    switch (option) {
      case 'bookings':      return navigate('/user/bookings');
      case 'savedEvents':   return navigate('/user/saved-events');
      case 'profile':       return navigate('/user/profile');
      case 'inbox':         return navigate('/user/inbox');
      case 'notifications': return navigate('/user/notification');
      case 'wallet':        return navigate('/user/wallet');
      case 'logout':
        logout();
        return navigate('/login');
    }
  };

  const avatarUrl = user?.email
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff`
    : '/assets/images/default-avatar.png';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative flex items-center focus:outline-none"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className="h-10 w-10 rounded-full object-cover"
        />
        {/* Chat badge */}
        {chatUnread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
            {chatUnread}
          </span>
        )}
        {/* Notification badge */}
        {notifUnread > 0 && (
          <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
            {notifUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
          <button
            onClick={() => handleOptionClick('bookings')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Book className="mr-2 h-4 w-4" /> Bookings
          </button>
          <button
            onClick={() => handleOptionClick('savedEvents')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Bookmark className="mr-2 h-4 w-4" /> Saved Events
          </button>
          <button
            onClick={() => handleOptionClick('profile')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User className="mr-2 h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => handleOptionClick('inbox')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
          >
            <Inbox className="mr-2 h-4 w-4" /> Inbox
            {chatUnread > 0 && (
              <span className="absolute top-2 right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                {chatUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => handleOptionClick('notifications')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
          >
            <StickyNote className="mr-2 h-4 w-4" /> Notifications
            {notifUnread > 0 && (
              <span className="absolute top-2 right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {notifUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => handleOptionClick('wallet')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Wallet className="mr-2 h-4 w-4" /> Wallet
          </button>
          <button
            onClick={() => handleOptionClick('logout')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
