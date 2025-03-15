// src/components/common/ProfileDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Wallet, Book } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    if (option === 'logout') {
      logout();
      navigate('/login');
    } else if (option === 'profile') {
      navigate('/profile');
    } else if (option === 'bookings') {
      navigate('/bookings');
    } else if (option === 'wallet') {
      navigate('/wallet');
    }
  };

  const avatarUrl = user && user.email 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6B46C1&color=fff` 
    : '/assets/images/default-avatar.png';

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(prev => !prev)} className="flex items-center focus:outline-none">
        <img src={avatarUrl} alt="Profile Avatar" className="h-10 w-10 rounded-full object-cover" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
          <button onClick={() => handleOptionClick('bookings')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Book className="mr-2 h-4 w-4" />
            Bookings
          </button>
          <button onClick={() => handleOptionClick('profile')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <User className="mr-2 h-4 w-4" />
            Profile
          </button>
          <button onClick={() => handleOptionClick('wallet')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Wallet className="mr-2 h-4 w-4" />
            Wallet
          </button>
          <button onClick={() => handleOptionClick('logout')} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
