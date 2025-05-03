import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsOfService = () => {
  // Scroll to top on component mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentYear = new Date().getFullYear();
  const lastUpdated = "May 3, 2024"; // Update this whenever you modify the terms

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-800">
          <ChevronLeft size={18} className="mr-1" />
          Back to home
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-gray-600 mb-6">Last Updated: {lastUpdated}</p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to InternMatch. These Terms of Service ("Terms") govern your use of the InternMatch platform, website, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Types and Responsibilities</h2>
          <h3 className="text-xl font-medium mb-3">3.1 Student Users</h3>
          <p>
            As a student user, you agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information about your educational background, skills, and experience</li>
            <li>Use the platform to search for and apply to legitimate internship opportunities</li>
            <li>Not misrepresent your qualifications or identity</li>
            <li>Communicate professionally with companies and other users</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Company Users</h3>
          <p>
            As a company user, you agree to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate information about your company and internship opportunities</li>
            <li>Post only legitimate internship opportunities that comply with applicable laws</li>
            <li>Not discriminate against applicants based on race, color, religion, sex, national origin, disability, age, or any other protected status</li>
            <li>Respond to applications and communications in a timely and professional manner</li>
            <li>Comply with all applicable labor and employment laws regarding internships</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content and Conduct</h2>
          <h3 className="text-xl font-medium mb-3">4.1 User Content</h3>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
          </p>
          <p>
            By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
          </p>

          <h3 className="text-xl font-medium mb-3">4.2 Prohibited Conduct</h3>
          <p>
            You agree not to use the Service:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation</li>
            <li>To impersonate or attempt to impersonate another user or person</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm InternMatch or users of the Service</li>
            <li>To harass, abuse, or harm another person</li>
            <li>For any obscene or immoral purpose</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of InternMatch and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of InternMatch.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            In no event shall InternMatch, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </p>
          <p>
            InternMatch does not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us:
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

export default TermsOfService; 