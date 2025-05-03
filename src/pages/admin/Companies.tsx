import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CompanyProfile } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';

// Extend CompanyProfile for companies with internships count
interface CompanyWithInternships extends CompanyProfile {
  internships?: { count: number }[];
}

const AdminCompanies: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyWithInternships[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      // Fetch companies with counts of their internships
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          internships:internships(count)
        `)
        .eq('role', 'company');

      if (error) throw error;
      
      setCompanies(data as CompanyWithInternships[]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id: string) => {
    // Navigate to company profile view
    navigate(`/admin/companies/${id}`);
  };

  const handleEdit = (id: string) => {
    // Navigate to company edit form
    navigate(`/admin/companies/edit/${id}`);
    // Since this page doesn't exist yet, we'll show a toast
    toast('Company edit form is not yet implemented');
  };

  const handleDelete = async (id: string) => {
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
        
        // Update local state
        setCompanies(companies.filter(company => company.id !== id));
        toast.success('Company deleted successfully');
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Failed to delete company');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddCompany = () => {
    // Navigate to add company form
    navigate('/admin/companies/add');
    // Since this page doesn't exist yet, we'll show a toast
    toast('Add company form is not yet implemented');
  };

  const filteredCompanies = companies.filter(company => 
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Companies</h1>
        <Button
          onClick={handleAddCompany}
          icon={<Building2 size={18} />}
        >
          Add Company
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Company List</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search companies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-gray-500">Loading companies...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Company Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Internships</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {company.company_name || 'Unnamed Company'}
                      </td>
                      <td className="py-3 px-4">{company.email}</td>
                      <td className="py-3 px-4">{company.location || 'Not specified'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="primary">
                          {company.internships && company.internships[0]?.count || 0} Listings
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                            onClick={() => handleView(company.id)}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="text-amber-600 hover:text-amber-800"
                            title="Edit Company"
                            onClick={() => handleEdit(company.id)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            title="Delete Company"
                            onClick={() => handleDelete(company.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-200">
                    <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                      {searchTerm ? 'No companies found matching your search' : 'No companies found'}
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

export default AdminCompanies; 