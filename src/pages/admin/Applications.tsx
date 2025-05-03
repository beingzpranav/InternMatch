import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Edit, Trash2, Search, CheckCircle, XCircle, Clock, User, ExternalLink, Download, MessageSquare, SortAsc, SortDesc, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast, Toaster } from 'react-hot-toast';
import { StudentProfile, Application as ApplicationType } from '../../types';
import ApplicantProfile from '../../components/company/ApplicantProfile';
import ApplicationDetails from '../../components/shared/ApplicationDetails';
import ResumeViewer from '../../components/shared/ResumeViewer';
import MessageButton from '../../components/shared/MessageButton';

const AdminApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationType | null>(null);
  const [viewingResume, setViewingResume] = useState<{student: StudentProfile, url: string} | null>(null);
  
  // Enhanced filtering options
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting options
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Lists for filters
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [internships, setInternships] = useState<{id: string, title: string}[]>([]);

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
      
      // Extract unique companies and internships for filters
      const uniqueCompanies = Array.from(
        new Set(data.map((app: any) => JSON.stringify({
          id: app.internship?.company_id,
          name: app.internship?.company?.company_name
        })))
      ).map(str => JSON.parse(str));
      
      const uniqueInternships = Array.from(
        new Set(data.map((app: any) => JSON.stringify({
          id: app.internship_id,
          title: app.internship?.title
        })))
      ).map(str => JSON.parse(str));
      
      setCompanies(uniqueCompanies);
      setInternships(uniqueInternships);
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

  const handleViewApplication = (application: ApplicationType) => {
    setSelectedApplication(application);
  };

  const handleViewResume = (application: ApplicationType) => {
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
      ) as ApplicationType[]);
      
      // Only show notification if the student is not online
      const application = applications.find(app => app.id === id);
      if (!application?.student?.is_online) {
        toast.success(`Application status updated to ${status}`, {
          duration: 3000,
          position: 'top-center',
          icon: status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '🔍'
        });
      }
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
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCompanyFilter('all');
    setInternshipFilter('all');
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
      csvContent += 'Student Name,Email,Internship,Company,Status,Applied Date,Updated Date\n';
      
      // Add each application
      filteredApplications.forEach(application => {
        const row = [
          application.student?.full_name || 'Unknown Student',
          application.student?.email || 'No Email',
          application.internship?.title || 'Unknown Internship',
          application.internship?.company?.company_name || 'Unknown Company',
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
      link.setAttribute('download', `applications_export_${new Date().toISOString().replace('T', '_').split('.')[0]}.csv`);
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

  const filteredApplications = applications
    .filter(application => {
      // Search term filter
      const matchesSearch = 
        application.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.internship?.company?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.internship?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      
      // Company filter
      const matchesCompany = companyFilter === 'all' || application.internship?.company_id === companyFilter;
      
      // Internship filter
      const matchesInternship = internshipFilter === 'all' || application.internship_id === internshipFilter;
      
      return matchesSearch && matchesStatus && matchesCompany && matchesInternship;
    })
    .sort((a, b) => {
      let valueA = '';
      let valueB = '';
      
      // Determine sort values based on the selected field
      switch (sortField) {
        case 'student':
          valueA = a.student?.full_name?.toLowerCase() || '';
          valueB = b.student?.full_name?.toLowerCase() || '';
          break;
        case 'company':
          valueA = a.internship?.company?.company_name?.toLowerCase() || '';
          valueB = b.internship?.company?.company_name?.toLowerCase() || '';
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'created_at':
          return sortDirection === 'asc' 
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          valueA = String(a[sortField as keyof ApplicationType] || '');
          valueB = String(b[sortField as keyof ApplicationType] || '');
      }
      
      // Sorting direction
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

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
        <Button 
          variant="outline" 
          icon={<Filter size={16} />} 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
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
        
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  <option value="all">All Companies</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internship
                </label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={internshipFilter}
                  onChange={(e) => setInternshipFilter(e.target.value)}
                >
                  <option value="all">All Internships</option>
                  {internships.map(internship => (
                    <option key={internship.id} value={internship.id}>
                      {internship.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mr-2"
              >
                Reset Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
        
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
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('student')}>
                    <div className="flex items-center">
                      Student
                      {sortField === 'student' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'student' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('internship')}>
                    <div className="flex items-center">
                      Internship
                      {sortField === 'internship' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'internship' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('company')}>
                    <div className="flex items-center">
                      Company
                      {sortField === 'company' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'company' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'status' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center">
                      Applied Date
                      {sortField === 'created_at' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'created_at' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
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
                        {new Date(application.created_at).toLocaleString()}
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
                              onClick={() => handleViewResume(application)}
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
                      {searchTerm || statusFilter !== 'all' || companyFilter !== 'all' || internshipFilter !== 'all' ? 
                        'No applications found matching your filters' : 
                        'No applications found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Export:</span>
            <Button
              variant="outline"
              size="sm"
              icon={<FileText size={16} />}
              onClick={exportToCSV}
            >
              CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApplications; 