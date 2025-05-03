import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ExternalLink,
  Download,
  X
} from 'lucide-react';
import Button from '../ui/Button';

interface StudentResumeProps {
  studentName: string;
  resumeUrl: string;
  onClose: () => void;
}

const StudentResume: React.FC<StudentResumeProps> = ({
  studentName,
  resumeUrl,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold">{studentName}'s Resume</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X size={18} />}
          >
            Close
          </Button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex justify-end space-x-2 mb-4">
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
                link.download = `${studentName}-resume.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download
            </Button>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 min-h-[500px]">
            {resumeUrl && resumeUrl.toLowerCase().endsWith('.pdf') ? (
              <div className="relative w-full h-[600px]">
                {/* Primary method - iframe with sandbox for better security */}
                <iframe
                  src={resumeUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title={`${studentName}'s Resume`}
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
                  onClick={() => window.open(resumeUrl, '_blank')}
                >
                  View Resume
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentResume; 