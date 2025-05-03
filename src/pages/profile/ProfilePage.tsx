import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Building2, Mail, MapPin, Globe, GraduationCap, FileText, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';
import FileUpload from '../../components/ui/FileUpload';

const ProfilePage = () => {
  const { user, getUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    company_name: '',
    company_size: '',
    company_industry: '',
    university: '',
    degree: '',
    graduation_year: '',
    resume_url: '',
    avatar_url: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        company_name: user.company_name || '',
        company_size: user.company_size || '',
        company_industry: user.company_industry || '',
        university: user.university || '',
        degree: user.degree || '',
        graduation_year: user.graduation_year?.toString() || '',
        resume_url: user.resume_url || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  useEffect(() => {
    try {
      const savedLogoUrl = localStorage.getItem('company_logo_url');
      if (savedLogoUrl) {
        setLogoUrl(savedLogoUrl);
      }
    } catch (err) {
      console.warn('Could not retrieve logo URL from localStorage:', err);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Create update object with all form fields
      const updateData = {
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        updated_at: new Date().toISOString(),
      };

      // Log the update for debugging
      console.log('Updating profile with:', updateData);
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        if (error.message.includes('security policy') || error.message.includes('permission')) {
          throw new Error('Permission denied. You do not have access to update this profile.');
        } else if (error.message.includes('foreign key constraint')) {
          throw new Error('Update failed due to a database constraint. Please contact support.');
        } else {
          throw error;
        }
      }

      await getUser();
      setIsEditing(false);
      
      // Only show toast if no files were uploaded (to avoid duplicate notifications)
      if (!formData.resume_url && !formData.avatar_url) {
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (url: string, file: File) => {
    if (url) {
      setFormData(prev => ({ ...prev, resume_url: url }));
    }
  };

  const handleAvatarUpload = (url: string, file: File) => {
    if (url) {
      setFormData(prev => ({ ...prev, avatar_url: url }));
    }
  };

  const handleLogoUpload = (url: string, file: File) => {
    if (url) {
      // Just store the logo URL in a local state variable
      // We'll handle it separately from profile updates
      setLogoUrl(url);
      toast.success('Company logo uploaded successfully!');
      
      // Store the logo URL in localStorage to persist it across sessions
      try {
        localStorage.setItem('company_logo_url', url);
      } catch (err) {
        console.warn('Could not save logo URL to localStorage:', err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'outline' : 'primary'}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center">
            <div className="mr-6">
              {formData.avatar_url ? (
                <img 
                  src={formData.avatar_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={40} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {user?.role === 'student' ? 'Your Profile Photo' : 'Your Profile Photo'}
              </h3>
              {isEditing ? (
                <FileUpload 
                  onFileUpload={handleAvatarUpload}
                  currentFileUrl={formData.avatar_url}
                  accept="image/*"
                  maxSize={5}
                  buttonText="Upload Photo"
                  fieldName="avatar_url"
                />
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.avatar_url 
                    ? 'Your profile photo is visible to recruiters and other users' 
                    : 'Upload a photo to personalize your profile'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              icon={<User size={18} />}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              disabled
              icon={<Mail size={18} />}
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!isEditing}
              icon={<MapPin size={18} />}
            />
            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              disabled={!isEditing}
              icon={<Globe size={18} />}
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              rows={4}
            />
          </div>
        </Card>

        {user?.role === 'company' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
            
            {/* Company Logo Section */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className="mr-6">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="w-24 h-24 rounded-lg object-contain border-2 border-gray-200 p-1"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Building2 size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Company Logo</h3>
                  {isEditing ? (
                    <FileUpload 
                      onFileUpload={handleLogoUpload}
                      currentFileUrl={logoUrl}
                      accept="image/*"
                      maxSize={5}
                      buttonText="Upload Logo"
                      fieldName="company_logo"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {logoUrl 
                        ? 'Your company logo is visible on your listings and profile' 
                        : 'Upload your company logo to improve brand recognition'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                disabled={!isEditing}
                icon={<Building2 size={18} />}
              />
              <Input
                label="Industry"
                value={formData.company_industry}
                onChange={(e) => setFormData({ ...formData, company_industry: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Company Size"
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., 1-10, 11-50, 51-200"
              />
            </div>
          </Card>
        )}

        {user?.role === 'student' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="University/College"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                disabled={!isEditing}
                icon={<GraduationCap size={18} />}
              />
              <Input
                label="Degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Graduation Year"
                type="number"
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                disabled={!isEditing}
              />
              <div className="col-span-2">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resume
                  </label>
                  {!isEditing ? (
                    formData.resume_url ? (
                      <div className="flex items-center mt-2 space-x-2">
                        <FileText size={20} className="text-primary-600" />
                        <a 
                          href={formData.resume_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">No resume uploaded</p>
                    )
                  ) : (
                    <FileUpload 
                      onFileUpload={handleFileUpload}
                      currentFileUrl={formData.resume_url}
                      accept=".pdf,.doc,.docx"
                      maxSize={10}
                      fieldName="resume_url"
                    />
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default ProfilePage;