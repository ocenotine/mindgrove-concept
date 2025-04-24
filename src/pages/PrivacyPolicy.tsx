
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>Last Updated: 1st April, 2025</p>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to MindGrove ("we," "our," or "us"). We are committed to protecting your privacy 
              and ensuring you have a positive experience using our AI-powered research assistant platform.
              This Privacy Policy explains our practices regarding the collection, use, and disclosure 
              of your information through our services.
            </p>
            
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>
              <strong>Account Information:</strong> When you register for MindGrove, we collect your name, 
              email address, and password.
            </p>
            <p>
              <strong>Profile Information:</strong> You may choose to add additional information to your 
              profile such as a profile picture, bio, and other personal details.
            </p>
            <p>
              <strong>Content:</strong> We collect and process documents you upload, notes you create, 
              flashcards you generate, and any other content you create while using our services.
            </p>
            <p>
              <strong>Communications:</strong> If you contact us directly, we may receive additional 
              information about you, such as your name, email address, the contents of your message, 
              and any other information you choose to provide.
            </p>
            
            <h3>2.2 Information Collected Automatically</h3>
            <p>
              <strong>Usage Information:</strong> We collect information about your interactions with 
              our platform, including the features you use, the time spent on the platform, and the 
              actions you take.
            </p>
            <p>
              <strong>Device Information:</strong> We collect information about the device you use to 
              access our services, including the hardware model, operating system, unique device identifiers, 
              and mobile network information.
            </p>
            <p>
              <strong>Log Information:</strong> Our servers automatically record information when you use 
              our services, including your IP address, browser type, referring/exit pages, and timestamps.
            </p>
            
            <h2>3. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul>
              <li>To provide, maintain, and improve our services</li>
              <li>To process and analyze your documents and create summaries, flashcards, and other derived content</li>
              <li>To personalize your experience and deliver content relevant to your interests</li>
              <li>To communicate with you about our services, updates, and other information</li>
              <li>To detect, prevent, and address technical issues and security breaches</li>
              <li>To comply with legal obligations</li>
            </ul>
            
            <h2>4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations or protect our rights</li>
              <li>In connection with a merger, sale, or acquisition of all or a portion of our company</li>
              <li>With your consent or at your direction</li>
            </ul>
            
            <h2>5. Your Rights and Choices</h2>
            <p>
              You have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>Accessing, updating, or deleting your information</li>
              <li>Opting out of marketing communications</li>
              <li>Choosing whether to create an account</li>
              <li>Setting browser cookies preferences</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Us" section.
            </p>
            
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
            
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;
