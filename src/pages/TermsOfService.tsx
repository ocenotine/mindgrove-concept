
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-6 bg-card/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-brand text-primary">MindGrove</Link>
          <Link 
            to="/login" 
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>Last Updated: 1st April, 2024</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account on MindGrove or otherwise accessing or using our services, 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to 
              these Terms, you may not access or use our services.
            </p>
            
            <h2>2. Description of Services</h2>
            <p>
              MindGrove is an AI-powered research assistant platform that helps users organize, 
              analyze, and learn from research documents. Our services include document analysis, 
              summary generation, flashcard creation, intelligent search and other related features.
            </p>
            
            <h2>3. Account Registration</h2>
            <p>
              To use our services, you must create an account. You agree to provide accurate, current, 
              and complete information during the registration process and to update such information 
              to keep it accurate, current, and complete. You are responsible for safeguarding your password 
              and for all activities that occur under your account.
            </p>
            
            <h2>4. User Content</h2>
            <p>
              Our services allow you to upload, submit, store, and share content, including documents, 
              notes, and other materials ("User Content"). You retain all rights to your User Content, 
              but you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide 
              license to use, copy, modify, create derivative works based on, distribute, publicly display, 
              and publicly perform your User Content in connection with operating and providing our services.
            </p>
            <p>
              You are solely responsible for your User Content and the consequences of sharing it. You 
              represent and warrant that:
            </p>
            <ul>
              <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
              <li>Your User Content does not violate the rights of any third party, including intellectual property rights and privacy rights</li>
              <li>Your User Content does not violate any applicable law or regulation</li>
            </ul>
            
            <h2>5. Prohibited Conduct</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Use our services for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Upload or share content that is harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
              <li>Interfere with or disrupt the services or servers or networks connected to the services</li>
              <li>Attempt to gain unauthorized access to any part of our services</li>
              <li>Use our services to harvest, collect, or store personal information about others</li>
              <li>Use our services for any commercial purpose without our prior written consent</li>
            </ul>
            
            <h2>6. Intellectual Property Rights</h2>
            <p>
              The services and their entire contents, features, and functionality (including but not limited to all 
              information, software, text, displays, images, video, and audio, and the design, selection, and 
              arrangement thereof) are owned by MindGrove, its licensors, or other providers of such material and 
              are protected by copyright, trademark, patent, trade secret, and other intellectual property or 
              proprietary rights laws.
            </p>
            
            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your access to all or part of the services, without notice, for conduct 
              that we determine is in violation of these Terms, or for any conduct that we determine, in our sole 
              discretion, is harmful to us, the services, another user, or a third party.
            </p>
            
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
              OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
              PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            
            <h2>9. Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL MINDGROVE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, 
              PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN ANY WAY CONNECTED WITH 
              THE USE OF THE SERVICES OR WITH THE DELAY OR INABILITY TO USE THE SERVICES.
            </p>
            
            <h2>10. Changes to Terms</h2>
            <p>
              We may modify these Terms from time to time. If we make material changes to these Terms, we will notify 
              you by email or through a notice on our home page. Your continued use of the services after such 
              notification constitutes your acceptance of the new Terms.
            </p>
            
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>
            
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <a href="mailto:judextine28@gmail.com">judextine28@gmail.com</a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsOfService;
