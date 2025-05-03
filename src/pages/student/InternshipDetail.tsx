import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Clock, 
  Calendar, 
  Briefcase, 
  BookmarkPlus, 
  Bookmark,
  Send,
  CheckCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Internship, Application } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import TextArea from '../../components/ui/TextArea';
import MessageButton from '../../components/shared/MessageButton';

const InternshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [similarInternships, setSimilarInternships] = useState<Internship[]>([]);
  const [userResumeUrl, setUserResumeUrl] = useState<string | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInternshipDetails();
      if (user) {
        checkBookmarkStatus();
        checkApplicationStatus();
        fetchUserResumeUrl();
      }
      
      // Try to get company logo from localStorage
      try {
        const savedLogoUrl = localStorage.getItem('company_logo_url');
        if (savedLogoUrl) {
          setCompanyLogoUrl(savedLogoUrl);
        }
      } catch (err) {
        console.warn('Could not retrieve logo URL from localStorage:', err);
      }
    }
  }, [id, user]);

  const fetchInternshipDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          company:profiles!internships_company_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setInternship(data as Internship);
      
      // Fetch similar internships
      if (data) {
        const { data: similarData, error: similarError } = await supabase
          .from('internships')
          .select('*')
          .eq('status', 'open')
          .neq('id', id)
          .or(`skills.cs.{${data.skills.join(',')}}`)
          .limit(3);
          
        if (!similarError && similarData) {
          setSimilarInternships(similarData as Internship[]);
        }
      }
    } catch (error) {
      console.error('Error fetching internship details:', error);
      toast.error('Failed to load internship details');
      navigate('/internships');
    } finally {
      setIsLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('student_id', user.id)
        .eq('internship_id', id)
        .maybeSingle();

      if (error) throw error;
      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('student_id', user.id)
        .eq('internship_id', id)
        .maybeSingle();

      if (error) throw error;
      setApplication(data as Application | null);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark internships');
      return;
    }

    if (!id) return;

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('student_id', user.id)
          .eq('internship_id', id);

        if (error) throw error;
        
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            student_id: user.id,
            internship_id: id,
          });

        if (error) throw error;
        
        setIsBookmarked(true);
        toast.success('Internship bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const fetchUserResumeUrl = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserResumeUrl(data.resume_url);
    } catch (error) {
      console.error('Error fetching resume URL:', error);
    }
  };

  const applyToInternship = async () => {
    if (!user) {
      toast.error('Please sign in to apply for internships');
      navigate('/auth/signin');
      return;
    }

    if (!id) return;
    
    if (user.role !== 'student') {
      toast.error('Only students can apply for internships');
      return;
    }

    // Check if the user has uploaded a resume
    if (!userResumeUrl) {
      toast.error('Please upload a resume on your profile before applying');
      toast('Click "View Profile" to upload your resume', { icon: '📄', duration: 5000 });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          student_id: user.id,
          internship_id: id,
          cover_letter: coverLetter,
          resume_url: userResumeUrl, // Include the resume URL in the application
        })
        .select()
        .single();

      if (error) throw error;
      
      setApplication(data as Application);
      setCoverLetter('');
      setShowApplicationForm(false);
      toast.success('Application submitted successfully');
    } catch (error) {
      console.error('Error applying to internship:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
          <div className="text-gray-600">Loading internship details...</div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Internship not found</h2>
        <p className="text-gray-600 mt-2">The internship you're looking for doesn't exist or has been removed.</p>
        <div className="mt-6">
          <Link to="/internships">
            <Button>Browse all internships</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <Link to="/internships" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Internship Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Internship header */}
          <Card className="p-6">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{internship.title}</h2>
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full ${
                  isBookmarked
                    ? 'text-primary-500 hover:bg-primary-50'
                    : 'text-gray-400 hover:text-primary-500 hover:bg-gray-50'
                }`}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                {isBookmarked ? <Bookmark size={24} /> : <BookmarkPlus size={24} />}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center text-gray-600">
                <Building2 size={18} className="mr-1.5" />
                <span className="text-sm">{(internship.company as any)?.company_name || 'Company'}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-1.5" />
                <span className="text-sm">{internship.location}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Briefcase size={18} className="mr-1.5" />
                <span className="text-sm">{internship.type}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar size={18} className="mr-1.5" />
                <span className="text-sm">{internship.duration}</span>
              </div>

              {internship.deadline && (
                <div className="flex items-center text-gray-600">
                  <Clock size={18} className="mr-1.5" />
                  <span className="text-sm">
                    Apply by {new Date(internship.deadline).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="primary">{internship.type}</Badge>
              {internship.is_remote && <Badge variant="accent">Remote</Badge>}
              {internship.stipend && <Badge variant="success">Paid</Badge>}
            </div>

            {user?.role === 'student' && !application && (
              <div className="mt-6">
                <Button
                  onClick={() => setShowApplicationForm(!showApplicationForm)}
                  fullWidth
                  icon={<Send size={18} />}
                >
                  Apply Now
                </Button>
              </div>
            )}

            {application && (
              <div className="mt-6 bg-primary-50 p-4 rounded-lg border border-primary-100">
                <div className="flex items-center">
                  <CheckCircle className="text-primary-500 mr-2" size={20} />
                  <div>
                    <h3 className="font-medium text-primary-700">Application Submitted</h3>
                    <p className="text-sm text-primary-600">
                      You applied on {new Date(application.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge
                    variant={
                      application.status === 'accepted'
                        ? 'success'
                        : application.status === 'rejected'
                        ? 'error'
                        : application.status === 'reviewing'
                        ? 'accent'
                        : 'warning'
                    }
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </div>
            )}

            {showApplicationForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h3 className="font-medium text-gray-900 mb-4">Submit Your Application</h3>
                <TextArea
                  label="Cover Letter"
                  placeholder="Tell the employer why you're a good fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500 flex items-center">
                    <FileText size={16} className="mr-1" />
                    {userResumeUrl ? (
                      <span className="text-primary-600">Resume ready to submit</span>
                    ) : (
                      <span className="text-red-500">Please upload a resume on your profile first</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                    {!userResumeUrl ? (
                      <Link to="/profile">
                        <Button variant="primary">
                          Upload Resume
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={applyToInternship}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Submit Application
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </Card>

          {/* Internship description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="whitespace-pre-line">{internship.description}</p>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="whitespace-pre-line">{internship.requirements}</p>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Company info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 mr-4 overflow-hidden">
                {companyLogoUrl ? (
                  <img 
                    src={companyLogoUrl} 
                    alt={(internship.company as any)?.company_name || 'Company'} 
                    className="w-full h-full object-cover"
                  />
                ) : (internship.company as any)?.avatar_url ? (
                  <img 
                    src={(internship.company as any).avatar_url} 
                    alt={(internship.company as any)?.company_name || 'Company'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                <Building2 size={24} />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {(internship.company as any)?.company_name || 'Company Name'}
                </h4>
                <p className="text-sm text-gray-500">
                  {(internship.company as any)?.company_industry || 'Industry'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {(internship.company as any)?.bio || 'No company description available.'}
            </p>
            {(internship.company as any)?.website && (
              <a
                href={(internship.company as any).website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 inline-flex justify-center items-center px-4 py-2.5 text-base font-medium rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-300 text-gray-800 focus:ring-primary-300 hover:border-primary-500 hover:text-primary-700 transition-all duration-200 shadow-sm"
              >
                Visit Website
              </a>
            )}
            {user?.role === 'student' && internship?.company?.id && (
              <div className="pt-2">
                <MessageButton
                  recipientId={internship.company.id}
                  variant="outline"
                  size="sm"
                  label="Message Company"
                  className="w-full"
                  internshipId={internship.id}
                />
              </div>
            )}
          </Card>

          {/* Similar internships */}
          {similarInternships.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Internships</h3>
              <div className="space-y-4">
                {similarInternships.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/internships/${similar.id}`}
                    className="block group"
                  >
                    <div className="p-3 border border-gray-100 rounded-lg hover:border-primary-100 hover:bg-gray-50 transition-all">
                      <h4 className="font-medium text-gray-900 group-hover:text-primary-600">
                        {similar.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{similar.location}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="primary">{similar.type}</Badge>
                        {similar.is_remote && <Badge variant="accent">Remote</Badge>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Application status */}
          {application && (
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
              <div className="relative">
                <div className="flex items-center mb-6">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.status !== 'rejected'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-error-100 text-error-500'
                    } z-10`}
                  >
                    1
                  </div>
                  <div className="ml-4">
                    <h4
                      className={`font-medium ${
                        application.status !== 'rejected'
                          ? 'text-primary-700'
                          : 'text-gray-700'
                      }`}
                    >
                      Application Submitted
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Vertical line connector */}
                <div
                  className={`absolute top-8 left-4 bottom-8 w-0.5 ${
                    application.status !== 'pending'
                      ? 'bg-primary-200'
                      : 'bg-gray-200'
                  }`}
                ></div>

                <div className="flex items-center mb-6">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.status === 'reviewing' ||
                      application.status === 'accepted' ||
                      application.status === 'rejected'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-400'
                    } z-10`}
                  >
                    2
                  </div>
                  <div className="ml-4">
                    <h4
                      className={`font-medium ${
                        application.status === 'reviewing' ||
                        application.status === 'accepted' ||
                        application.status === 'rejected'
                          ? 'text-primary-700'
                          : 'text-gray-400'
                      }`}
                    >
                      Application Under Review
                    </h4>
                    <p className="text-sm text-gray-500">
                      {application.status === 'reviewing' ||
                      application.status === 'accepted' ||
                      application.status === 'rejected'
                        ? 'Your application is being reviewed'
                        : 'Waiting for review'}
                    </p>
                  </div>
                </div>

                {/* Vertical line connector */}
                <div
                  className={`absolute top-36 left-4 bottom-0 w-0.5 ${
                    application.status === 'accepted' || application.status === 'rejected'
                      ? 'bg-primary-200'
                      : 'bg-gray-200'
                  }`}
                ></div>

                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      application.status === 'accepted'
                        ? 'bg-success-100 text-success-600'
                        : application.status === 'rejected'
                        ? 'bg-error-100 text-error-600'
                        : 'bg-gray-100 text-gray-400'
                    } z-10`}
                  >
                    3
                  </div>
                  <div className="ml-4">
                    <h4
                      className={`font-medium ${
                        application.status === 'accepted'
                          ? 'text-success-700'
                          : application.status === 'rejected'
                          ? 'text-error-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {application.status === 'accepted'
                        ? 'Application Accepted'
                        : application.status === 'rejected'
                        ? 'Application Rejected'
                        : 'Decision Pending'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {application.status === 'accepted'
                        ? 'Congratulations! Your application has been accepted.'
                        : application.status === 'rejected'
                        ? 'Unfortunately, your application was not selected.'
                        : 'Waiting for final decision'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InternshipDetail;