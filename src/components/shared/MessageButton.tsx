import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';

interface MessageButtonProps {
  recipientId: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  label?: string;
  icon?: React.ReactNode;
  internshipId?: string; // Optional prop to check if student has applied
}

const MessageButton: React.FC<MessageButtonProps> = ({
  recipientId,
  variant = 'outline',
  size = 'sm',
  className = '',
  showIcon = true,
  label = 'Message',
  icon,
  internshipId
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [canMessage, setCanMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkMessagingPermissions();
  }, [user, recipientId, internshipId]);

  const checkMessagingPermissions = async () => {
    if (!user) {
      setCanMessage(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Admin can message anyone
      if (user.role === 'admin') {
        setCanMessage(true);
        setIsLoading(false);
        return;
      }

      // Get recipient's role
      const { data: recipientData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', recipientId)
        .single();

      // Anyone can message admins
      if (recipientData?.role === 'admin') {
        setCanMessage(true);
        setIsLoading(false);
        return;
      }

      // Company can only message students who have applied to their internships
      if (user.role === 'company') {
        if (recipientData?.role !== 'student') {
          setCanMessage(false);
          setIsLoading(false);
          return;
        }

        // Check if student has applied to any of the company's internships
        const { data: applications } = await supabase
          .from('applications')
          .select('id')
          .eq('student_id', recipientId)
          .eq('internship.company_id', user.id)
          .maybeSingle();

        setCanMessage(!!applications);
        setIsLoading(false);
        return;
      }

      // Student can message admins and companies they've applied to
      if (user.role === 'student') {
        // Can message admins (already handled above)
        if (recipientData?.role === 'company') {
          // Check if student has applied to any of this company's internships
          const { data: applications } = await supabase
            .from('applications')
            .select('id')
            .eq('student_id', user.id)
            .eq('internship.company_id', recipientId)
            .maybeSingle();

          setCanMessage(!!applications);
        } else {
          setCanMessage(false);
        }
      }
    } catch (error) {
      console.error('Error checking messaging permissions:', error);
      setCanMessage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }

    if (!canMessage && !isLoading) {
      if (user.role === 'student') {
        toast.error('You can only reply to messages initiated by companies or admins');
      } else if (user.role === 'company') {
        toast.error('You can only message students who have applied to your internships or admins');
      }
      return;
    }

    navigate(`/messages?recipient=${recipientId}`);
  };

  const buttonIcon = icon || (showIcon ? <MessageSquare size={size === 'sm' ? 16 : 20} /> : undefined);

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      icon={buttonIcon}
      disabled={isLoading || (!canMessage && !!user)}
    >
      {label}
    </Button>
  );
};

export default MessageButton; 