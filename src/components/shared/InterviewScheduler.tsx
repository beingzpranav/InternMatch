import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Send, User, ChevronDown, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface InterviewSchedulerProps {
  applicationId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  selected: boolean;
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  applicationId,
  studentId,
  studentName,
  studentEmail,
  onClose,
  onSuccess
}) => {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingType, setMeetingType] = useState('video');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select-date' | 'select-time' | 'details'>('select-date');
  
  // Generate available time slots for the selected date
  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate]);
  
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    // Generate time slots from 9 AM to 5 PM with 30-minute intervals
    const startHour = 9;
    const endHour = 17;
    const date = new Date(selectedDate);
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        
        // Skip time slots in the past
        if (startTime > new Date()) {
          slots.push({
            id: `${hour}-${minute}`,
            startTime,
            endTime,
            selected: false
          });
        }
      }
    }
    
    setTimeSlots(slots);
  };
  
  const handleSelectTimeSlot = (slot: TimeSlot) => {
    setTimeSlots(timeSlots.map(s => ({
      ...s,
      selected: s.id === slot.id
    })));
    setSelectedTimeSlot(slot);
  };
  
  const handleNextStep = () => {
    if (step === 'select-date') {
      setStep('select-time');
    } else if (step === 'select-time' && selectedTimeSlot) {
      setStep('details');
    }
  };
  
  const handlePrevStep = () => {
    if (step === 'select-time') {
      setStep('select-date');
    } else if (step === 'details') {
      setStep('select-time');
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleScheduleInterview = async () => {
    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create calendar event data
      const interviewData = {
        application_id: applicationId,
        student_id: studentId,
        company_id: user?.id,
        title: `Interview with ${studentName}`,
        start_time: selectedTimeSlot.startTime.toISOString(),
        end_time: selectedTimeSlot.endTime.toISOString(),
        meeting_type: meetingType,
        meeting_link: meetingLink,
        description: message,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      
      // Insert into interviews table
      const { data, error } = await supabase
        .from('interviews')
        .insert(interviewData)
        .select();
      
      if (error) throw error;
      
      // Update application status
      await supabase
        .from('applications')
        .update({ status: 'reviewing' })
        .eq('id', applicationId);
      
      // Prepare notification data
      const notificationData = {
        recipient_id: studentId,
        sender_id: user?.id,
        type: 'interview_scheduled',
        message: `${user?.company_name || 'A company'} has scheduled an interview with you.`,
        related_id: data[0].id,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      // Insert notification
      await supabase
        .from('notifications')
        .insert(notificationData);
      
      toast.success('Interview scheduled successfully');
      onSuccess();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>
        
        <Card className="w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Schedule Interview
            </h3>
            <button 
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mr-3">
              <User size={20} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{studentName}</h4>
              <p className="text-sm text-gray-500">{studentEmail}</p>
            </div>
          </div>
          
          {/* Progress steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 'select-date' || step === 'select-time' || step === 'details'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`ml-2 text-sm ${
                  step === 'select-date' || step === 'select-time' || step === 'details'
                    ? 'text-primary-700 font-medium'
                    : 'text-gray-500'
                }`}>
                  Select Date
                </div>
              </div>
              <div className="w-12 h-1 bg-gray-200 mx-2"></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 'select-time' || step === 'details'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`ml-2 text-sm ${
                  step === 'select-time' || step === 'details'
                    ? 'text-primary-700 font-medium'
                    : 'text-gray-500'
                }`}>
                  Select Time
                </div>
              </div>
              <div className="w-12 h-1 bg-gray-200 mx-2"></div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 'details'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  3
                </div>
                <div className={`ml-2 text-sm ${
                  step === 'details'
                    ? 'text-primary-700 font-medium'
                    : 'text-gray-500'
                }`}>
                  Details
                </div>
              </div>
            </div>
          </div>
          
          {step === 'select-date' && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <Calendar size={18} className="mr-2 text-primary-500" />
                Select a date for the interview
              </h4>
              <div className="mb-6">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date) => setSelectedDate(date)}
                  minDate={new Date()}
                  inline
                  calendarClassName="border rounded-md shadow-sm"
                />
              </div>
            </div>
          )}
          
          {step === 'select-time' && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-primary-500" />
                Select a time slot on {selectedDate.toLocaleString([], {dateStyle: 'full'})}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-60 overflow-y-auto">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 border rounded-md text-center cursor-pointer transition ${
                        slot.selected
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'bg-white border-gray-300 hover:border-primary-400'
                      }`}
                      onClick={() => handleSelectTimeSlot(slot)}
                    >
                      <div className="text-sm font-medium">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4 text-gray-500">
                    No available time slots for this date
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 'details' && selectedTimeSlot && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Interview Details
              </h4>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center text-sm">
                    <Calendar size={16} className="mr-2 text-primary-500" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{selectedTimeSlot.startTime.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-sm mt-2">
                    <Clock size={16} className="mr-2 text-primary-500" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-2">
                      {formatTime(selectedTimeSlot.startTime)} - {formatTime(selectedTimeSlot.endTime)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Type
                  </label>
                  <div className="flex space-x-2">
                    <div
                      className={`p-2 border rounded-md flex-1 text-center cursor-pointer ${
                        meetingType === 'video'
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-300'
                      }`}
                      onClick={() => setMeetingType('video')}
                    >
                      Video Call
                    </div>
                    <div
                      className={`p-2 border rounded-md flex-1 text-center cursor-pointer ${
                        meetingType === 'phone'
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-300'
                      }`}
                      onClick={() => setMeetingType('phone')}
                    >
                      Phone Call
                    </div>
                    <div
                      className={`p-2 border rounded-md flex-1 text-center cursor-pointer ${
                        meetingType === 'in-person'
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'border-gray-300'
                      }`}
                      onClick={() => setMeetingType('in-person')}
                    >
                      In-Person
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link or Location
                  </label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder={meetingType === 'in-person' ? 'Enter address' : 'Enter meeting link'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Candidate
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter any additional information or instructions for the interview..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {step !== 'select-date' ? (
              <Button
                variant="outline"
                onClick={handlePrevStep}
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step !== 'details' ? (
              <Button
                variant="primary"
                disabled={step === 'select-time' && !selectedTimeSlot}
                onClick={handleNextStep}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={isLoading}
                onClick={handleScheduleInterview}
                icon={<Send size={16} />}
              >
                {isLoading ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewScheduler; 