import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Users, Building2, Briefcase, FileText, Clock, BarChart3, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  totalInternships: number;
  activeInternships: number;
  totalStudents: number;
  totalCompanies: number;
}

const initialStats: DashboardStats = {
  totalApplications: 0,
  pendingApplications: 0,
  totalInternships: 0,
  activeInternships: 0,
  totalStudents: 0,
  totalCompanies: 0
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Get total applications and pending applications
      const { data: applicationStats, error: applicationError } = await supabase
        .from('applications')
        .select('status', { count: 'exact' });

      if (applicationError) throw applicationError;

      const pendingApplicationCount = applicationStats?.filter(app => app.status === 'pending').length;

      // Get total and active internships
      const { data: internshipStats, error: internshipError } = await supabase
        .from('internships')
        .select('status', { count: 'exact' });

      if (internshipError) throw internshipError;

      const activeInternshipCount = internshipStats?.filter(int => int.status === 'open').length;

      // Get total students and companies
      const { data: studentCount, error: studentError } = await supabase
        .from('profiles')
        .select('role', { count: 'exact' })
        .eq('role', 'student');

      if (studentError) throw studentError;

      const { data: companyCount, error: companyError } = await supabase
        .from('profiles')
        .select('role', { count: 'exact' })
        .eq('role', 'company');

      if (companyError) throw companyError;

      setStats({
        totalApplications: applicationStats?.length || 0,
        pendingApplications: pendingApplicationCount || 0,
        totalInternships: internshipStats?.length || 0,
        activeInternships: activeInternshipCount || 0,
        totalStudents: studentCount?.length || 0,
        totalCompanies: companyCount?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const CardLink = ({ title, description, icon, link }: { title: string, description: string, icon: React.ReactNode, link: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-primary-50 rounded-full mr-4">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link to={link} className="text-primary-600 hover:underline flex items-center">
        View {title} <span className="ml-1">→</span>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardLink 
          title="Students" 
          description="Manage all student accounts and applications" 
          icon={<Users className="text-primary-500" size={24} />} 
          link="/admin/students" 
        />
        
        <CardLink 
          title="Companies" 
          description="Review and manage company accounts" 
          icon={<Building2 className="text-primary-500" size={24} />} 
          link="/admin/companies" 
        />
        
        <CardLink 
          title="Internships" 
          description="Monitor all internship listings and applications" 
          icon={<Briefcase className="text-primary-500" size={24} />} 
          link="/admin/internships" 
        />

        <CardLink 
          title="Applications" 
          description="View and manage student applications to internships" 
          icon={<FileText className="text-primary-500" size={24} />} 
          link="/admin/applications" 
        />
        
        <CardLink 
          title="Analytics" 
          description="View application metrics and performance dashboards" 
          icon={<BarChart3 className="text-primary-500" size={24} />} 
          link="/admin/analytics" 
        />
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <LayoutDashboard className="text-primary-500 mr-2" size={20} />
          <h2 className="text-xl font-semibold">Activity Summary</h2>
        </div>
        
        {isLoading ? (
          <div className="py-4 flex justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="flex justify-between border-b pb-2">
              <span className="flex items-center">
                <Users className="text-gray-400 mr-2" size={18} />
                Total Students:
              </span>
              <span className="font-medium text-primary-600">{stats.totalStudents}</span>
            </p>
            <p className="flex justify-between border-b pb-2">
              <span className="flex items-center">
                <Building2 className="text-gray-400 mr-2" size={18} />
                Total Companies:
              </span>
              <span className="font-medium text-primary-600">{stats.totalCompanies}</span>
            </p>
            <p className="flex justify-between border-b pb-2">
              <span className="flex items-center">
                <Briefcase className="text-gray-400 mr-2" size={18} />
                Total Internships:
              </span>
              <span className="font-medium text-primary-600">{stats.totalInternships}</span>
            </p>
            <p className="flex justify-between border-b pb-2">
              <span className="flex items-center">
                <FileText className="text-gray-400 mr-2" size={18} />
                Active Applications:
              </span>
              <span className="font-medium text-primary-600">{stats.activeInternships}</span>
            </p>
            <p className="flex justify-between">
              <span className="flex items-center">
                <BarChart3 className="text-gray-400 mr-2" size={18} />
                <Link to="/admin/analytics" className="text-primary-600 hover:underline">
                  View Application Analytics
                </Link>
              </span>
              <span className="font-medium text-primary-600">→</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 