import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Search, MapPin, Briefcase, Clock, Filter, X, BookmarkPlus, Bookmark, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Internship } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import MessageButton from '../../components/shared/MessageButton';

const InternshipsList = () => {
  const { user } = useAuthStore();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    isRemote: false,
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInternships();
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchInternships = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('internships')
        .select(`
          *,
          company:profiles!internships_company_id_fkey(*)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure data is valid and all internships have the required fields
      const validInternships = (data || []).map(internship => {
        // Ensure skills is an array
        if (!Array.isArray(internship.skills)) {
          internship.skills = [];
        }
        
        // Make sure company is properly defined
        if (!internship.company) {
          internship.company = { company_name: 'Unknown Company' };
        }
        
        return internship;
      });
      
      setInternships(validInternships as Internship[]);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
      setError('Failed to load internships. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('internship_id')
        .eq('student_id', user.id);

      if (error) throw error;
      
      const bookmarkMap = (data || []).reduce((acc, bookmark) => {
        acc[bookmark.internship_id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setBookmarks(bookmarkMap);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (internshipId: string) => {
    if (!user) {
      toast.error('Please sign in to bookmark internships');
      return;
    }

    try {
      if (bookmarks[internshipId]) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('student_id', user.id)
          .eq('internship_id', internshipId);

        if (error) throw error;
        
        setBookmarks(prev => {
          const newBookmarks = { ...prev };
          delete newBookmarks[internshipId];
          return newBookmarks;
        });
        
        toast.success('Bookmark removed');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            student_id: user.id,
            internship_id: internshipId,
          });

        if (error) throw error;
        
        setBookmarks(prev => ({
          ...prev,
          [internshipId]: true,
        }));
        
        toast.success('Internship bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const filteredInternships = internships.filter(internship => {
    try {
    const matchesSearch = 
      searchTerm === '' || 
        internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (internship.skills && Array.isArray(internship.skills) && 
          internship.skills.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesType = filters.type === '' || internship.type === filters.type;
    const matchesRemote = !filters.isRemote || internship.is_remote;
    const matchesLocation = 
      filters.location === '' || 
        (internship.location && internship.location.toLowerCase().includes(filters.location.toLowerCase()));
    
    return matchesSearch && matchesType && matchesRemote && matchesLocation;
    } catch (e) {
      console.error('Error filtering internship:', e, internship);
      return false;
    }
  });

  const resetFilters = () => {
    setFilters({
      type: '',
      isRemote: false,
      location: '',
    });
    setSearchTerm('');
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Internships</h1>
        <p className="text-gray-600 mt-1">Find and apply for internships that match your skills and interests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search by title, description or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              icon={<Filter size={18} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            {(searchTerm || filters.type || filters.isRemote || filters.location) && (
              <Button 
                variant="outline" 
                icon={<X size={18} />}
                onClick={resetFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internship Type
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  placeholder="Filter by location"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  icon={<MapPin size={18} />}
                />
              </div>
              <div className="flex items-center pt-6">
                <input
                  id="remote-only"
                  name="remote-only"
                  type="checkbox"
                  checked={filters.isRemote}
                  onChange={(e) => setFilters({...filters, isRemote: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remote-only" className="ml-2 block text-sm text-gray-700">
                  Remote only
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-lg">
          {error}
          <Button 
            variant="outline"
            className="mt-2"
            onClick={fetchInternships}
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-primary-200 h-12 w-12 mb-4"></div>
            <div className="text-gray-600">Loading internships...</div>
          </div>
        </div>
      ) : filteredInternships.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6"
        >
          {filteredInternships.map((internship) => (
            <motion.div key={internship.id} variants={item}>
              <Card>
                <div className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{internship.title || 'Untitled Internship'}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {((internship.company as any)?.company_name) || 'Unknown Company'}
                      </p>
                    </div>
                    {user?.role === 'student' && (
                    <button 
                      onClick={() => toggleBookmark(internship.id)}
                        className="text-gray-400 hover:text-primary-500 transition"
                    >
                      {bookmarks[internship.id] ? (
                        <Bookmark size={20} className="text-primary-500" />
                      ) : (
                        <BookmarkPlus size={20} />
                      )}
                    </button>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-1.5" />
                      <span className="text-sm">{internship.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase size={16} className="mr-1.5" />
                      <span className="text-sm">{internship.type || 'Type not specified'}</span>
                    </div>
                    {internship.is_remote && (
                      <div className="flex items-center text-emerald-600">
                        <span className="text-sm">Remote</span>
                  </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {internship.type && <Badge variant="primary">{internship.type}</Badge>}
                    {internship.duration && <Badge variant="secondary">{internship.duration}</Badge>}
                    {internship.is_remote && <Badge variant="accent">Remote</Badge>}
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600 text-sm line-clamp-3">{internship.description || 'No description provided.'}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {internship.skills && Array.isArray(internship.skills) && 
                      internship.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                      ))
                    }
                    {internship.skills && Array.isArray(internship.skills) && internship.skills.length > 3 && (
                      <span className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                        +{internship.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-1.5" />
                      {internship.deadline ? (
                        <span>Apply by {new Date(internship.deadline).toLocaleString()}</span>
                      ) : (
                        <span>Open until filled</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {user?.role === 'student' && (internship.company as any)?.id && (
                        <MessageButton
                          recipientId={(internship.company as any).id}
                          variant="outline"
                          size="sm"
                          icon={<MessageSquare size={16} />}
                          label="Message"
                          internshipId={internship.id}
                        />
                      )}
                      <Link to={`/internships/${internship.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Search size={48} className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No internships found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <div className="mt-6">
            <Button onClick={resetFilters}>Clear all filters</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipsList;