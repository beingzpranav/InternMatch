import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Mail, Lock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, sendEmailVerification, isLoading, error, isEmailVerificationError } = useAuthStore();

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
      className="bg-white shadow-md rounded-xl p-6 sm:p-8"
    >
      <motion.div variants={fadeInUp} className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign up
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
            {error}
            {isEmailVerificationError && (
              <button
                onClick={handleResendVerification}
                className="flex items-center mt-2 text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                <RefreshCw size={14} className="mr-1" />
                Resend verification email
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={errors.email}
          icon={<Mail size={18} />}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={errors.password}
          icon={<Lock size={18} />}
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <Link to="/auth/forgot-password" className="text-primary-600 hover:text-primary-500 font-medium text-sm">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Sign in
        </Button>
      </motion.form>
    </motion.div>
  );
};

export default SignInForm;