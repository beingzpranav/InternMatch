import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Globe, 
  Users,
  Briefcase, 
  ArrowLeft, 
  Edit, 
  Trash2,
  FileText,
  ClipboardList,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CompanyProfile as ICompanyProfile, Internship, Application } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { toast, Toaster } from 'react-hot-toast';

// Extended interfaces for data with counts
interface CompanyWithCounts extends ICompanyProfile {
  internships_count?: number;
  applications_count?: number;
}

interface InternshipWithApplications extends Internship {
  applications_count?: { count: number }[];
}

const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyWithCounts | null>(null);
  const [internships, setInternships] = useState<InternshipWithApplications[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch company profile
      const { data: companyData, error: companyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'company')
        .single();

      if (companyError) throw companyError;
      
      if (!companyData) {
        setError('Company not found');
        setIsLoading(false);
        return;
      }

      // Fetch internships count
      const { count: internshipsCount, error: countError } = await supabase
        .from('internships')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', id);

      if (countError) throw countError;

      // Fetch applications count
      const { data: internshipIds, error: internshipIdsError } = await supabase
        .from('internships')
        .select('id')
        .eq('company_id', id);

      if (internshipIdsError) throw internshipIdsError;

      let applicationsCount = 0;
      if (internshipIds && internshipIds.length > 0) {
        const ids = internshipIds.map(item => item.id);
        const { count: appCount, error: appCountError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('internship_id', ids);

        if (appCountError) throw appCountError;
        applicationsCount = appCount || 0;
      }

      // Fetch internships
      const { data: internshipsData, error: internshipsError } = await supabase
        .from('internships')
        .select(`
          *,
          applications_count:applications(count)
        `)
        .eq('company_id', id)
        .order('created_at', { ascending: false });

      if (internshipsError) throw internshipsError;

      // Fetch recent applications
      if (internshipIds && internshipIds.length > 0) {
        const ids = internshipIds.map(item => item.id);
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            *,
            student:profiles!applications_student_id_fkey(*),
            internship:internships(*)
          `)
          .in('internship_id', ids)
          .order('created_at', { ascending: false })
          .limit(5);

        if (applicationsError) throw applicationsError;
        setRecentApplications(applicationsData as Application[]);
      }

      // Update company with counts
      const companyWithCounts: CompanyWithCounts = {
        ...companyData,
        internships_count: internshipsCount || 0,
        applications_count: applicationsCount
      };

      setCompany(companyWithCounts);
      setInternships(internshipsData as InternshipWithApplications[]);
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      setError(error.message || 'Failed to load company data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        
        // First, delete all associated internships
        const { error: internshipsError } = await supabase
          .from('internships')
          .delete()
          .eq('company_id', id);
        
        if (internshipsError) throw internshipsError;
        
        // Then delete the company profile
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('Company deleted successfully');
        navigate('/admin/companies');
      } catch (error: any) {
        console.error('Error deleting company:', error);
        toast.error('Failed to delete company: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="success">Open</Badge>;
      case 'closed':
        return <Badge variant="error">Closed</Badge>;
      case 'draft':
        return <Badge variant="warning">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
          <div className="text-gray-600">Loading company profile...</div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center mb-8">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Company</h2>
          <p className="text-red-600 mb-4">{error || 'Company not found'}</p>
          <Link to="/admin/companies">
            <Button variant="outline">
              Back to Companies List
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      
      <div className="flex items-center mb-6">
        <Link to="/admin/companies" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <div className="ml-auto flex space-x-3">
          <Button
            variant="outline"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/admin/companies/edit/${id}`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 mb-4">
              {company.avatar_url ? (
                <img 
                  src={company.avatar_url} 
                  alt={company.company_name || ''} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Building2 size={40} />
              )}
            </div>
            <h2 className="text-xl font-bold">{company.company_name || 'Unnamed Company'}</h2>
            <p className="text-gray-600">{company.company_industry || 'Industry not specified'}</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{company.internships_count}</div>
                <div className="text-sm text-gray-600">Internships</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-primary-600">{company.applications_count}</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="text-gray-500 w-5 h-5 mt-0.5 mr-3" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div>{company.email}</div>
              </div>
            </div>
            
            {company.location && (
              <div className="flex items-start">
                <MapPin className="text-gray-500 w-5 h-5 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div>{company.location}</div>
                </div>
              </div>
            )}
            
            {company.company_size && (
              <div className="flex items-start">
                <Users className="text-gray-500 w-5 h-5 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Company Size</div>
                  <div>{company.company_size}</div>
                </div>
              </div>
            )}
            
            {company.website && (
              <div className="flex items-start">
                <Globe className="text-gray-500 w-5 h-5 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Website</div>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline flex items-center"
                  >
                    {company.website}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {company.bio && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-line">{company.bio}</p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-md font-medium mb-2">Admin Actions</h3>
            <div className="space-y-2">
              <Link to={`/admin/companies/internships/${id}`}>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Briefcase size={16} />}
                >
                  Manage Internships
                </Button>
              </Link>
              <Link to={`/admin/companies/applications/${id}`}>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<ClipboardList size={16} />}
                >
                  View Applications
                </Button>
              </Link>
            </div>
          </div>
        </Card>
        
        <div className="lg:col-span-2 space-y-6">
          {/* Internships */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Internships</h2>
              <Link to={`/admin/companies/internships/${id}`}>
                <Button size="sm" variant="outline">View All</Button>
              </Link>
            </div>
            
            {internships.length > 0 ? (
              <div className="space-y-4">
                {internships.slice(0, 3).map((internship) => (
                  <div key={internship.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/admin/internships/${internship.id}`}>
                          <h3 className="font-medium text-primary-600 hover:underline">{internship.title}</h3>
                        </Link>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin size={14} className="mr-1" />
                          {internship.location}
                          {internship.is_remote && ' (Remote)'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(internship.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(internship.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {internship.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index}
                            className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {internship.skills.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                            +{internship.skills.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-sm flex items-center bg-primary-50 text-primary-700 px-2 py-1 rounded">
                        <ClipboardList size={14} className="mr-1" />
                        {Array.isArray(internship.applications_count) && internship.applications_count[0]?.count || 0} applications
                      </div>
                    </div>
                  </div>
                ))}
                
                {internships.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to={`/admin/companies/internships/${id}`}>
                      <Button variant="ghost" size="sm">
                        View All {internships.length} Internships
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                <Briefcase size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No internships posted yet</p>
              </div>
            )}
          </Card>
          
          {/* Recent Applications */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link to={`/admin/companies/applications/${id}`}>
                <Button size="sm" variant="outline">View All</Button>
              </Link>
            </div>
            
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/admin/students/${application.student_id}`}>
                          <h3 className="font-medium text-primary-600 hover:underline">
                            {application.student?.full_name || 'Unknown Student'}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">
                          Applied for:{' '}
                          <Link 
                            to={`/admin/internships/${application.internship_id}`}
                            className="text-primary-600 hover:underline"
                          >
                            {application.internship?.title || 'Unknown Internship'}
                          </Link>
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {getApplicationStatusBadge(application.status)}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(application.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      {application.resume_url && (
                        <Link to={application.resume_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" icon={<FileText size={14} />}>
                            View Resume
                          </Button>
                        </Link>
                      )}
                      <Link to={`/admin/applications/${application.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {recentApplications.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to={`/admin/companies/applications/${id}`}>
                      <Button variant="ghost" size="sm">
                        View All Applications
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                <ClipboardList size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No applications received yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile; 