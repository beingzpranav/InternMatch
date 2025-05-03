import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Message } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle,
  Clock,
  X,
  Mail,
  User,
  Inbox,
  PenSquare
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { toast } from 'react-hot-toast';

const Messaging: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    message_text: '',
    related_to: 'general' as 'general' | 'application' | 'internship'
  });
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [recipients, setRecipients] = useState<Array<{ id: string; full_name: string; email: string; role: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  // Fetch messages
  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get messages where user is either sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, email, role),
          recipient:recipient_id(id, full_name, email, role)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setMessages(data as Message[]);
        // Count unread messages where user is recipient
        const unread = data.filter(msg => 
          msg.recipient_id === user.id && !msg.is_read
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced recipient fetching based on user role and permissions
  const fetchRecipients = async () => {
    if (!user) return;
    
    try {
      // Admin can message anyone
      if (user.role === 'admin') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .neq('id', user.id);
        
        if (error) throw error;
        
        if (data) {
          setRecipients(data);
        }
      }
      // Company can only message admins or students who have applied to their internships
      else if (user.role === 'company') {
        // First get all admins
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('role', 'admin');
        
        if (adminError) throw adminError;

        // Get all students who have applied to this company's internships
        const { data: companyInternships, error: internshipsError } = await supabase
          .from('internships')
          .select('id')
          .eq('company_id', user.id);
        
        if (internshipsError) throw internshipsError;
        
        let applicantData: any[] = [];
        if (companyInternships && companyInternships.length > 0) {
          const internshipIds = companyInternships.map(internship => internship.id);
          
          // Get all applications for those internships
          const { data: applications, error: applicationsError } = await supabase
            .from('applications')
            .select('student_id')
            .in('internship_id', internshipIds);
          
          if (applicationsError) throw applicationsError;
          
          if (applications && applications.length > 0) {
            // Get unique student IDs
            const studentIds = [...new Set(applications.map(app => app.student_id))];
            
            // Get student details
            const { data: students, error: studentsError } = await supabase
              .from('profiles')
              .select('id, full_name, email, role')
              .in('id', studentIds);
            
            if (studentsError) throw studentsError;
            
            if (students) {
              applicantData = students;
            }
          }
        }
        
        // Combine admins and applicants
        setRecipients([...(adminData || []), ...applicantData]);
      }
      // Students can only message admins or reply to companies that messaged them first
      else if (user.role === 'student') {
        // First get all admins
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('role', 'admin');
        
        if (adminError) throw adminError;
        
        // Get all companies that have messaged this student
        const { data: companiesMessagedMe, error: companiesError } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('recipient_id', user.id)
          .neq('sender_id', user.id);
        
        if (companiesError) throw companiesError;
        
        let companyData: any[] = [];
        if (companiesMessagedMe && companiesMessagedMe.length > 0) {
          // Get unique company IDs
          const companyIds = [...new Set(companiesMessagedMe.map(msg => msg.sender_id))];
          
          // Get company details
          const { data: companies, error: companyDetailsError } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
            .in('id', companyIds)
            .eq('role', 'company');
          
          if (companyDetailsError) throw companyDetailsError;
          
          if (companies) {
            companyData = companies;
          }
        }
        
        // Combine admins and companies that messaged this student
        setRecipients([...(adminData || []), ...companyData]);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to load message recipients');
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('mark_message_as_read', { message_id: messageId });
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Send a new message with permission validation
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.recipient_id || !newMessage.message_text) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      // Additional permission check before sending
      let canSendMessage = false;
      
      // Admins can message anyone
      if (user.role === 'admin') {
        canSendMessage = true;
      }
      // Companies can only message admins or students who applied to their internships
      else if (user.role === 'company') {
        // Check if recipient is admin
        const { data: recipientData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', newMessage.recipient_id)
          .single();
        
        if (recipientData?.role === 'admin') {
          canSendMessage = true;
        } else {
          // Check if student has applied to any internship from this company
          const { data: companyInternships } = await supabase
            .from('internships')
            .select('id')
            .eq('company_id', user.id);
          
          if (companyInternships && companyInternships.length > 0) {
            const internshipIds = companyInternships.map(internship => internship.id);
            
            const { data: applications } = await supabase
              .from('applications')
              .select('id')
              .eq('student_id', newMessage.recipient_id)
              .in('internship_id', internshipIds)
              .maybeSingle();
            
            canSendMessage = !!applications;
          }
        }
      }
      // Students can only message admins or reply to companies that messaged them first
      else if (user.role === 'student') {
        // Check if recipient is admin
        const { data: recipientData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', newMessage.recipient_id)
          .single();
        
        if (recipientData?.role === 'admin') {
          canSendMessage = true;
        } else {
          // Check if this company has messaged the student before
          const { data: previousMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('sender_id', newMessage.recipient_id)
            .eq('recipient_id', user.id)
            .maybeSingle();
          
          canSendMessage = !!previousMessages;
        }
      }
      
      if (!canSendMessage) {
        if (user.role === 'student') {
          toast.error('You can only message admins or reply to companies that have messaged you');
        } else if (user.role === 'company') {
          toast.error('You can only message admins or students who have applied to your internships');
        }
        return;
      }
      
      // If we reach here, permissions are valid
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: newMessage.recipient_id,
          subject: newMessage.subject || 'No subject',
          message_text: newMessage.message_text,
          related_to: newMessage.related_to
        })
        .select();
      
      if (error) throw error;
      
      // Reset form & close modal
      setNewMessage({
        recipient_id: '',
        subject: '',
        message_text: '',
        related_to: 'general'
      });
      setShowComposeModal(false);
      
      // Refresh messages
      fetchMessages();
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchRecipients();
    }
  }, [user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        payload => {
          // Fetch the complete message with sender details
          const fetchNewMessage = async () => {
            const { data, error } = await supabase
              .from('messages')
              .select(`
                *,
                sender:sender_id(id, full_name, email, role),
                recipient:recipient_id(id, full_name, email, role)
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (!error && data) {
              // Add to messages list
              setMessages(prev => [data as Message, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // Show notification
              toast.success(`New message from ${data.sender?.full_name || 'Someone'}`);
            }
          };
          
          fetchNewMessage();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Get recipient ID from URL if available
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const recipientId = queryParams.get('recipient');
    
    if (recipientId && recipients.length > 0) {
      const recipient = recipients.find(r => r.id === recipientId);
      if (recipient) {
        setNewMessage(prev => ({
          ...prev,
          recipient_id: recipientId
        }));
        setShowComposeModal(true);
      }
    }
  }, [location.search, recipients]);

  // Add a button to fetch all available recipients for students if recipients list is empty
  useEffect(() => {
    if (user && recipients.length === 0) {
      fetchRecipients();
    }
  }, [user, recipients.length]);

  if (!user) {
    return <div>Please log in to use messaging</div>;
  }

  const filteredMessages = messages.filter(msg => 
    activeTab === 'inbox' 
      ? msg.recipient_id === user.id 
      : msg.sender_id === user.id
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">Messages</h2>
          {unreadCount > 0 && (
            <div className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
              {unreadCount} unread
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchMessages}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setShowComposeModal(true);
              fetchRecipients();
            }}
            icon={<PenSquare size={16} />}
          >
            New Message
          </Button>
        </div>
      </div>

      {/* New call-to-action for users with no messages */}
      {messages.length === 0 && !loading && (
        <div className="bg-primary-50 p-4 rounded-lg mb-4 text-center">
          <h3 className="text-primary-700 font-medium mb-2">Start a Conversation</h3>
          <p className="text-primary-600 mb-3">
            You can message administrators, companies or students directly.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setShowComposeModal(true);
              fetchRecipients();
            }}
            icon={<PenSquare size={16} />}
          >
            Compose New Message
          </Button>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'inbox'
              ? 'text-primary-700 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('inbox')}
        >
          <Inbox size={16} className="mr-1" />
          Inbox
          {unreadCount > 0 && (
            <span className="ml-1 text-xs bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'sent'
              ? 'text-primary-700 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          <Send size={16} className="mr-1" />
          Sent
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw size={24} className="animate-spin mx-auto text-primary-600 mb-2" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Mail size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No messages</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'inbox' 
              ? "You don't have any messages in your inbox"
              : "You haven't sent any messages yet"}
          </p>
          {activeTab === 'inbox' && (
            <Button
              size="sm"
              onClick={() => {
                setShowComposeModal(true);
                fetchRecipients();
              }}
            >
              Send a Message
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map(message => (
            <Card 
              key={message.id} 
              className={`
                ${!message.is_read && activeTab === 'inbox' ? 'bg-blue-50 border-blue-200' : ''}
                hover:shadow-md transition-shadow duration-200
                cursor-pointer
              `}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.is_read && message.recipient_id === user.id) {
                  markAsRead(message.id);
                }
              }}
            >
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                      <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <span className="font-medium">
                        {activeTab === 'inbox' 
                          ? message.sender?.full_name || 'Unknown'
                          : message.recipient?.full_name || 'Unknown'
                        }
                      </span>
                      <span className="text-gray-600 text-sm ml-2">
                        ({activeTab === 'inbox' 
                          ? message.sender?.role || 'unknown'
                          : message.recipient?.role || 'unknown'
                        })
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {!message.is_read && activeTab === 'inbox' && (
                      <div className="w-2 h-2 rounded-full bg-primary-600 ml-2"></div>
                    )}
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {message.message_text}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
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
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold">{selectedMessage.subject}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  icon={<X size={18} />}
                >
                  Close
                </Button>
              </div>
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        From: {selectedMessage.sender?.full_name || 'Unknown'}
                        <span className="text-gray-600 text-sm ml-2">
                          ({selectedMessage.sender?.role})
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        To: {selectedMessage.recipient?.full_name || 'Unknown'}
                        <span className="text-gray-600 text-sm ml-2">
                          ({selectedMessage.recipient?.role})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="whitespace-pre-line text-gray-800">
                  {selectedMessage.message_text}
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowComposeModal(true);
                    // Pre-fill reply details
                    setNewMessage({
                      recipient_id: selectedMessage.sender_id === user.id 
                        ? selectedMessage.recipient_id 
                        : selectedMessage.sender_id,
                      subject: `Re: ${selectedMessage.subject}`,
                      message_text: '',
                      related_to: selectedMessage.related_to
                    });
                  }}
                  icon={<Send size={16} />}
                >
                  Reply
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Message Modal */}
      <AnimatePresence>
        {showComposeModal && (
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
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold">Compose New Message</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComposeModal(false)}
                  icon={<X size={18} />}
                >
                  Close
                </Button>
              </div>
              <form onSubmit={sendMessage} className="p-4 space-y-4">
                <div>
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient
                  </label>
                  <select
                    id="recipient"
                    value={newMessage.recipient_id}
                    onChange={(e) => setNewMessage({...newMessage, recipient_id: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a recipient</option>
                    {/* Group by role */}
                    <optgroup label="Students">
                      {recipients
                        .filter(r => r.role === 'student')
                        .map(recipient => (
                          <option key={recipient.id} value={recipient.id}>
                            {recipient.full_name} ({recipient.email})
                          </option>
                        ))
                      }
                    </optgroup>
                    <optgroup label="Companies">
                      {recipients
                        .filter(r => r.role === 'company')
                        .map(recipient => (
                          <option key={recipient.id} value={recipient.id}>
                            {recipient.full_name} ({recipient.email})
                          </option>
                        ))
                      }
                    </optgroup>
                    <optgroup label="Admins">
                      {recipients
                        .filter(r => r.role === 'admin')
                        .map(recipient => (
                          <option key={recipient.id} value={recipient.id}>
                            {recipient.full_name} ({recipient.email})
                          </option>
                        ))
                      }
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder="Subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={newMessage.message_text}
                    onChange={(e) => setNewMessage({...newMessage, message_text: e.target.value})}
                    required
                    rows={6}
                    placeholder="Type your message here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowComposeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    icon={<Send size={16} />}
                    disabled={!newMessage.recipient_id || !newMessage.message_text}
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messaging; 