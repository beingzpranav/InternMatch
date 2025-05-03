import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import Messaging from '../components/shared/Messaging';

const Messages: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquare className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <p className="text-gray-600">
          Communicate with students, companies, and administrators
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <Messaging />
      </div>
    </motion.div>
  );
};

export default Messages; 