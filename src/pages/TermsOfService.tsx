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
            <p className="font-semibold">Last Updated: April 27, 2025</p>
            
            <h2 className="mt-8 border-b pb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MindGrove ("Service"), you agree to these legally binding Terms. 
              If you're using MindGrove on behalf of an institution, you're binding them to these Terms.
            </p>
            
            <h2 className="mt-8 border-b pb-2">2. Our Services</h2>
            <p>
              MindGrove provides an AI-enhanced learning platform featuring:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Document analysis and summarization</li>
              <li>Automated flashcard generation</li>
              <li>Collaborative research tools</li>
              <li>Personalized learning analytics</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">3. Your Account</h2>
            <p>
              You must be at least 13 years old to use MindGrove. When creating an account:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate academic information (e.g., valid .edu email if applicable)</li>
              <li>Maintain account security—notify us immediately of unauthorized use</li>
              <li>You're responsible for all activity under your account</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">4. Your Content</h2>
            <p>
              You retain ownership of all documents, notes, and materials ("Content") you upload. By using MindGrove, you grant us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A license to process your Content to provide our services</li>
              <li>Permission to use anonymized data to improve our AI models</li>
            </ul>
            <p className="mt-4 font-medium">You confirm your Content:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doesn't violate copyright or other laws</li>
              <li>Doesn't contain sensitive personal data (SSNs, medical records, etc.)</li>
              <li>Complies with your institution's academic policies</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">5. Acceptable Use</h2>
            <p>While using MindGrove, you agree <span className="font-medium">not</span> to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use our AI to generate harmful or deceptive content</li>
              <li>Reverse engineer or exploit vulnerabilities</li>
              <li>Create multiple accounts to bypass restrictions</li>
              <li>Use bots or scrapers without written permission</li>
              <li>Share access credentials</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">6. Intellectual Property</h2>
            <p>
              MindGrove owns all rights to our platform, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Software and AI models</li>
              <li>User interface designs</li>
              <li>Analytics methodologies</li>
            </ul>
            <p className="mt-4">
              Third-party content (e.g., textbook excerpts) may have separate copyrights.
            </p>
            
            <h2 className="mt-8 border-b pb-2">7. Service Changes</h2>
            <p>
              We may modify or discontinue features with 30 days' notice. Paid subscribers will receive pro-rated refunds for significant reductions in service.
            </p>
            
            <h2 className="mt-8 border-b pb-2">8. Termination</h2>
            <p>
              We may suspend accounts for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Academic integrity violations</li>
              <li>Repeated copyright infringement</li>
              <li>Abusive behavior toward other users</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">9. Disclaimers</h2>
            <p className="font-medium">
              MindGrove doesn't guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perfect accuracy in AI-generated content</li>
              <li>Uninterrupted service availability</li>
              <li>Specific academic outcomes</li>
            </ul>
            <p className="mt-4">
              Always verify critical information with primary sources.
            </p>
            
            
            <h2 className="mt-8 border-b pb-2">10. Updates</h2>
            <p>
              We'll notify users of material changes via email, Discord or in-app alerts. Continued use after changes constitutes acceptance.
            </p>
            
            <h2 className="mt-8 border-b pb-2">Contact Us</h2>
            <p>
              Questions? Email <a href="mailto:support@mindgrove.ai" className="text-primary hover:underline">judextine28@gmail.com</a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsOfService;