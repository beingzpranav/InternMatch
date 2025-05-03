import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Download, ArrowDown, ArrowUp, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  reviewingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  byDate: { [key: string]: number };
  byCompany: { [key: string]: number };
  byInternship: { [key: string]: number };
}

const ApplicationAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplications: 0,
    pendingApplications: 0,
    reviewingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    byDate: {},
    byCompany: {},
    byInternship: {},
  });

  useEffect(() => {
    fetchApplicationStats();
  }, []);

  const fetchApplicationStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Basic check if applications table exists
      const { error: tableCheckError } = await supabase
        .from('applications')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        throw new Error('Applications table not accessible. Please check database setup.');
      }

      // Fetch applications with status counts
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('*');

      if (appsError) throw appsError;

      if (!applications) {
        throw new Error('No application data found');
      }

      // Process applications by status
      const statsData: ApplicationStats = {
        totalApplications: applications.length,
        pendingApplications: 0,
        reviewingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        byDate: {},
        byCompany: {},
        byInternship: {},
      };

      // Count by status
      applications.forEach(app => {
        if (app.status === 'pending') statsData.pendingApplications++;
        else if (app.status === 'reviewing') statsData.reviewingApplications++;
        else if (app.status === 'accepted') statsData.acceptedApplications++;
        else if (app.status === 'rejected') statsData.rejectedApplications++;

        // Group by date
        const date = new Date(app.created_at).toLocaleDateString();
        statsData.byDate[date] = (statsData.byDate[date] || 0) + 1;
      });

      // Fetch internships data to group applications by internship and company
      if (applications.length > 0) {
        // Get unique internship IDs
        const internshipIds = [...new Set(applications.map(app => app.internship_id))];
        
        if (internshipIds.length > 0) {
          const { data: internships, error: internshipsError } = await supabase
            .from('internships')
            .select('id, title, company_id')
            .in('id', internshipIds);

          if (!internshipsError && internships) {
            // Create a mapping of internship IDs to titles
            const internshipMap = Object.fromEntries(
              internships.map(internship => [internship.id, internship.title || 'Untitled Internship'])
            );
            
            // Group applications by internship
            applications.forEach(app => {
              const internshipTitle = internshipMap[app.internship_id] || 'Unknown Internship';
              statsData.byInternship[internshipTitle] = (statsData.byInternship[internshipTitle] || 0) + 1;
            });
            
            // If we have company IDs, fetch company names
            const companyIds = [...new Set(internships.map(internship => internship.company_id))];
            
            if (companyIds.length > 0) {
              const { data: companies, error: companiesError } = await supabase
                .from('profiles')
                .select('id, company_name')
                .in('id', companyIds);
                
              if (!companiesError && companies) {
                // Create mapping of company IDs to names
                const companyMap = Object.fromEntries(
                  companies.map(company => [company.id, company.company_name || 'Unnamed Company'])
                );
                
                // Match internships to companies and count applications
                internships.forEach(internship => {
                  const companyName = companyMap[internship.company_id] || 'Unknown Company';
                  const applicationsForInternship = applications.filter(
                    app => app.internship_id === internship.id
                  ).length;
                  
                  statsData.byCompany[companyName] = 
                    (statsData.byCompany[companyName] || 0) + applicationsForInternship;
                });
              }
            }
          }
        }
      }

      setStats(statsData);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'An error occurred while fetching application data');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for status chart
  const statusData = {
    labels: ['Pending', 'Reviewing', 'Accepted', 'Rejected'],
    datasets: [
      {
        label: 'Applications by Status',
        data: [
          stats.pendingApplications,
          stats.reviewingApplications,
          stats.acceptedApplications,
          stats.rejectedApplications,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // yellow
          'rgba(54, 162, 235, 0.6)', // blue
          'rgba(75, 192, 192, 0.6)', // green
          'rgba(255, 99, 132, 0.6)', // red
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for company chart (top 5)
  const companyEntries = Object.entries(stats.byCompany).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const companyData = {
    labels: companyEntries.map(([company]) => company),
    datasets: [
      {
        label: 'Applications by Company',
        data: companyEntries.map(([_, count]) => count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for internship chart (top 5)
  const internshipEntries = Object.entries(stats.byInternship).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const internshipData = {
    labels: internshipEntries.map(([internship]) => internship),
    datasets: [
      {
        label: 'Applications by Internship',
        data: internshipEntries.map(([_, count]) => count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for trend chart
  const dates = Object.keys(stats.byDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const trendData = {
    labels: dates,
    datasets: [
      {
        label: 'Applications over Time',
        data: dates.map(date => stats.byDate[date]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const StatCard = ({ title, value, trend = 0 }: { title: string; value: number; trend?: number }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {trend !== 0 && (
          <span className={`flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  // Error display component
  const ErrorMessage = () => (
    <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <AlertTriangle size={48} className="text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-red-700 mb-2">Analytics Not Available</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <p className="text-gray-600 mb-4">
        There was a problem loading the analytics data. This could be due to database configuration issues.
      </p>
      <Button
        variant="primary"
        size="sm"
        icon={<RefreshCw size={16} />}
        onClick={fetchApplicationStats}
      >
        Try Again
      </Button>
    </div>
  );

  // Add the export data functionality
  const exportToCSV = () => {
    // Only export if we have data
    if (stats.totalApplications === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Create CSV content
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Headers
      csvContent += 'Category,Metric,Value\n';
      
      // Application Status Data
      csvContent += 'Status,Pending,' + stats.pendingApplications + '\n';
      csvContent += 'Status,Reviewing,' + stats.reviewingApplications + '\n';
      csvContent += 'Status,Accepted,' + stats.acceptedApplications + '\n';
      csvContent += 'Status,Rejected,' + stats.rejectedApplications + '\n';
      csvContent += 'Status,Total,' + stats.totalApplications + '\n\n';
      
      // Company Data
      Object.entries(stats.byCompany).forEach(([company, count]) => {
        csvContent += 'Company,' + company.replace(/,/g, ' ') + ',' + count + '\n';
      });
      csvContent += '\n';
      
      // Internship Data
      Object.entries(stats.byInternship).forEach(([internship, count]) => {
        csvContent += 'Internship,' + internship.replace(/,/g, ' ') + ',' + count + '\n';
      });
      csvContent += '\n';
      
      // Date Trend Data
      Object.entries(stats.byDate).forEach(([date, count]) => {
        csvContent += 'Date,' + date + ',' + count + '\n';
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `application_analytics_${new Date().toISOString().replace('T', '_').split('.')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. See console for details.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Application Analytics</h1>
          <p className="text-gray-600">Insights and trends from application data</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
            onClick={exportToCSV}
          >
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={fetchApplicationStats}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <ErrorMessage />
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Applications" value={stats.totalApplications} />
            <StatCard title="Pending" value={stats.pendingApplications} />
            <StatCard title="In Review" value={stats.reviewingApplications} />
            <StatCard title="Accepted" value={stats.acceptedApplications} />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Application Status</h2>
              <div className="h-80">
                <Pie data={statusData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Top Companies</h2>
              <div className="h-80">
                <Bar data={companyData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Top Internship Positions</h2>
              <div className="h-80">
                <Bar data={internshipData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Application Trends</h2>
              <div className="h-80">
                <Line data={trendData} options={chartOptions} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApplicationAnalytics; 