import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Calendar,
  MapPin,
  FileText,
  Clock,
  DollarSign,
  X,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Application } from '../../types';
import Button from '../ui/Button';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import ApplicantProfile from '../company/ApplicantProfile';
import Dialog from '../ui/Dialog';
import MessageForm from './MessageForm';
import { toast } from 'react-hot-toast';

interface ApplicationDetailsProps {
  application: Application;
  onClose: () => void;
  onUpdateStatus?: (status: 'pending' | 'reviewing' | 'accepted' | 'rejected') => void;
  isAdmin?: boolean;
}

const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  onClose,
  onUpdateStatus,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [viewStudentProfile, setViewStudentProfile] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<'applicant' | 'company'>('applicant');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'reviewing':
        return <Badge variant="accent">Reviewing</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenMessageDialog = (recipient: 'applicant' | 'company') => {
    setMessageRecipient(recipient);
    setMessageDialogOpen(true);
  };

  const handleSendMessage = async (message: string) => {
    try {
      // Create a fake promise to simulate a request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Log message details to console for debugging
      console.log('Message details:', {
        message,
        recipient: messageRecipient,
        recipientId: messageRecipient === 'applicant' 
          ? application.student_id 
          : application.internship?.company_id,
        applicationId: application.id
      });
      
      // Show success message
      toast.success(`Message sent to ${messageRecipient === 'applicant' 
        ? application.student?.full_name || 'applicant' 
        : application.internship?.company?.company_name || 'company'}`);
      
      setMessageDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleViewResume = () => {
    if (application.resume_url) {
      setActiveTab('resume');
    }
  };

  return (
    <>
      {viewStudentProfile && application.student ? (
        <ApplicantProfile
          student={application.student}
          onClose={() => setViewStudentProfile(false)}
          resumeUrl={application.resume_url || undefined}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                  <div className="flex items-center mt-1">
                    <Clock size={14} className="text-gray-500 mr-1.5" />
                    <span className="text-sm text-gray-500">
                      Submitted on {formatDate(application.created_at)}
                    </span>
                  </div>
                </div>
              </div>
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

            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'text-primary-700 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Application Details
              </button>
              {application.cover_letter && (
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'cover-letter'
                      ? 'text-primary-700 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('cover-letter')}
                >
                  Cover Letter
                </button>
              )}
              {application.resume_url && (
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'resume'
                      ? 'text-primary-700 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveTab('resume')}
                >
                  Resume
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Card variant="bordered" className="mb-6">
                        <CardHeader>
                          <h3 className="text-lg font-semibold">Status</h3>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getStatusBadge(application.status)}
                              <span className="ml-2 text-gray-700">
                                Last updated: {formatDate(application.updated_at || application.created_at)}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {application.resume_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  icon={<FileText size={16} />}
                                  onClick={handleViewResume}
                                >
                                  View Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="bordered">
                      <CardHeader>
                        <div className="flex justify-between items-center w-full">
                          <h3 className="text-lg font-semibold">Applicant</h3>
                          {application.student && (
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<User size={16} />}
                              onClick={() => setViewStudentProfile(true)}
                            >
                              View Full Profile
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 flex-shrink-0">
                              {application.student?.avatar_url ? (
                                <img 
                                  src={application.student.avatar_url} 
                                  alt={`${application.student.full_name || 'Applicant'}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User size={20} />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {application.student?.full_name || 'Unknown'}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {application.student?.email}
                              </p>
                              {application.student?.university && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {application.student.university}
                                </p>
                              )}
                              {application.resume_url && (
                                <button 
                                  onClick={handleViewResume}
                                  className="mt-3 text-primary-600 hover:text-primary-800 text-sm flex items-center"
                                >
                                  <FileText size={14} className="mr-1" />
                                  View Resume
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card variant="bordered">
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Internship</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-700 flex-shrink-0">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {application.internship?.title || 'Unknown'}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {application.internship?.company?.company_name || 'Unknown Company'}
                              </p>
                              {application.internship?.location && (
                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                  <MapPin size={14} className="mr-1" />
                                  <span>
                                    {application.internship.location}
                                    {application.internship.is_remote && ' (Remote Available)'}
                                  </span>
                                </div>
                              )}
                              {application.internship?.duration && (
                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                  <Calendar size={14} className="mr-1" />
                                  <span>Duration: {application.internship.duration}</span>
                                </div>
                              )}
                              {application.internship?.stipend && (
                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                  <DollarSign size={14} className="mr-1" />
                                  <span>Stipend: {application.internship.stipend}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {isAdmin && (
                    <Card variant="bordered">
                      <CardHeader>
                        <h3 className="text-lg font-semibold">Admin Actions</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<MessageSquare size={16} />}
                            onClick={() => handleOpenMessageDialog('applicant')}
                          >
                            Send Message to Applicant
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<MessageSquare size={16} />}
                            onClick={() => handleOpenMessageDialog('company')}
                          >
                            Send Message to Company
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeTab === 'cover-letter' && application.cover_letter && (
                <div className="space-y-4">
                  <Card variant="bordered">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Cover Letter</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="whitespace-pre-line text-gray-800">
                          {application.cover_letter}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'resume' && application.resume_url && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Resume</h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<ExternalLink size={16} />}
                        onClick={() => application.resume_url && window.open(application.resume_url, '_blank')}
                      >
                        Open in New Tab
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Download size={16} />}
                        onClick={() => {
                          if (application.resume_url) {
                            const link = document.createElement('a');
                            link.href = application.resume_url;
                            link.download = `${application.student?.full_name || 'applicant'}-resume.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[500px]">
                    {application.resume_url && application.resume_url.toLowerCase().endsWith('.pdf') ? (
                      <div className="relative w-full h-[600px]">
                        {/* Primary method - iframe with sandbox for better security */}
                        <iframe
                          src={application.resume_url}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin"
                          title={`${application.student?.full_name || 'Applicant'}'s Resume`}
                          loading="lazy"
                        ></iframe>
                        
                        {/* Fallback method - object tag for older browsers */}
                        <object
                          data={application.resume_url}
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
                              onClick={() => window.open(application.resume_url || '', '_blank')}
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
                          onClick={() => application.resume_url && window.open(application.resume_url, '_blank')}
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
      )}

      {/* Message Dialog */}
      <AnimatePresence>
        {messageDialogOpen && (
          <Dialog
            isOpen={messageDialogOpen}
            onClose={() => setMessageDialogOpen(false)}
            title={`Send Message to ${
              messageRecipient === 'applicant'
                ? application.student?.full_name || 'Applicant'
                : application.internship?.company?.company_name || 'Company'
            }`}
            maxWidth="max-w-lg"
          >
            <MessageForm
              onSubmit={handleSendMessage}
              onCancel={() => setMessageDialogOpen(false)}
              recipientType={messageRecipient}
              recipientName={
                messageRecipient === 'applicant'
                  ? application.student?.full_name || 'Applicant'
                  : application.internship?.company?.company_name || 'Company'
              }
            />
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApplicationDetails; 