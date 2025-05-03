import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  // Scroll to top on component mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentYear = new Date().getFullYear();
  const lastUpdated = "May 3, 2024"; // Update this whenever you modify the policy

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-800">
          <ChevronLeft size={18} className="mr-1" />
          Back to home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">Last Updated: {lastUpdated}</p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to InternMatch. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
          <p>
            By using InternMatch, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
          <p>
            When you register and use InternMatch, we may collect the following types of personal information:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name, email address, and contact information</li>
            <li>Educational information (university, major, graduation year)</li>
            <li>Professional information (skills, work experience, resume data)</li>
            <li>Profile pictures and other content you upload</li>
            <li>Account credentials</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Information from Third-Party Services</h3>
          <p>
            We allow you to create an account and log in to use InternMatch through GitHub. If you decide to register through or otherwise grant us access to GitHub, we may collect personal data that is already associated with your account, such as your name, email address, profile picture, and other information made public on these services.
          </p>

          <h3 className="text-xl font-medium mb-3">2.3 Usage Information</h3>
          <p>
            We automatically collect certain information when you visit, use, or navigate InternMatch. This information may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and information about how and when you use our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes, including to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Create and manage your account</li>
            <li>Provide and maintain our service</li>
            <li>Match students with internship opportunities</li>
            <li>Communicate with you about our services, updates, and promotional content</li>
            <li>Analyze usage patterns and improve our platform</li>
            <li>Protect against unauthorized access and legal liability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
          <p>We may share your personal information in the following situations:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>With Companies:</strong> For students, we share relevant profile information with companies you apply to internships with.</li>
            <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, and partners who perform services for us.</li>
            <li><strong>For Business Transfers:</strong> We may share or transfer your information in connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
            <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information where required by law or if we believe disclosure is necessary to protect our rights or the safety of others.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your personal information, but we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Data Protection Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete.</li>
            <li>The right to object to our processing of your personal data.</li>
            <li>The right of restriction - the right to request that we restrict the processing of your personal information.</li>
            <li>The right to data portability - the right to request a copy of the data we have collected in a structured, machine-readable format.</li>
            <li>The right to withdraw consent at any time, where we relied on your consent to process your personal information.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our platform and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p>
            Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>By email: contact@internmatch.com</li>
          </ul>
        </section>
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        &copy; {currentYear} InternMatch. All rights reserved.
      </div>
    </div>
  );
};

export default PrivacyPolicy; 