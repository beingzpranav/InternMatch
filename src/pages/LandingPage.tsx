import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Building2, ArrowRight, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const LandingPage = () => {
  const { user } = useAuthStore();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500 rounded-md flex items-center justify-center text-white mr-2">
              <Briefcase size={20} />
            </div>
            <span className="text-xl font-bold text-primary-900">InternMatch</span>
          </div>
          
          <div className="flex items-center space-x-4">            
            {user ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/signin" className="text-gray-600 hover:text-gray-900 font-medium">
                  Sign in
                </Link>
                <Link to="/auth/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <motion.section 
        className="bg-gradient-to-br from-primary-50 to-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Connect with opportunities that{' '}
                <span className="text-primary-600">shape your future</span>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-600 mb-8 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                The platform where talented students meet innovative companies for internship opportunities
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/auth/signup?role=student">
                  <Button size="lg" icon={<Users size={18} />}>
                    I'm a Student
                  </Button>
                </Link>
                <Link to="/auth/signup?role=company">
                  <Button size="lg" variant="secondary" icon={<Building2 size={18} />}>
                    I'm a Company
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <img 
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Students working" 
                className="rounded-xl shadow-xl w-full max-w-md object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How InternMatch Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform streamlines the internship process for both students and companies
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div 
              className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-xl shadow-sm border border-primary-100"
              variants={item}
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Students</h3>
              <p className="text-gray-600 mb-4">
                Discover internships that match your skills and interests. Apply with ease and track your applications.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-primary-500 mr-2" />
                  <span>Browse opportunities</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-primary-500 mr-2" />
                  <span>Apply with one click</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-primary-500 mr-2" />
                  <span>Track application status</span>
                </li>
              </ul>
              <Link to="/auth/signup?role=student" className="text-primary-600 font-medium flex items-center">
                Get started <ArrowRight size={16} className="ml-1" />
              </Link>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-secondary-50 to-white p-8 rounded-xl shadow-sm border border-secondary-100"
              variants={item}
            >
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600 mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Companies</h3>
              <p className="text-gray-600 mb-4">
                Post internships and find talented students. Review applications and manage candidates efficiently.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-secondary-500 mr-2" />
                  <span>Post internship opportunities</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-secondary-500 mr-2" />
                  <span>Find qualified candidates</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-secondary-500 mr-2" />
                  <span>Track applicant pipeline</span>
                </li>
              </ul>
              <Link to="/auth/signup?role=company" className="text-secondary-600 font-medium flex items-center">
                Get started <ArrowRight size={16} className="ml-1" />
              </Link>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-accent-50 to-white p-8 rounded-xl shadow-sm border border-accent-100"
              variants={item}
            >
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mb-4">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Key Features</h3>
              <p className="text-gray-600 mb-4">
                Our platform is designed to make internship management simple and effective.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-accent-500 mr-2" />
                  <span>Smart matching algorithm</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-accent-500 mr-2" />
                  <span>Real-time notifications</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <ChevronRight size={16} className="text-accent-500 mr-2" />
                  <span>Detailed analytics</span>
                </li>
              </ul>
              <Link to="/auth/signup" className="text-accent-600 font-medium flex items-center">
                Explore features <ArrowRight size={16} className="ml-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from students and companies who found success on our platform
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={item}
            >
              <div className="flex items-start mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/79.jpg" 
                  alt="Student testimonial" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-gray-600">Computer Science Student</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "InternMatch helped me find the perfect internship that aligned with my skills and career goals. 
                The application process was smooth, and I received timely responses from companies."
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={item}
            >
              <div className="flex items-start mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Company testimonial" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Michael Rodriguez</h4>
                  <p className="text-gray-600">HR Manager, TechCorp</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "As a company, we've found exceptional talent through InternMatch. The platform makes it easy to 
                post opportunities and manage applications efficiently."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to start your journey?
          </motion.h2>
          <motion.p 
            className="text-lg text-primary-100 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Join thousands of students and companies already using InternMatch
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/auth/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                Get Started Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center text-white mr-2">
                <Briefcase size={16} />
              </div>
              <span className="text-lg font-bold text-primary-900">InternMatch</span>
            </div>
            <div className="flex flex-wrap justify-center space-x-6">
              <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
                About
              </Link>
              <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
                Privacy
              </Link>
              <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
                Terms
              </Link>
              <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} InternMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;