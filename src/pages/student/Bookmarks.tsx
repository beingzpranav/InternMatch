import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Briefcase, MapPin, Calendar, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Bookmark as BookmarkType } from '../../types';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const Bookmarks = () => {
  const { user } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          internship:internships(*, company:profiles!internships_company_id_fkey(*))
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data as BookmarkType[]);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async (id: string) => {
    setRemovingId(id);
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
      toast.success('Bookmark removed');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    } finally {
      setRemovingId(null);
    }
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Internships</h1>
          <p className="text-gray-600 mt-1">Manage your bookmarked internship opportunities</p>
        </div>
        <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
          <Bookmark size={20} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse-slow flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full mb-4"></div>
            <div className="text-gray-600">Loading bookmarks...</div>
          </div>
        </div>
      ) : bookmarks.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {bookmarks.map((bookmark) => (
            <motion.div key={bookmark.id} variants={item}>
              <Card className="h-full flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <Link to={`/internships/${bookmark.internship_id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                        {bookmark.internship?.title || 'Internship'}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      disabled={removingId === bookmark.id}
                      className="text-gray-400 hover:text-error-500 transition-colors p-1"
                      aria-label="Remove bookmark"
                    >
                      {removingId === bookmark.id ? (
                        <div className="animate-spin h-5 w-5 border-2 border-error-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Briefcase size={16} className="mr-1.5" />
                    <span>
                      {bookmark.internship?.company?.company_name || 'Company'}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin size={16} className="mr-1.5" />
                    <span>
                      {bookmark.internship?.location || 'Location'}
                      {bookmark.internship?.is_remote ? ' (Remote)' : ''}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-1.5" />
                    <span>{bookmark.internship?.duration || 'Duration'}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {bookmark.internship?.type && (
                      <Badge variant="primary">{bookmark.internship.type}</Badge>
                    )}
                    {bookmark.internship?.is_remote && (
                      <Badge variant="accent">Remote</Badge>
                    )}
                    {bookmark.internship?.stipend && (
                      <Badge variant="success">Paid</Badge>
                    )}
                  </div>

                  {bookmark.internship?.skills && bookmark.internship.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {bookmark.internship.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                      {bookmark.internship.skills.length > 3 && (
                        <span className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          +{bookmark.internship.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-auto p-4 pt-0">
                  <Link to={`/internships/${bookmark.internship_id}`}>
                    <Button fullWidth>View Details</Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Bookmark size={48} className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Save internships you're interested in to view them later.
          </p>
          <div className="mt-6">
            <Link to="/internships">
              <Button>Browse Internships</Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Bookmarks;