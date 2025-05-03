import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  ClipboardCheck, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle,
  PlusCircle,
  TrendingUp,
  FileText,
  Building2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Internship, Application, CompanyProfile } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const CompanyDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    draftInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [activeInternships, setActiveInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Current user:", user);
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch internship stats
      const { data: internshipsData, error: internshipsError } = await supabase
        .from('internships')
        .select('id, status')
        .eq('company_id', user.id);

      if (internshipsError) throw internshipsError;

      // Fetch all internship IDs for this company
      const internshipIds = internshipsData.map(i => i.id);

      // Fetch application stats if there are internships
      let applicationsData: any[] = [];
      if (internshipIds.length > 0) {
        const { data: applicationsResult, error: applicationsError } = await supabase
          .from('applications')
          .select('id, status, internship_id')
          .in('internship_id', internshipIds);

        if (applicationsError) throw applicationsError;
        applicationsData = applicationsResult || [];
      }

      // Active internships
      const { data: activeInternshipsData, error: activeInternshipsError } = await supabase
        .from('internships')
        .select('*')
        .eq('company_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(3);

      if (activeInternshipsError) throw activeInternshipsError;
      setActiveInternships(activeInternshipsData as Internship[]);

      // Recent applications
      if (internshipIds.length > 0) {
        const { data: recentApplicationsData, error: recentApplicationsError } = await supabase
          .from('applications')
          .select(`
            *,
            student:profiles!applications_student_id_fkey(*),
            internship:internships(*)
          `)
          .in('internship_id', internshipIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentApplicationsError) throw recentApplicationsError;
        setRecentApplications(recentApplicationsData as Application[]);
      }

      // Calculate stats
      const totalInternships = internshipsData.length;
      const activeInternships = internshipsData.filter(i => i.status === 'open').length;
      const draftInternships = internshipsData.filter(i => i.status === 'draft').length;
      
      const totalApplications = applicationsData.length;
      const pendingApplications = applicationsData.filter(a => a.status === 'pending').length;
      const acceptedApplications = applicationsData.filter(a => a.status === 'accepted').length;
      const rejectedApplications = applicationsData.filter(a => a.status === 'rejected').length;

      setStats({
        totalInternships,
        activeInternships,
        draftInternships,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse-slow flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {(user as CompanyProfile)?.company_name || 'Company'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Internships</h3>
            <div className="p-2 bg-primary-100 rounded-full">
              <Briefcase className="text-primary-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.activeInternships}</p>
          <div className="flex items-center mt-2 text-sm text-primary-600">
            <Link to="/manage-internships" className="flex items-center">
              <TrendingUp size={16} className="mr-1" />
              <span>View all</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
            <div className="p-2 bg-secondary-100 rounded-full">
              <ClipboardCheck className="text-secondary-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
          <div className="flex items-center mt-2 text-sm text-secondary-600">
            <Link to="/applications" className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>Review candidates</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
            <div className="p-2 bg-warning-100 rounded-full">
              <Clock className="text-warning-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
          <div className="flex items-center mt-2 text-sm text-warning-600">
            <Link to="/applications?filter=pending" className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>Review applications</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Draft Internships</h3>
            <div className="p-2 bg-gray-100 rounded-full">
              <FileText className="text-gray-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.draftInternships}</p>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <Link to="/manage-internships?filter=draft" className="flex items-center">
              <PlusCircle size={16} className="mr-1" />
              <span>Complete listings</span>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/applications" className="text-primary-600 text-sm font-medium">
              View all
            </Link>
          </div>

          {recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User size={18} className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.student?.full_name || 'Applicant'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Applied for{' '}
                          <Link
                            to={`/internships/${application.internship_id}`}
                            className="text-primary-600 hover:underline"
                          >
                            {application.internship?.title || 'Internship'}
                          </Link>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(application.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Users size={48} className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You'll see applications here once students apply to your internships.
              </p>
            </div>
          )}
        </motion.div>

        {/* Active Internships */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Active Internships</h2>
            <div className="flex space-x-2">
              <Link to="/manage-internships" className="text-primary-600 text-sm font-medium">
                Manage all
              </Link>
              <Link to="/internships/create">
                <Button size="sm" variant="primary">
                  Post New
                </Button>
              </Link>
            </div>
          </div>

          {activeInternships.length > 0 ? (
            <div className="space-y-4">
              {activeInternships.map((internship) => (
                <Card
                  key={internship.id}
                  hoverable
                  className="border border-gray-100 hover:border-primary-100"
                >
                  <Link to={`/internships/edit/${internship.id}`}>
                    <div className="p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{internship.title}</h3>
                        <Badge variant="primary">{internship.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {internship.location}
                        {internship.is_remote ? ' (Remote)' : ''}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex space-x-1">
                          {internship.skills.slice(0, 2).map((skill, index) => (
                            <span key={index} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                              {skill}
                            </span>
                          ))}
                          {internship.skills.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                              +{internship.skills.length - 2}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          Posted on {new Date(internship.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Briefcase size={48} className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active internships</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start posting internship opportunities to attract talent.
              </p>
              <div className="mt-6">
                <Link to="/internships/create">
                  <Button>Post an Internship</Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/internships/create">
            <Card className="p-4 text-center hover:bg-primary-50 transition-colors h-full">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-3">
                  <PlusCircle size={24} />
                </div>
                <h3 className="font-medium text-gray-900">Post New Internship</h3>
                <p className="text-sm text-gray-500 mt-1">Create a new internship listing</p>
              </div>
            </Card>
          </Link>
          
          <Link to="/applications?filter=pending">
            <Card className="p-4 text-center hover:bg-secondary-50 transition-colors h-full">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600 mb-3">
                  <ClipboardCheck size={24} />
                </div>
                <h3 className="font-medium text-gray-900">Review Applications</h3>
                <p className="text-sm text-gray-500 mt-1">Review pending applications</p>
              </div>
            </Card>
          </Link>
          
          <Link to="/profile">
            <Card className="p-4 text-center hover:bg-accent-50 transition-colors h-full">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-3">
                  <Building2 size={24} />
                </div>
                <h3 className="font-medium text-gray-900">Company Profile</h3>
                <p className="text-sm text-gray-500 mt-1">Update your company information</p>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CompanyDashboard;