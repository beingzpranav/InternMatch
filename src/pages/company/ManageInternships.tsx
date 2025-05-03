import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Internship } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const ManageInternships = () => {
  const { user } = useAuthStore();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchInternships();
    }
  }, [user]);

  const fetchInternships = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInternships(data as Internship[]);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInternship = async (id: string) => {
    try {
      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInternships(internships.filter(internship => internship.id !== id));
      toast.success('Internship deleted successfully');
    } catch (error) {
      console.error('Error deleting internship:', error);
      toast.error('Failed to delete internship');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const toggleStatus = async (internship: Internship) => {
    const newStatus = internship.status === 'open' ? 'closed' : 'open';
    
    try {
      const { error } = await supabase
        .from('internships')
        .update({ status: newStatus })
        .eq('id', internship.id);

      if (error) throw error;
      
      setInternships(internships.map(i => 
        i.id === internship.id ? { ...i, status: newStatus } : i
      ));
      
      toast.success(`Internship ${newStatus === 'open' ? 'opened' : 'closed'}`);
    } catch (error) {
      console.error('Error updating internship status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = 
      searchTerm === '' || 
      internship.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      internship.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Internships</h1>
          <p className="text-gray-600 mt-1">Create and manage your internship listings</p>
        </div>
        <Link to="/internships/create">
          <Button icon={<PlusCircle size={18} />}>
            Post New Internship
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search internships..."
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
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse-slow flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
            <div className="text-gray-600">Loading internships...</div>
          </div>
        </div>
      ) : filteredInternships.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredInternships.map((internship) => (
            <motion.div key={internship.id} variants={item}>
              <Card className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900">{internship.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {internship.location}
                      {internship.is_remote ? ' (Remote)' : ''}
                    </p>
                  </div>
                  <div className="flex items-center mt-4 md:mt-0 space-x-2">
                    <Badge
                      variant={
                        internship.status === 'open'
                          ? 'success'
                          : internship.status === 'closed'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(internship)}
                    >
                      {internship.status === 'open' ? 'Close' : 'Open'}
                    </Button>
                    <Link to={`/internships/${internship.id}`}>
                      <Button size="sm" variant="outline" icon={<Eye size={16} />}>
                        View
                      </Button>
                    </Link>
                    <Link to={`/internships/edit/${internship.id}`}>
                      <Button size="sm" variant="outline" icon={<Edit2 size={16} />}>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error-600 hover:bg-error-50"
                      icon={<Trash2 size={16} />}
                      onClick={() => setShowDeleteConfirm(internship.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="primary">{internship.type}</Badge>
                  <Badge variant="secondary">{internship.duration}</Badge>
                  {internship.stipend && <Badge variant="success">Paid</Badge>}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {internship.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {showDeleteConfirm === internship.id && (
                  <div className="mt-4 p-4 bg-error-50 border border-error-100 rounded-lg">
                    <p className="text-error-700 mb-4">
                      Are you sure you want to delete this internship? This action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteInternship(internship.id)}
                      >
                        Delete
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
            <PlusCircle size={48} className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No internships found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first internship listing.
          </p>
          <div className="mt-6">
            <Link to="/internships/create">
              <Button>Create Internship</Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageInternships;