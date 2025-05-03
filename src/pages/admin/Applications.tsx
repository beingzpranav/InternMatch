import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Edit, Trash2, Search, CheckCircle, XCircle, Clock, User, ExternalLink, Download, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast, Toaster } from 'react-hot-toast';
import { StudentProfile } from '../../types';
import ApplicantProfile from '../../components/company/ApplicantProfile';
import ApplicationDetails from '../../components/shared/ApplicationDetails';
import ResumeViewer from '../../components/shared/ResumeViewer';
import MessageButton from '../../components/shared/MessageButton';

interface Application {
  id: string;
  internship_id: string;
  student_id: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
  student: StudentProfile;
  internship: {
    title: string;
    company_id: string;
    company: {
      company_name: string;
    };
  };
}

// Define a local interface for the application type being used in this component
interface LocalApplication {
  id: string;
  internship_id: string;
  student_id: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  resume_url: string | null;
  created_at: string;
  updated_at: string;
  student?: StudentProfile;
  internship?: {
    title: string;
    company_id: string;
    company: {
      company_name: string;
    };
  };
}

const AdminApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewingResume, setViewingResume] = useState<{student: StudentProfile, url: string} | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          student:profiles!applications_student_id_fkey(*),
          internship:internships(
            id, 
            title, 
            company_id,
            location,
            is_remote,
            duration,
            stipend,
            company:profiles!internships_company_id_fkey(company_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // @ts-ignore - We know this is safe because we're getting data from our API
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStudentProfile = (student: StudentProfile) => {
    setSelectedStudent(student);
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleViewResume = (application: LocalApplication) => {
    if (!application.resume_url || !application.student) {
      toast.error('No resume available for this student');
      return;
    }
    
    setViewingResume({
      student: application.student,
      url: application.resume_url
    });
  };

  const handleUpdateStatus = async (id: string, status: 'pending' | 'reviewing' | 'accepted' | 'rejected') => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state with type assertion
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status, updated_at: new Date().toISOString() } : app
      ) as Application[]);
      
      // Restore toast notification to ensure visibility
      toast.success(`Application status updated to ${status}`, {
        duration: 3000,
        position: 'top-center',
        icon: status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '🔍'
      });
      
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Update local state
        setApplications(applications.filter(application => application.id !== id));
        toast.success('Application deleted successfully');
      } catch (error) {
        console.error('Error deleting application:', error);
        toast.error('Failed to delete application');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'reviewing':
        return <Badge variant="accent">Reviewing</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter(application => 
    application.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.internship?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.internship?.company?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      
      <AnimatePresence>
        {selectedStudent && (
          <ApplicantProfile 
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            resumeUrl={applications.find(app => 
              app.student?.id === selectedStudent.id)?.resume_url || undefined}
          />
        )}
        {selectedApplication && (
          <ApplicationDetails
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdateStatus={(status) => {
              handleUpdateStatus(selectedApplication.id, status);
              // Keep the modal open to see the changes
            }}
            isAdmin={true}
          />
        )}
        {viewingResume && (
          <ResumeViewer
            studentName={viewingResume.student.full_name || 'Student'}
            resumeUrl={viewingResume.url}
            onClose={() => setViewingResume(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Applications</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Applications List</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-gray-500">Loading applications...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Internship</th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Applied Date</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{application.student?.full_name || 'Unknown Student'}</span>
                          <button
                            className="text-primary-600 hover:text-primary-800"
                            title="View Student Profile"
                            onClick={() => application.student && handleViewStudentProfile(application.student)}
                          >
                            <User size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {application.internship?.title || 'Unknown Internship'}
                      </td>
                      <td className="py-3 px-4">
                        {application.internship?.company?.company_name || 'Unknown Company'}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(application.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            title="View Application Details"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="View Student Profile"
                            onClick={() => application.student && handleViewStudentProfile(application.student)}
                          >
                            <User size={18} />
                          </button>
                          {application.student && (
                            <button
                              className="text-purple-600 hover:text-purple-800"
                              title="Message Student"
                              onClick={() => navigate(`/messages?recipient=${application.student.id}`)}
                            >
                              <MessageSquare size={18} />
                            </button>
                          )}
                          {application.resume_url && (
                            <button
                              className="flex items-center text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md text-sm"
                              title="View Resume"
                              onClick={() => handleViewResume(application as LocalApplication)}
                            >
                              <FileText size={16} className="mr-1" />
                              Resume
                            </button>
                          )}
                          <button 
                            className="text-red-600 hover:text-red-800"
                            title="Delete Application"
                            onClick={() => handleDelete(application.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-200">
                    <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                      {searchTerm ? 'No applications found matching your search' : 'No applications found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications; 