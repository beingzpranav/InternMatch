import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, X, AlignRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsDropdown from '../shared/NotificationsDropdown';

const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close menus when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all duration-200 ${
      scrolled ? 'shadow-md' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <motion.div 
                className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center text-white mr-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={20} />
              </motion.div>
              <span className="text-lg sm:text-xl font-bold text-primary-900">InternMatch</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>                
                <NotificationsDropdown />

                <div className="relative">
                  <motion.button
                    onClick={toggleProfileMenu}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 border border-transparent hover:border-gray-200 p-1 transition-all"
                    aria-label="User menu"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2">
                      <User size={16} />
                    </div>
                    <span className="text-gray-700 font-medium hidden md:block mr-1">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </motion.button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 origin-top-right z-10"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                            Signed in as <span className="font-medium">{user.role}</span>
                          </div>
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User size={16} className="mr-2" />
                            Your Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <div className="flex space-x-2 items-center">
                <Link to="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <motion.button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Main menu"
              aria-expanded={isMobileMenuOpen}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <AlignRight size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden shadow-lg"
          >
            <div className="pt-3 pb-4 space-y-2 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-2">
                      <User size={16} />
                    </div>
                    <span className="truncate max-w-[200px]">{user.full_name || user.email}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 space-y-3">
                  <Link to="/auth/signin" className="w-full">
                    <Button variant="outline" fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/signup" className="w-full">
                    <Button fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;