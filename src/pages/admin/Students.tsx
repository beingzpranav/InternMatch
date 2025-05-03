import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Eye, Edit, Trash2, Search, GraduationCap, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StudentProfile } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantProfile from '../../components/company/ApplicantProfile';
import ResumeViewer from '../../components/shared/ResumeViewer';
import MessageButton from '../../components/shared/MessageButton';

// Extend StudentProfile for students with applications count
interface StudentWithApplications extends StudentProfile {
  applications?: { count: number }[];
}

const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithApplications[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [viewingResume, setViewingResume] = useState<{student: StudentProfile, url: string} | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch students with counts of their applications
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          applications:applications(count)
        `)
        .eq('role', 'student');

      if (error) throw error;
      
      setStudents(data as StudentWithApplications[]);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (student: StudentProfile) => {
    setSelectedStudent(student);
  };

  const handleEdit = (id: string) => {
    // Navigate to student edit form
    navigate(`/admin/students/edit/${id}`);
    // Since this page doesn't exist yet, we'll show a toast
    toast('Student edit form is not yet implemented');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        
        // First, delete all associated applications
        const { error: applicationsError } = await supabase
          .from('applications')
          .delete()
          .eq('student_id', id);
        
        if (applicationsError) throw applicationsError;
        
        // Then delete the student profile
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Update local state
        setStudents(students.filter(student => student.id !== id));
        toast.success('Student deleted successfully');
      } catch (error) {
        console.error('Error deleting student:', error);
        toast.error('Failed to delete student');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddStudent = () => {
    // Navigate to add student form
    navigate('/admin/students/add');
    // Since this page doesn't exist yet, we'll show a toast
    toast('Add student form is not yet implemented');
  };

  const handleViewResume = (student: StudentProfile) => {
    if (!student.resume_url) {
      toast.error('No resume available for this student');
      return;
    }
    setViewingResume({student, url: student.resume_url});
  };

  const filteredStudents = students.filter(student => 
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.university?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence>
        {selectedStudent && (
          <ApplicantProfile
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            resumeUrl={selectedStudent.resume_url || undefined}
          />
        )}
        {viewingResume && (
          <ResumeViewer
            studentName={viewingResume.student.full_name || 'Student'}
            resumeUrl={viewingResume.url}
            onClose={() => setViewingResume(null)}
          />
        )}
      </AnimatePresence>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Students</h1>
        <Button
          onClick={handleAddStudent}
          icon={<User size={18} />}
        >
          Add Student
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Student List</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2 text-gray-500">Loading students...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Full Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">University</th>
                  <th className="py-3 px-4 text-left">Applications</th>
                  <th className="py-3 px-4 text-left">Resume</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {student.full_name || 'Unnamed Student'}
                      </td>
                      <td className="py-3 px-4">{student.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <GraduationCap size={16} className="text-gray-400 mr-2" />
                          {student.university || 'Not specified'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {student.applications && student.applications[0]?.count || 0} Applications
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {student.resume_url ? (
                          <Badge variant="success" className="flex items-center">
                            <FileText size={14} className="mr-1" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="error" className="flex items-center">
                            <FileText size={14} className="mr-1" /> Not Uploaded
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                            onClick={() => handleView(student)}
                          >
                            <Eye size={18} />
                          </button>
                          {student.resume_url && (
                            <button 
                              className="text-green-600 hover:text-green-800"
                              title="View Resume"
                              onClick={() => handleViewResume(student)}
                            >
                              <ExternalLink size={18} />
                            </button>
                          )}
                          <button 
                            className="text-purple-600 hover:text-purple-800"
                            title="Message Student"
                            onClick={() => navigate(`/messages?recipient=${student.id}`)}
                          >
                            <MessageSquare size={18} />
                          </button>
                          <button 
                            className="text-amber-600 hover:text-amber-800"
                            title="Edit Student"
                            onClick={() => handleEdit(student.id)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            title="Delete Student"
                            onClick={() => handleDelete(student.id)}
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
                      {searchTerm ? 'No students found matching your search' : 'No students found'}
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

export default AdminStudents; 