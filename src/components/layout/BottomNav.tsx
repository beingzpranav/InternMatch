import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, MessageSquare, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  // Define common nav items that work for all user types
  const commonNavItems = [
    { to: user.role === 'admin' ? '/admin' : '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { 
      to: user.role === 'student' ? '/internships' : '/manage-internships', 
      label: user.role === 'student' ? 'Internships' : 'Manage', 
      icon: <Briefcase size={20} /> 
    },
    { to: '/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { to: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        {commonNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center justify-center px-3 py-2 
              ${isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'} 
              transition-colors duration-200
            `}
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center"
                whileTap={{ scale: 0.9 }}
              >
                <div className={`${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 w-6 h-1 bg-primary-500 rounded-t-md"
                    layoutId="bottomNavIndicator"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav; 