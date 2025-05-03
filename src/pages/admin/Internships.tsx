import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, Edit, Trash2, Search, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Internship } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

const AdminInternships: React.FC = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState<(Internship & { application_count?: number, company_name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          company:profiles(company_name),
          applications:applications(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the data to make it easier to work with
      const processedData = data.map(item => ({
        ...item,
        company_name: item.company?.company_name,
        application_count: item.applications?.[0]?.count || 0
      }));
      
      setInternships(processedData);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: string) => {
    // Navigate to the internship detail page
    navigate(`/internships/${id}`);
  };

  const handleEdit = (id: string) => {
    // Navigate to the edit internship page
    navigate(`/internships/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('internships')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Update local state
        setInternships(internships.filter(internship => internship.id !== id));
        toast.success('Internship deleted successfully');
      } catch (error) {
        console.error('Error deleting internship:', error);
        toast.error('Failed to delete internship');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddInternship = () => {
    navigate('/internships/create');
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

  const filteredInternships = internships.filter(internship => 
    internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    internship.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Internships</h1>
        <Button
          onClick={handleAddInternship}
          icon={<Briefcase size={18} />}
        >
          Add Internship
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Internship List</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search internships..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-gray-500">Loading internships...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Applications</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInternships.length > 0 ? (
                  filteredInternships.map((internship) => (
                    <tr key={internship.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {internship.title}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Building2 size={16} className="text-gray-400 mr-2" />
                          {internship.company_name || 'Unknown Company'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(internship.status)}
                      </td>
                      <td className="py-3 px-4">
                        {internship.location}
                        {internship.is_remote && ' (Remote)'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="primary">
                          {internship.application_count} Applications
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                            onClick={() => handleView(internship.id)}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="text-amber-600 hover:text-amber-800"
                            title="Edit Internship"
                            onClick={() => handleEdit(internship.id)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            title="Delete Internship"
                            onClick={() => handleDelete(internship.id)}
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
                      {searchTerm ? 'No internships found matching your search' : 'No internships found'}
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

export default AdminInternships; 