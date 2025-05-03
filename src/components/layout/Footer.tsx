import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Instagram, Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  { icon: <Github size={20} />, href: "#", label: "GitHub" },
  { icon: <Twitter size={20} />, href: "#", label: "Twitter" },
  { icon: <Linkedin size={20} />, href: "#", label: "LinkedIn" },
  { icon: <Instagram size={20} />, href: "#", label: "Instagram" },
];

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Help Center", href: "#" },
];

// Development team members
const devTeam = [
  {
    name: "Pranav Khandelwal",
    role: "Lead Developer",
    socials: [
      { icon: <Github size={16} />, href: "https://github.com/beingzpranav", label: "GitHub" },
      { icon: <Linkedin size={16} />, href: "https://linkedin.com/in/beingzpranav", label: "LinkedIn" },
      { icon: <Globe size={16} />, href: "https://pranavk.tech", label: "Website" },
      { icon: <Twitter size={16} />, href: "https://x.com/beingzpranav_", label: "Twitter" },
      { icon: <Instagram size={16} />, href: "https://instagram.com/beingzpranav_", label: "Instagram" },
      { icon: <Mail size={16} />, href: "mailto:contact@pranavk.tech", label: "Email" },
    ]
  },
  // {
  //   name: "Alex Johnson",
  //   role: "UI/UX Designer",
  //   socials: [
  //     { icon: <Github size={16} />, href: "https://github.com/alexj", label: "GitHub" },
  //     { icon: <Linkedin size={16} />, href: "https://linkedin.com/in/alex-johnson", label: "LinkedIn" },
  //     { icon: <Instagram size={16} />, href: "https://instagram.com/alexjdesign", label: "Instagram" },
  //   ]
  // },
  // {
  //   name: "Sarah Williams",
  //   role: "Backend Developer",
  //   socials: [
  //     { icon: <Github size={16} />, href: "https://github.com/sarahw", label: "GitHub" },
  //     { icon: <Linkedin size={16} />, href: "https://linkedin.com/in/sarah-williams", label: "LinkedIn" },
  //     { icon: <Twitter size={16} />, href: "https://twitter.com/sarahwdev", label: "Twitter" },
  //   ]
  // },
  // {
  //   name: "James Chen",
  //   role: "Database Architect",
  //   socials: [
  //     { icon: <Github size={16} />, href: "https://github.com/jameschen", label: "GitHub" },
  //     { icon: <Linkedin size={16} />, href: "https://linkedin.com/in/james-chen", label: "LinkedIn" },
  //   ]
  // }
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <motion.div 
                className="w-10 h-10 bg-primary-500 rounded-md flex items-center justify-center text-white mr-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={20} />
              </motion.div>
              <span className="text-xl font-bold text-primary-900">InternMatch</span>
            </Link>
            <p className="text-gray-500 mb-4 text-sm">
              Connecting talented students with great internship opportunities. Find your perfect match and kickstart your career today.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                  aria-label={link.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.slice(0, 3).map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.slice(3).map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Development Team Section */}
        <div className="py-6 border-t border-gray-200 mb-6">
          <h3 className="font-bold text-gray-800 mb-4 text-center">Dev Team</h3>
          <div className="flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-4 max-w-3xl">
              {devTeam.map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 text-center w-full sm:w-auto sm:min-w-[230px] flex-shrink-0">
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{member.role}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {member.socials.map((social, idx) => (
                      <motion.a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-primary-600 transition-colors"
                        aria-label={social.label}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} InternMatch. All rights reserved.
          </p>
          
          <p className="text-gray-500 text-sm text-center md:text-right">
            Made with <span className="text-red-500">♥</span> by <a href="https://pranavk.tech" className="text-primary-500 hover:text-primary-600 transition-colors">Pranav Khandelwal</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;