import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Bookmark, 
  Building2, 
  Users, 
  Settings,
  Inbox,
  MessageSquare,
  FileEdit,
  BarChart3,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onItemClick?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick, isMobile = false }) => {
  const { user } = useAuthStore();

  if (!user) return null;

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-medium'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  const sidebarLinks = {
    student: [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { to: '/internships', label: 'Browse Internships', icon: <Briefcase size={20} /> },
      { to: '/applications', label: 'My Applications', icon: <FileText size={20} /> },
      { to: '/resume-builder', label: 'Resume Builder', icon: <FileEdit size={20} /> },
      { to: '/bookmarks', label: 'Bookmarks', icon: <Bookmark size={20} /> },
      { to: '/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
      { to: '/profile', label: 'Profile', icon: <Settings size={20} /> },
    ],
    company: [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { to: '/manage-internships', label: 'Manage Internships', icon: <Briefcase size={20} /> },
      { to: '/applications', label: 'Review Applications', icon: <Inbox size={20} /> },
      { to: '/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
      { to: '/profile', label: 'Company Profile', icon: <Settings size={20} /> },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { to: '/admin/companies', label: 'Companies', icon: <Building2 size={20} /> },
      { to: '/admin/students', label: 'Students', icon: <Users size={20} /> },
      { to: '/admin/internships', label: 'Internships', icon: <Briefcase size={20} /> },
      { to: '/admin/applications', label: 'Applications', icon: <FileText size={20} /> },
      { to: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
      { to: '/messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    ],
  };

  const links = sidebarLinks[user.role as keyof typeof sidebarLinks] || [];

  const handleNavLinkClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className={`w-full h-full ${isMobile ? 'bg-white pt-16' : 'border-r border-gray-200 bg-white hidden md:block w-64'}`}>
      <div className="h-full p-4">
        {isMobile && (
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="text-lg font-semibold text-gray-800">Menu</div>
            <div className="text-sm text-gray-500">{user.full_name || user.email}</div>
          </div>
        )}
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={navLinkClasses}
              onClick={handleNavLinkClick}
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center w-full"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={`mr-3 ${isActive 
                    ? 'text-primary-500' 
                    : 'text-gray-500'}`}>
                    {link.icon}
                  </span>
                  <span className="text-base">{link.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;