import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle, XCircle, BarChart2, TrendingUp, BookmarkPlus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Application, Internship } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recentInternships, setRecentInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setIsRefreshing(true);
    try {
      // Fetch recent applications
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          internship:internships(*)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (applicationsError) throw applicationsError;

      // Fetch recent internships
      const { data: internships, error: internshipsError } = await supabase
        .from('internships')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      if (internshipsError) throw internshipsError;

      // Fetch stats - using a simpler approach without group by
      const { data: allApplications, error: statsError } = await supabase
        .from('applications')
        .select('status')
        .eq('student_id', user.id);

      if (statsError) throw statsError;

      // Manually count statuses
      const statusCounts: Record<string, number> = {
        pending: 0,
        reviewing: 0,
        accepted: 0,
        rejected: 0
      };
      
      allApplications?.forEach(app => {
        if (app.status && statusCounts[app.status] !== undefined) {
          statusCounts[app.status]++;
        }
      });

      // Update state with fetched data
      setRecentApplications(applications as Application[]);
      setRecentInternships(internships as Internship[]);
      setStats({
        totalApplications: allApplications?.length || 0,
        pendingApplications: statusCounts['pending'] || 0,
        acceptedApplications: statusCounts['accepted'] || 0,
        rejectedApplications: statusCounts['rejected'] || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Initial data fetch and setup real-time subscriptions
  useEffect(() => {
    if (!user) return;
    
    // Fetch initial data
    fetchDashboardData();
    
    // Setup real-time subscription for applications
    const subscription = supabase
      .channel('public:applications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'applications',
          filter: `student_id=eq.${user.id}`
        }, 
        () => {
          // Refresh data when changes occur to applications
          fetchDashboardData();
        }
      )
      .subscribe();
    
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const statusIcons = {
    pending: <Clock className="text-warning-500" size={18} />,
    reviewing: <BarChart2 className="text-primary-500" size={18} />,
    accepted: <CheckCircle className="text-success-500" size={18} />,
    rejected: <XCircle className="text-error-500" size={18} />,
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name || 'Student'}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          isLoading={isRefreshing}
          icon={<RefreshCw size={16} />}
        >
          Refresh
        </Button>
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
            <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
            <div className="p-2 bg-primary-100 rounded-full">
              <Briefcase className="text-primary-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
          <div className="flex items-center mt-2 text-sm text-primary-600">
            <TrendingUp size={16} className="mr-1" />
            <span>Career Progress</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <div className="p-2 bg-warning-100 rounded-full">
              <Clock className="text-warning-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
          <div className="flex items-center mt-2 text-sm text-warning-600">
            <Clock size={16} className="mr-1" />
            <span>Awaiting Response</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Accepted</h3>
            <div className="p-2 bg-success-100 rounded-full">
              <CheckCircle className="text-success-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.acceptedApplications}</p>
          <div className="flex items-center mt-2 text-sm text-success-600">
            <CheckCircle size={16} className="mr-1" />
            <span>Opportunities</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Rejected</h3>
            <div className="p-2 bg-error-100 rounded-full">
              <XCircle className="text-error-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rejectedApplications}</p>
          <div className="flex items-center mt-2 text-sm text-error-600">
            <XCircle size={16} className="mr-1" />
            <span>Learning Experiences</span>
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
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {application.internship?.title || 'Internship'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No applications yet</h3>
              <p className="text-gray-500 text-sm mb-4">Start applying to internships to see your applications here</p>
              <Link to="/internships">
                <Button size="sm" variant="primary">
                  Browse Internships
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Internships */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Latest Internships</h2>
            <Link to="/internships" className="text-primary-600 text-sm font-medium">
              View all
            </Link>
          </div>

          {recentInternships.length > 0 ? (
            <div className="space-y-4">
              {recentInternships.map((internship) => (
                <motion.div
                  key={internship.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{internship.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted on {new Date(internship.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/internships/${internship.id}`}>
                      <Button size="sm" variant="outline" icon={<BookmarkPlus size={16} />}>
                        Apply
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-gray-400" />
              </div>
              <h3 className="text-gray-700 font-medium mb-1">No internships available</h3>
              <p className="text-gray-500 text-sm">Check back later for new opportunities</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;