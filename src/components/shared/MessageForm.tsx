import React, { useState } from 'react';
import { Send, Info } from 'lucide-react';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';

interface MessageFormProps {
  onSubmit: (message: string) => Promise<void>;
  onCancel: () => void;
  recipientType: 'applicant' | 'company';
  recipientName: string;
}

const MessageForm: React.FC<MessageFormProps> = ({
  onSubmit,
  onCancel,
  recipientType,
  recipientName
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3 flex">
        <Info size={18} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">About messaging</p>
          <p>
            This message will be sent to <span className="font-medium">{recipientName}</span> 
            {recipientType === 'applicant' ? ' (Applicant)' : ' (Company)'} via email.
            They will be able to respond directly through their email or by logging in to the platform.
          </p>
        </div>
      </div>

      <div>
        <TextArea
          label="Message"
          id="message"
          placeholder={`Type your message to ${recipientName}...`}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      {recipientType === 'applicant' && (
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600 font-medium mb-1">Message templates:</p>
          <div className="space-y-2">
            <button
              type="button"
              className="text-sm text-left w-full text-primary-700 hover:text-primary-800 hover:underline"
              onClick={() => setMessage(`Dear ${recipientName},\n\nThank you for your application. We are writing to inform you that we would like to schedule an interview with you. Please let us know your availability for the coming week.\n\nBest regards,\nThe Recruitment Team`)}
            >
              Request an interview
            </button>
            <button
              type="button"
              className="text-sm text-left w-full text-primary-700 hover:text-primary-800 hover:underline"
              onClick={() => setMessage(`Dear ${recipientName},\n\nWe need some additional information regarding your application. Could you please provide more details about your previous experience with [specifics]?\n\nBest regards,\nThe Recruitment Team`)}
            >
              Request additional information
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={<Send size={16} />}
          isLoading={isLoading}
          disabled={!message.trim() || isLoading}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
};

export default MessageForm; 