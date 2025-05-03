import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  GraduationCap, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  Eye,
  ExternalLink,
  Download,
  MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Application, StudentProfile } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import ApplicantProfile from '../../components/company/ApplicantProfile';
import ResumeViewer from '../../components/shared/ResumeViewer';
import MessageButton from '../../components/shared/MessageButton';

const CompanyApplications = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');
  const [uniqueInternships, setUniqueInternships] = useState<{ id: string; title: string }[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<StudentProfile | null>(null);
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
          student:profiles!applications_student_id_fkey(*),
          internship:internships(*)
        `)
        .eq('internship.company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // @ts-ignore - We know this is safe because we're getting data from our API
      setApplications(data);
      
      // Extract unique internships for filtering
      const internships = Array.from(new Set(data.map(app => app.internship)))
        .map(internship => ({
          id: internship.id,
          title: internship.title,
        }));
      setUniqueInternships(internships);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (application: Application, newStatus: 'pending' | 'reviewing' | 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;
      
      setApplications(applications.map(app => 
        app.id === application.id ? { ...app, status: newStatus } : app
      ));
      
      // Restore toast notification for explicit messages
      toast.success(`Application ${newStatus}`, {
        duration: 3000,
        position: 'top-center',
        icon: newStatus === 'accepted' ? '✅' : newStatus === 'rejected' ? '❌' : '🔍'
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      searchTerm === '' || 
      application.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesInternship = internshipFilter === 'all' || application.internship_id === internshipFilter;
    
    return matchesSearch && matchesStatus && matchesInternship;
  });

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

  // Add function to view applicant profile
  const viewApplicantProfile = (student: StudentProfile) => {
    setSelectedApplicant(student);
  };

  // Add function to view resume
  const viewResume = (application: Application) => {
    if (!application.resume_url || !application.student) {
      toast.error('No resume available for this student');
      return;
    }
    
    setViewingResume({
      student: application.student,
      url: application.resume_url
    });
  };

  // Add CSV export functionality
  const exportToCSV = () => {
    if (filteredApplications.length === 0) {
      toast.error('No applications to export');
      return;
    }

    try {
      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Headers
      csvContent += 'Student Name,Email,Internship,Status,Applied Date,Updated Date\n';
      
      // Add each application
      filteredApplications.forEach(application => {
        const row = [
          application.student?.full_name || 'Unknown Student',
          application.student?.email || 'No Email',
          application.internship?.title || 'Unknown Internship',
          application.status.charAt(0).toUpperCase() + application.status.slice(1),
          new Date(application.created_at).toLocaleString(),
          new Date(application.updated_at).toLocaleString()
        ];
        
        // Escape any commas in the data
        const escapedRow = row.map(field => {
          // If field contains comma, newline or double-quote, enclose in double quotes
          const formattedField = String(field).replace(/"/g, '""');
          if (formattedField.includes(',') || formattedField.includes('\n') || formattedField.includes('"')) {
            return `"${formattedField}"`;
          }
          return formattedField;
        });
        
        csvContent += escapedRow.join(',') + '\n';
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `company_applications_${new Date().toISOString().replace('T', '_').split('.')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      toast.success('Applications exported successfully');
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('Failed to export applications. See console for details.');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Review Applications</h1>
        <p className="text-gray-600 mt-1">Manage and review internship applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              value={internshipFilter}
              onChange={(e) => setInternshipFilter(e.target.value)}
            >
              <option value="all">All Internships</option>
              {uniqueInternships.map(internship => (
                <option key={internship.id} value={internship.id}>
                  {internship.title}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={16} />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedApplicant && (
          <ApplicantProfile 
            student={selectedApplicant}
            onClose={() => setSelectedApplicant(null)}
            resumeUrl={applications.find(app => 
              app.student?.id === selectedApplicant.id)?.resume_url || undefined}
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
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.student?.full_name || 'Applicant'}
                      </h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Mail size={16} className="mr-1.5" />
                        <span>{application.student?.email}</span>
                      </div>
                      {application.student?.university && (
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <GraduationCap size={16} className="mr-1.5" />
                          <span>{application.student.university}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Eye size={16} />}
                      onClick={() => application.student && viewApplicantProfile(application.student)}
                    >
                      View Profile
                    </Button>
                    
                    {application.resume_url && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<FileText size={16} />}
                        onClick={() => application.student && viewResume(application)}
                      >
                        View Resume
                      </Button>
                    )}
                    
                    {application.student?.id && (
                      <MessageButton
                        recipientId={application.student.id}
                        variant="outline"
                        size="sm"
                      />
                    )}
                    
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

                    {application.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateApplicationStatus(application, 'reviewing')}
                      >
                        Start Review
                      </Button>
                    )}

                    {application.status === 'reviewing' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          icon={<CheckCircle size={16} />}
                          onClick={() => updateApplicationStatus(application, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<XCircle size={16} />}
                          onClick={() => updateApplicationStatus(application, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Applied for: {application.internship?.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied on {new Date(application.created_at).toLocaleString()}
                  </p>
                </div>

                {application.cover_letter && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm">
                      {application.cover_letter}
                    </div>
                  </div>
                )}

                {application.resume_url && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<ExternalLink size={16} />}
                        onClick={() => application.resume_url && window.open(application.resume_url, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Download size={16} />}
                        onClick={() => {
                          if (!application.resume_url) return;
                          const link = document.createElement('a');
                          link.href = application.resume_url;
                          link.download = `${application.student?.full_name || 'applicant'}-resume.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <FileText size={48} className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no applications matching your filters.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CompanyApplications;