import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  ExternalLink,
  Briefcase,
  X,
  Download,
  MessageSquare
} from 'lucide-react';
import { StudentProfile } from '../../types';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader } from '../ui/Card';
import MessageButton from '../shared/MessageButton';

interface ApplicantProfileProps {
  student: StudentProfile;
  onClose: () => void;
  resumeUrl?: string;
}

const ApplicantProfile: React.FC<ApplicantProfileProps> = ({ 
  student, 
  onClose,
  resumeUrl
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Format graduation year
  const graduationYear = student.graduation_year 
    ? new Date(student.graduation_year, 0).getFullYear() 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div 
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{student.full_name || 'Student Profile'}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <MessageButton
              recipientId={student.id}
              variant="primary"
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X size={20} />}
              iconPosition="right"
              className="text-gray-500"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'profile'
                ? 'text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          {resumeUrl && (
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center ${
                activeTab === 'resume'
                  ? 'text-primary-700 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('resume')}
            >
              <FileText size={16} className="mr-1.5" />
              Resume
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <Card variant="bordered">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-base text-gray-900">{student.email}</p>
                      </div>
                    </div>

                    {student.location && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-base text-gray-900">{student.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Education</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {student.university && (
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">University</p>
                          <p className="text-base text-gray-900">{student.university}</p>
                        </div>
                      </div>
                    )}

                    {student.degree && (
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Degree</p>
                          <p className="text-base text-gray-900">{student.degree}</p>
                        </div>
                      </div>
                    )}

                    {graduationYear && (
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Graduation Year</p>
                          <p className="text-base text-gray-900">{graduationYear}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {resumeUrl && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Resume</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-700">Student Resume</p>
                        <p className="text-xs text-gray-500 mt-1">View the student's uploaded resume</p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<FileText size={16} />}
                        onClick={() => setActiveTab('resume')}
                      >
                        View Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {student.bio && (
                <Card variant="bordered">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Bio</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 whitespace-pre-line">{student.bio}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'resume' && resumeUrl && (
            <div className="space-y-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Student Resume</h3>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ExternalLink size={16} />}
                    onClick={() => window.open(resumeUrl, '_blank')}
                  >
                    Open in New Tab
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Download size={16} />}
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = resumeUrl;
                      link.download = `${student.full_name}-resume.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                {resumeUrl && resumeUrl.toLowerCase().endsWith('.pdf') ? (
                  <div className="relative w-full h-[600px]">
                    {/* Primary method - iframe with sandbox for better security */}
                    <iframe
                      src={resumeUrl}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin"
                      title={`${student.full_name}'s Resume`}
                      loading="lazy"
                    ></iframe>
                    
                    {/* Fallback method - object tag for older browsers */}
                    <object
                      data={resumeUrl}
                      type="application/pdf"
                      className="w-full h-full border-0 hidden"
                    >
                      {/* Third fallback - direct link */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                        <FileText size={48} className="text-gray-400 mb-4" />
                        <p className="text-gray-800 mb-3">Unable to display PDF directly</p>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => window.open(resumeUrl, '_blank')}
                        >
                          Open Resume
                        </Button>
                      </div>
                    </object>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-800 mb-3">Resume preview not available</p>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => resumeUrl && window.open(resumeUrl, '_blank')}
                    >
                      View Resume
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApplicantProfile; 