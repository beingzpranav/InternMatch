import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, FileEdit, Filter, X, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Application, StudentProfile } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ResumeViewer from '../../components/shared/ResumeViewer';
import { Toaster } from 'react-hot-toast';

const StudentApplications = () => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingResume, setViewingResume] = useState<{student: StudentProfile, url: string} | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          internship:internships(*)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewResume = (application: Application) => {
    if (!application.resume_url || !user) {
      return;
    }
    
    const studentProfile: Partial<StudentProfile> = {
      id: user.id,
      full_name: user.full_name || 'Student',
      email: user.email || '',
    };
    
    setViewingResume({
      student: studentProfile as StudentProfile,
      url: application.resume_url
    });
  };

  const filteredApplications = statusFilter === 'all' 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const statusIcons = {
    pending: <Clock className="text-warning-500" size={20} />,
    reviewing: <FileEdit className="text-primary-500" size={20} />,
    accepted: <CheckCircle className="text-success-500" size={20} />,
    rejected: <AlertCircle className="text-error-500" size={20} />,
  };

  const getApplicationCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Toaster position="top-center" />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">Track the status of all your internship applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({getApplicationCount('all')})
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('pending')}
            icon={<Clock size={16} />}
          >
            Pending ({getApplicationCount('pending')})
          </Button>
          <Button
            variant={statusFilter === 'reviewing' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('reviewing')}
            icon={<FileEdit size={16} />}
          >
            Reviewing ({getApplicationCount('reviewing')})
          </Button>
          <Button
            variant={statusFilter === 'accepted' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('accepted')}
            icon={<CheckCircle size={16} />}
          >
            Accepted ({getApplicationCount('accepted')})
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('rejected')}
            icon={<AlertCircle size={16} />}
          >
            Rejected ({getApplicationCount('rejected')})
          </Button>
          
          {statusFilter !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('all')}
              icon={<X size={16} />}
            >
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewingResume && (
          <ResumeViewer
            studentName={viewingResume.student.full_name || 'Student'}
            resumeUrl={viewingResume.url}
            onClose={() => setViewingResume(null)}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse-slow flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
            <div className="text-gray-600">Loading applications...</div>
          </div>
        </div>
      ) : filteredApplications.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredApplications.map((application) => (
            <motion.div key={application.id} variants={item}>
              <Card className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <Link to={`/internships/${application.internship_id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                          {application.internship?.title || 'Internship'}
                        </h3>
                      </Link>
                      <p className="text-gray-500 text-sm mt-1">
                        {application.internship?.company?.company_name || 'Company'} •{' '}
                        {application.internship?.location || 'Location'}
                        {application.internship?.is_remote ? ' (Remote)' : ''}
                      </p>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0">
                      {statusIcons[application.status as keyof typeof statusIcons]}
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
                        className="ml-2"
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </span>
                    {application.internship?.type && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {application.internship.type}
                      </span>
                    )}
                    {application.internship?.duration && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        {application.internship.duration}
                      </span>
                    )}
                  </div>

                  {application.cover_letter && (
                    <div className="mt-4">
                      <div
                        className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 line-clamp-2"
                      >
                        <div className="text-xs text-gray-500 mb-1">Your cover letter:</div>
                        {application.cover_letter}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date(application.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {application.resume_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<FileText size={16} />}
                          onClick={() => viewResume(application)}
                        >
                          View Resume
                        </Button>
                      )}
                      <Link to={`/internships/${application.internship_id}`}>
                        <Button size="sm" variant="outline">
                          View Internship
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't applied to any internships yet.
          </p>
          <div className="mt-6">
            <Link to="/internships">
              <Button>Browse Internships</Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentApplications;