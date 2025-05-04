import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    // Parse the full URL hash
    const hashParams = location.hash
      .substring(1)
      .split('#')
      .reduce((params, hash) => {
        const [key, value] = hash.split('=');
        return { ...params, [key]: value };
      }, {} as Record<string, string>);

    // Check if this is a recovery attempt and we have an access token
    if (hashParams.type === 'recovery' && hashParams.access_token) {
      setType('recovery');
      // Store the access token for later use
      localStorage.setItem('resetAccessToken', hashParams.access_token);
    } else {
      navigate('/auth/signin');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the stored access token
      const accessToken = localStorage.getItem('resetAccessToken');

      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Set the session with the access token
      const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

      if (sessionError || !session) {
        throw sessionError || new Error('Failed to set session');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Clear the stored token
      localStorage.removeItem('resetAccessToken');

      toast.success('Password updated successfully!');
      navigate('/auth/signin');
    } catch (err) {
      console.error('Error updating password:', err);
      setError((err as Error).message);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // If not a recovery attempt, don't render the form
  if (type !== 'recovery') {
    return null;
  }

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
        <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
        <p className="mt-2 text-gray-600">
          Please enter your new password below.
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

      <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
          icon={<Lock size={18} />}
          required
        />

        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
          icon={<Lock size={18} />}
          required
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className="mt-6 py-2.5"
        >
          Update password
        </Button>
      </motion.form>
    </motion.div>
  );
};

export default ResetPassword; 