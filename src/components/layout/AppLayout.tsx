import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppLayout = () => {
  const { user, isLoading, getUser } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    getUser();
  }, [getUser]);

  // If still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    navigate('/auth/signin');
    return null;
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Mobile sidebar toggle button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={toggleMobileSidebar}
          className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>
      
      <div className="flex flex-1 pt-16">
        {/* Desktop sidebar - always visible on md+ screens */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Mobile sidebar - conditionally visible */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div 
              className="fixed inset-0 z-30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <motion.div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={toggleMobileSidebar}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              
              {/* Sidebar */}
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-64 bg-white"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              >
                <Sidebar onItemClick={() => setIsMobileSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      <Footer />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'text-sm',
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#333',
          },
          success: {
            style: {
              border: '1px solid #22c55e',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#FFFAEE',
            },
          },
          error: {
            style: {
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#FFFAEE',
            },
          },
        }}
      />
    </div>
  );
};

export default AppLayout;