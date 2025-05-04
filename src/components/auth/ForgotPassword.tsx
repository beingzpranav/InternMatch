import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });

      if (resetError) throw resetError;

      setIsSuccess(true);
      toast.success('Password reset instructions sent to your email!');
    } catch (err) {
      console.error('Error sending reset email:', err);
      setError((err as Error).message);
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-gray-600">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {isSuccess ? (
        <motion.div
          variants={fadeInUp}
          className="text-center p-4 rounded-lg bg-success-50 border border-success-200"
        >
          <h3 className="text-lg font-medium text-success-800 mb-2">Check your email</h3>
          <p className="text-success-700 mb-4">
            We've sent password reset instructions to {email}
          </p>
          <Link
            to="/auth/signin"
            className="inline-flex items-center text-success-700 hover:text-success-800 font-medium"
          >
            <ArrowLeft size={16} className="mr-1" />
            Return to sign in
          </Link>
        </motion.div>
      ) : (
        <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            icon={<Mail size={18} />}
            autoComplete="email"
            required
          />

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="py-2.5"
            >
              Send reset instructions
            </Button>

            <Link
              to="/auth/signin"
              className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to sign in
            </Link>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
};

export default ForgotPassword; 