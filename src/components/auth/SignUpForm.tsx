import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Mail, Lock, User, Building2, GraduationCap } from 'lucide-react';
import { UserRole } from '../../types';
import { motion } from 'framer-motion';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [companyName, setCompanyName] = useState('');
  const [university, setUniversity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    
    if (!email) formErrors.email = 'Email is required';
    if (!password) formErrors.password = 'Password is required';
    if (password.length < 6) formErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) formErrors.confirmPassword = 'Passwords do not match';
    if (!fullName) formErrors.fullName = 'Full name is required';
    
    if (role === 'company' && !companyName) {
      formErrors.companyName = 'Company name is required';
    }
    
    if (role === 'student' && !university) {
      formErrors.university = 'University name is required';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const userData: Record<string, any> = {
      full_name: fullName,
    };
    
    if (role === 'company') {
      userData.company_name = companyName;
    } else if (role === 'student') {
      userData.university = university;
    }
    
    try {
      await signUp(email, password, role, userData);
      toast.success('Account created successfully!');
    } catch (err) {
      // Error is already set in the store
    }
  };

  return (
    <motion.div 
      className="bg-white shadow-md rounded-xl p-6 sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
        <p className="mt-2 text-gray-600">
          Or{' '}
          <Link to="/auth/signin" className="text-primary-600 hover:text-primary-500 font-medium">
            sign in to your account
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="I am a"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'student', label: 'Student looking for internships' },
            { value: 'company', label: 'Company hiring interns' },
          ]}
        />

        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          error={errors.fullName}
          icon={<User size={18} />}
          required
        />

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

        {role === 'company' && (
          <Input
            label="Company Name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
            error={errors.companyName}
            icon={<Building2 size={18} />}
            required
          />
        )}

        {role === 'student' && (
          <Input
            label="University/College"
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Enter university or college name"
            error={errors.university}
            icon={<GraduationCap size={18} />}
            required
          />
        )}

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          error={errors.password}
          icon={<Lock size={18} />}
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          error={errors.confirmPassword}
          icon={<Lock size={18} />}
          autoComplete="new-password"
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
          >
            Sign up
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </motion.div>
  );
};

export default SignUpForm;