import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Save,
  ArrowLeft,
  Tags
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Internship } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Card from '../../components/ui/Card';

const CreateEditInternship = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Internship>>({
    title: '',
    description: '',
    requirements: '',
    location: '',
    is_remote: false,
    type: 'full-time',
    duration: '',
    stipend: '',
    deadline: '',
    skills: [],
    status: 'draft',
  });

  // Add state for skills input
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchInternship();
    }
  }, [id]);

  const fetchInternship = async () => {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        // Set skills input if data exists
        if (data.skills && Array.isArray(data.skills)) {
          setSkillsInput(data.skills.join(', '));
        }
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      toast.error('Failed to load internship details');
      navigate('/manage-internships');
    }
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillsInput(value);
    
    // Parse skills into array when submitting
    const skillsArray = value
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');
    
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const internshipData = {
        ...formData,
        company_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        // Update existing internship
        const { error } = await supabase
          .from('internships')
          .update(internshipData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Internship updated successfully');
      } else {
        // Create new internship
        const { error } = await supabase
          .from('internships')
          .insert([internshipData]);

        if (error) throw error;
        toast.success('Internship created successfully');
      }

      navigate('/manage-internships');
    } catch (error) {
      console.error('Error saving internship:', error);
      toast.error('Failed to save internship');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/manage-internships')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Internship' : 'Create New Internship'}
          </h1>
          <p className="text-gray-600 mt-1">
            {id ? 'Update your internship listing' : 'Post a new internship opportunity'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 border-2 border-gray-200" variant="elevated">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Basic Information</h2>
          <div className="space-y-5">
            <Input
              label="Internship Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              icon={<Building2 size={18} className="text-primary-600" />}
              helperText="Enter a descriptive title for the internship position"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                icon={<MapPin size={18} className="text-primary-600" />}
                helperText="Physical location or 'Remote'"
              />

              <div className="flex items-center space-x-3">
                <Input
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  placeholder="e.g., 3 months"
                  icon={<Calendar size={18} className="text-primary-600" />}
                  helperText="Length of the internship"
                />

                <Input
                  label="Stipend (optional)"
                  value={formData.stipend}
                  onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  placeholder="e.g., $1000/month"
                  icon={<DollarSign size={18} className="text-primary-600" />}
                  helperText="Monthly compensation"
                />
              </div>

              <Input
                label="Application Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                icon={<Clock size={18} className="text-primary-600" />}
                helperText="Last date to apply"
              />

              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Internship Type
                </label>
                <div className="flex items-center space-x-4">
                  <select
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 text-base"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'full-time' | 'part-time' })}
                    required
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_remote}
                      onChange={(e) => setFormData({ ...formData, is_remote: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                    />
                    <span className="text-base text-gray-800 font-medium">Remote Work</span>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-1">Select the work schedule and location type</p>
              </div>
            </div>

            <TextArea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              placeholder="Describe the internship role, responsibilities, and what interns can expect to learn..."
              helperText="Provide a detailed overview of the internship position"
              className="border-2 border-gray-200 focus:border-primary-500"
            />

            <TextArea
              label="Requirements"
              value={formData.requirements || ''}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              required
              rows={4}
              placeholder="List the required skills, qualifications, and any prerequisites..."
              helperText="Specify qualifications needed for this position"
              className="border-2 border-gray-200 focus:border-primary-500"
            />

            <div>
              <Input
                label="Skills Required"
                value={skillsInput}
                onChange={handleSkillsChange}
                required
                placeholder="Enter skills separated by commas (e.g., React, JavaScript, Node.js)"
                icon={<Tags size={18} className="text-primary-600" />}
                helperText="Enter skills separated by commas"
              />
              
              {/* Display skills as tags for better visibility */}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills && formData.skills.length > 0 && formData.skills.map((skill, index) => (
                  <div 
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Status
              </label>
              <select
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 py-3 text-base"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'open' | 'closed' })}
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              <p className="mt-1.5 text-sm text-gray-600">
                Draft: Save for later, Open: Visible to students, Closed: No longer accepting applications
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/manage-internships')}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            icon={<Save size={18} />}
            size="lg"
          >
            {id ? 'Update Internship' : 'Create Internship'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateEditInternship;