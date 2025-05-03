import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast, Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Interview {
  id: string;
  application_id: string;
  student_id: string;
  company_id: string;
  title: string;
  start_time: string;
  end_time: string;
  meeting_type: 'video' | 'phone' | 'in-person';
  meeting_link: string | null;
  description: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  student: {
    full_name: string;
    email: string;
    university: string;
  };
  company: {
    company_name: string;
  };
  application: {
    internship: {
      title: string;
    };
  };
}

const AdminInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('start_time');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      // First try a simple query to check if table exists
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          student:profiles(id, full_name, email, university),
          company:profiles(company_name),
          application:applications(
            internship:internships(title)
          )
        `)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error details:', error);
        
        // If table doesn't exist yet, show a more helpful message
        if (error.code === '42P01') { // PostgreSQL code for undefined_table
          toast.error('Interviews table not found. Please run the migrations first.');
          setInterviews([]);
          return;
        }
        
        throw error;
      }
      setInterviews(data as Interview[]);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to load interviews');
      setInterviews([]); // Set empty array to avoid undefined errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setInterviews(interviews.map(interview => 
        interview.id === id ? { ...interview, status } : interview
      ));
      
      toast.success(`Interview status updated to ${status}`);
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error('Failed to update interview status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="warning">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} minutes`;
  };

  const getMeetingTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video Call';
      case 'phone':
        return 'Phone Call';
      case 'in-person':
        return 'In-Person';
      default:
        return type;
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
    setStartDate(null);
    setEndDate(null);
  };

  const filteredInterviews = interviews
    .filter(interview => {
      // Search term filter
      const matchesSearch = 
        interview.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.company?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
      
      // Date range filter
      const interviewDate = new Date(interview.start_time);
      const matchesDateRange = 
        (!startDate || interviewDate >= startDate) && 
        (!endDate || interviewDate <= endDate);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      let valueA: any, valueB: any;
      
      // Determine sort values based on the selected field
      switch (sortField) {
        case 'student':
          valueA = a.student?.full_name?.toLowerCase() || '';
          valueB = b.student?.full_name?.toLowerCase() || '';
          break;
        case 'company':
          valueA = a.company?.company_name?.toLowerCase() || '';
          valueB = b.company?.company_name?.toLowerCase() || '';
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'start_time':
          valueA = new Date(a.start_time).getTime();
          valueB = new Date(b.start_time).getTime();
          break;
        default:
          valueA = a[sortField as keyof Interview] || '';
          valueB = b[sortField as keyof Interview] || '';
      }
      
      // Sorting direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Interviews</h1>
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
          <h2 className="text-xl font-semibold">Interviews List</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search interviews..."
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
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholderText="Select start date"
                  dateFormat="MMM d, yyyy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholderText="Select end date"
                  dateFormat="MMM d, yyyy"
                />
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
            <p className="mt-2 text-gray-500">Loading interviews...</p>
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
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center">
                      Interview Title
                      {sortField === 'title' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'title' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left cursor-pointer" onClick={() => handleSort('start_time')}>
                    <div className="flex items-center">
                      Date & Time
                      {sortField === 'start_time' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </span>
                      )}
                      {sortField !== 'start_time' && <ArrowUpDown size={16} className="ml-1 text-gray-400" />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">Type</th>
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
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.length > 0 ? (
                  filteredInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-gray-400" />
                          <span>{interview.student?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Building2 size={16} className="text-gray-400" />
                          <span>{interview.company?.company_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{interview.title}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            {new Date(interview.start_time).toLocaleString()}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock size={16} className="text-gray-400 mr-2" />
                            {new Date(interview.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(interview.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Video size={16} className="text-gray-400" />
                          <span>{getMeetingTypeLabel(interview.meeting_type)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(interview.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {interview.meeting_link && (
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="Join Meeting"
                              onClick={() => window.open(interview.meeting_link || '', '_blank')}
                            >
                              <ExternalLink size={18} />
                            </button>
                          )}
                          
                          {interview.status === 'scheduled' && (
                            <>
                              <button
                                className="text-green-600 hover:text-green-800"
                                title="Mark as Completed"
                                onClick={() => handleUpdateStatus(interview.id, 'completed')}
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                title="Cancel Interview"
                                onClick={() => handleUpdateStatus(interview.id, 'cancelled')}
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-200">
                    <td colSpan={7} className="py-6 px-4 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all' || startDate || endDate ? 
                        'No interviews found matching your filters' : 
                        'No interviews scheduled yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredInterviews.length} of {interviews.length} interviews
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterviews; 