import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Building2, Mail, MapPin, Globe, GraduationCap, FileText } from 'lucide-react';
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
  });
  const [isLoading, setIsLoading] = useState(false);

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
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await getUser();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (url: string, file: File) => {
    setFormData(prev => ({ ...prev, resume_url: url }));
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