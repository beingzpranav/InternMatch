import React, { useState, useRef } from 'react';
import { FileText, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import Button from './Button';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface FileUploadProps {
  onFileUpload: (url: string, file: File) => void;
  accept?: string;
  maxSize?: number; // Size in MB
  currentFileUrl?: string | null;
  buttonText?: string;
  fieldName?: string; // Which field to update (avatar_url, resume_url, company_logo_url)
}

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept = '.pdf,.doc,.docx',
  maxSize = 5, // 5 MB default
  currentFileUrl = null,
  buttonText = 'Choose File',
  fieldName = '',
}) => {
  const { user } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(currentFileUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setUploadError(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    // Validate file type
    if (accept.includes('image/*')) {
      // Handle image/* type validation
      if (!selectedFile.type.startsWith('image/')) {
        setUploadError(`Only image files are allowed`);
        return;
      }
    } else {
      // Regular file extension validation for non-image/* types
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
      
      if (fileExtension && !allowedExtensions.includes(fileExtension)) {
        setUploadError(`Only ${accept} files are allowed`);
        return;
      }
    }
    
    setFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file || !user) return;
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Generate a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      // Determine the storage folder based on file type
      let folder = 'files';
      if (fieldName === 'avatar_url' || accept.includes('image/*')) {
        folder = 'uploads';
      } else if (fieldName === 'resume_url') {
        folder = 'resumes';
      } else if (fieldName === 'company_logo_url') {
        folder = 'logos';
      }
      
      // Use a user-specific path for better organization and security
      const filePath = `${user.id}/${folder}/${fileName}`;
      
      // Upload to the uploads bucket
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Upload error:', error);
        
        // Handle different types of errors
        if (error.message?.includes('bucket') || error.message?.includes('not found')) {
          setUploadError(`Storage bucket not found. Please ask the administrator to create the 'uploads' bucket in Supabase.`);
        } else if (error.message?.includes('security policy') || error.message?.includes('permission')) {
          setUploadError(`Permission denied. The system administrator needs to configure proper storage permissions.`);
          console.error('RLS Policy Error:', error);
        } else {
          throw error;
        }
        setUploading(false);
        return;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Set the current URL
      setCurrentUrl(publicUrl);
      
      // Update progress for UI
      setProgress(100);
      
      // Notify parent component first (this is the critical part - the parent component will handle the profile update)
      onFileUpload(publicUrl, file);
      
      setUploading(false);
      
      // Show success message based on file type
      let successMessage = 'File uploaded successfully!';
      if (fieldName === 'avatar_url') {
        successMessage = 'Profile photo uploaded successfully!';
      } else if (fieldName === 'resume_url') {
        successMessage = 'Resume uploaded successfully!';
      } else if (fieldName === 'company_logo_url') {
        successMessage = 'Company logo uploaded successfully!';
      } else if (file.type.startsWith('image/')) {
        successMessage = 'Image uploaded successfully!';
      }
      
      toast.success(successMessage, {
        duration: 4000,
        icon: '🎉'
      });
      
      // Clear the file selection after successful upload
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Error uploading file');
      setUploading(false);
      toast.error('Upload failed. Please try again.');
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCurrentFile = () => {
    setCurrentUrl(null);
    onFileUpload('', new File([], 'empty.txt'));
  };
  
  const getFileName = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    const fullFileName = parts[parts.length - 1];
    const decodedName = decodeURIComponent(fullFileName);
    // For very long file names, truncate
    return decodedName.length > 30 
      ? `${decodedName.substring(0, 15)}...${decodedName.substring(decodedName.length - 10)}`
      : decodedName;
  };

  return (
    <div className="space-y-4">
      {currentUrl && !file && (
        <div className="flex items-center p-3 bg-gray-50 border rounded-md">
          <FileText size={20} className="text-primary-600 mr-2" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Current file: {getFileName(currentUrl)}
            </div>
            <div className="flex mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.open(currentUrl, '_blank')}
                className="mr-2"
              >
                View
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                onClick={removeCurrentFile}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
        <div className="mb-4">
          <FileText size={32} className="mx-auto text-gray-400" />
        </div>
        <div className="space-y-2">
          <p className="text-gray-700">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Accepts {accept} files up to {maxSize}MB
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Your file is securely stored and accessible only to authenticated users
          </p>
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={uploading}
        />
        
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
          >
            <Upload size={16} className="mr-2" />
            {buttonText}
          </Button>
        </div>
      </div>
      
      {file && (
        <div className="border rounded-md p-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText size={18} className="text-primary-600 mr-2" />
              <div className="text-sm font-medium text-gray-900">{file.name}</div>
            </div>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={clearFile}
              disabled={uploading}
            >
              <X size={18} />
            </button>
          </div>
          
          {uploading && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
                <div
                  className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {progress}% Uploading...
              </div>
            </div>
          )}
          
          {!uploading && (
            <div className="mt-2 flex justify-end">
              <Button 
                size="sm" 
                variant="primary" 
                onClick={uploadFile}
              >
                <Upload size={16} className="mr-1" />
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
      
      {uploadError && (
        <div className="text-error-600 bg-error-50 border border-error-200 p-2 rounded-md flex items-start">
          <AlertCircle size={16} className="mr-1 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}
      
      {!uploading && progress === 100 && !uploadError && !file && (
        <div className="text-success-600 bg-success-50 border border-success-200 p-2 rounded-md flex items-start">
          <CheckCircle size={16} className="mr-1 flex-shrink-0 mt-0.5" />
          <span className="text-sm">File uploaded successfully and securely stored!</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 