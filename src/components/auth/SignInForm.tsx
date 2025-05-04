import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Mail, Lock, RefreshCw, Github, CornerUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { 
    signIn, 
    signInWithGithub,
    signInWithGoogle,
    sendEmailVerification, 
    isLoading, 
    error, 
    isEmailVerificationError 
  } = useAuthStore();

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    
    if (!email) formErrors.email = 'Email is required';
    if (!password) formErrors.password = 'Password is required';
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signIn(email, password);
      toast.success('Signed in successfully!');
    } catch (err) {
      // Error is already set in the store
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      toast.success('Signing in with GitHub...');
    } catch (err) {
      // Error is already set in the store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signing in with Google...');
    } catch (err) {
      // Error is already set in the store
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrors({ email: 'Email is required to resend verification' });
      return;
    }
    
    try {
      await sendEmailVerification(email);
      toast.success('Verification email sent!');
    } catch (err) {
      // Error is already set in the store
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="bg-white shadow-md rounded-xl p-6 sm:p-8 w-full max-w-md mx-auto"
    >
      <motion.div variants={fadeInUp} className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-gray-600">
          New to InternMatch?{' '}
          <Link to="/auth/signup" className="text-primary-600 hover:text-primary-500 font-medium">
            Create an account
          </Link>
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
                {isEmailVerificationError && (
                  <button
                    onClick={handleResendVerification}
                    className="flex items-center mt-2 text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Resend verification email
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Login Buttons */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 mb-6">
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          fullWidth
          disabled={isLoading}
          className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-11 relative pl-11"
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5" 
            />
          </span>
          Google
        </Button>
        <Button
          onClick={handleGithubSignIn}
          variant="outline"
          fullWidth
          disabled={isLoading}
          icon={<Github size={18} />}
          className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 h-11"
        >
          GitHub
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp} className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </motion.div>

      <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({});
          }}
          error={errors.email}
          placeholder="Enter your email"
          icon={<Mail size={18} />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({});
          }}
          error={errors.password}
          placeholder="Enter your password"
          icon={<Lock size={18} />}
          autoComplete="current-password"
          required
        />

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="py-2.5"
          >
            Sign in
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default SignInForm;