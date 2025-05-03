import React, { useEffect, useState } from 'react';
import { Tags } from 'lucide-react';
import Input from './Input';

interface SkillsInputProps {
  skills?: string[];
  onChange: (skills: string[]) => void;
  required?: boolean;
}

const SkillsInput: React.FC<SkillsInputProps> = ({ 
  skills = [], 
  onChange,
  required = false
}) => {
  const [inputValue, setInputValue] = useState('');
  
  // Convert skills array to string for display
  useEffect(() => {
    const skillsString = Array.isArray(skills) ? skills.join(', ') : '';
    setInputValue(skillsString);
  }, [skills]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update the input field value to whatever the user types
    setInputValue(value);
    
    // Only parse and update the skills array when there's a complete input
    // This allows typing commas freely
    if (value.trim()) {
      const skillsArray = value
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '');
      
      onChange(skillsArray);
    } else {
      onChange([]);
    }
  };
  
  return (
    <div className="space-y-2">
      <Input
        label="Skills Required"
        value={inputValue}
        onChange={handleInputChange}
        required={required}
        placeholder="Enter skills separated by commas (e.g., React, JavaScript, Node.js)"
        icon={<Tags size={18} className="text-primary-600" />}
        helperText="Enter skills separated by commas"
      />
      
      {/* Display skills as tags for better visibility */}
      <div className="flex flex-wrap gap-2 mt-2">
        {Array.isArray(skills) && skills.length > 0 && skills.map((skill, index) => (
          <div 
            key={index}
            className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsInput; 