import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Send,
  User,
  Inbox,
  PenSquare,
  Info,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { toast } from 'react-hot-toast';

// Simplified Message interface
interface MessageData {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
  recipient?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

interface RecipientData {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const Messaging: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    message_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');

  // Get recipient ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipientId = params.get('recipient');
    if (recipientId) {
      setNewMessage(prev => ({ ...prev, recipient_id: recipientId }));
      setShowComposeModal(true);
    }
  }, [location]);

  // Fetch messages
  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchRecipients();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, email, role),
          recipient:profiles!messages_recipient_id_fkey(id, full_name, email, role)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error details:', error);
        
        // Handle undefined table gracefully
        if (error.code === '42P01') { // PostgreSQL code for undefined_table
          toast.error('Messages database not yet set up. Run migrations first.');
          setMessages([]);
          return;
        }
        
        // Handle foreign key relationship errors
        if (error.message && error.message.includes('foreign key constraint')) {
          toast.error('Database relationship error. Try a simpler query.');
          
          // Try a simpler query without foreign key relationships
          const { data: simpleData, error: simpleError } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
            
          if (simpleError) {
            throw simpleError;
          }
          
          setMessages(simpleData || []);
          return;
        }
        
        throw error;
      }
      
      if (data) {
        setMessages(data as MessageData[]);
        // Count unread messages
        const unread = data.filter(msg => 
          msg.recipient_id === user.id && !msg.is_read
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
      setMessages([]); // Ensure we have an empty array not undefined
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipients = async () => {
    if (!user) return;
    
    try {
      // For simplicity, just fetch all users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .neq('id', user.id);
      
      if (error) throw error;
      
      if (data) {
        setRecipients(data);
      }
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to load recipients');
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .rpc('mark_message_as_read', { message_id: messageId });
      
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.recipient_id || !newMessage.message_text) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: newMessage.recipient_id,
          subject: newMessage.subject || 'No subject',
          message_text: newMessage.message_text,
          related_to: 'general',
          is_read: false
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Message sent successfully!');
      
      // Reset form and close modal
      setNewMessage({
        recipient_id: '',
        subject: '',
        message_text: ''
      });
      setShowComposeModal(false);
      
      // Refresh messages
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-[500px]">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            className={`flex items-center space-x-2 ${
              activeTab === 'inbox' 
                ? 'text-primary-600 font-medium' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('inbox')}
          >
            <Inbox size={18} />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            className={`flex items-center space-x-2 ${
              activeTab === 'sent' 
                ? 'text-primary-600 font-medium' 
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            <Send size={18} />
            <span>Sent</span>
          </button>
        </div>
        
        <Button
          variant="primary"
          icon={<PenSquare size={16} />}
          onClick={() => setShowComposeModal(true)}
        >
          Compose
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-500">Loading messages...</p>
        </div>
      ) : (
        <div className="flex h-[500px] border rounded-md overflow-hidden">
          {/* Message list panel */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare size={40} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No messages found</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComposeModal(true)}
                >
                  Send your first message
                </Button>
              </div>
            ) : (
              <div>
                {messages
                  .filter(msg => 
                    activeTab === 'inbox' 
                      ? msg.recipient_id === user?.id 
                      : msg.sender_id === user?.id
                  )
                  .map(message => (
                    <div
                      key={message.id}
                      className={`p-3 border-b cursor-pointer transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-primary-50 border-l-4 border-l-primary-500'
                          : 'hover:bg-gray-100'
                      } ${
                        !message.is_read && message.recipient_id === user?.id
                          ? 'bg-primary-50/30'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.is_read && message.recipient_id === user?.id) {
                          markAsRead(message.id);
                        }
                      }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">
                          {activeTab === 'inbox'
                            ? message.sender?.full_name || 'Unknown'
                            : message.recipient?.full_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {message.subject || 'No subject'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {message.message_text}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Message content panel */}
          <div className="w-2/3 bg-white p-6 overflow-y-auto">
            {selectedMessage ? (
              <div>
                <div className="pb-4 border-b mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedMessage.subject || 'No subject'}
                  </h3>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-3">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {activeTab === 'inbox'
                            ? selectedMessage.sender?.full_name || 'Unknown'
                            : selectedMessage.recipient?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeTab === 'inbox'
                            ? `From: ${selectedMessage.sender?.email || 'unknown@example.com'}`
                            : `To: ${selectedMessage.recipient?.email || 'unknown@example.com'}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.message_text}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-between">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Back to List
                  </Button>
                  
                  {activeTab === 'inbox' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ArrowRight size={16} />}
                      onClick={() => {
                        setNewMessage({
                          recipient_id: selectedMessage.sender_id,
                          subject: `Re: ${selectedMessage.subject || 'No subject'}`,
                          message_text: ''
                        });
                        setShowComposeModal(true);
                      }}
                      iconPosition="right"
                    >
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Info size={40} className="text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">
                  {messages.length > 0
                    ? 'Select a message to view its contents'
                    : 'No messages to display'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Compose message modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Compose Message</h3>
              <button 
                className="text-gray-400 hover:text-gray-600" 
                onClick={() => setShowComposeModal(false)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={sendMessage}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Recipient
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newMessage.recipient_id}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient_id: e.target.value })}
                  required
                >
                  <option value="">Select Recipient</option>
                  {recipients.map(recipient => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.full_name} ({recipient.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Subject"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[150px]"
                  value={newMessage.message_text}
                  onChange={(e) => setNewMessage({ ...newMessage, message_text: e.target.value })}
                  placeholder="Type your message here..."
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowComposeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Send size={16} />}
                >
                  Send Message
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Messaging; 