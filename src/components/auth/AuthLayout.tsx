import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Toaster } from 'react-hot-toast';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  const { user, isLoading, getUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-primary-500 rounded-md flex items-center justify-center text-white mr-3"
            >
              <User size={20} />
            </motion.div>
            <span className="text-xl font-bold text-primary-900">InternMatch</span>
          </Link>
          <nav>
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <Outlet />
      </main>
      
      <footer className="py-4 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-sm text-gray-500">
            <span>&copy; {new Date().getFullYear()} InternMatch. All rights reserved.</span>
            <div className="mt-2 flex justify-center space-x-4">
              <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-800 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-primary-600 hover:text-primary-800 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#333',
          },
        }}
      />
    </div>
  );
};

export default AuthLayout;