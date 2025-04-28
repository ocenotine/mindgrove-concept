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
            <p className="font-semibold">Last Updated: June 10, 2024</p>
            
            <div className="my-6 p-4 bg-card rounded-lg border">
              <p className="font-medium">TL;DR:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We only collect what's necessary to provide our services</li>
                <li>Your documents are processed but never sold</li>
                <li>You control your data through account settings</li>
              </ul>
            </div>
            
            <h2 className="mt-8 border-b pb-2">1. What We Collect</h2>
            <h3 className="mt-4 text-lg font-medium">A. Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account basics:</strong> Name, email, password (hashed)</li>
              <li><strong>Academic profile:</strong> Institution, field of study (optional)</li>
              <li><strong>Your content:</strong> Uploaded documents, notes, flashcards</li>
            </ul>
            
            <h3 className="mt-6 text-lg font-medium">B. Automatic Collection</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage data:</strong> Features used, session duration</li>
              <li><strong>Device info:</strong> OS, browser type (for compatibility)</li>
              <li><strong>Cookies:</strong> Essential (login) and analytics (improvement)</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">2. How We Use Data</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Core Services</h3>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Process documents for summaries/flashcards</li>
                  <li>Personalize your learning dashboard</li>
                  <li>Secure account access</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Improvements</h3>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Fix bugs and optimize performance</li>
                  <li>Develop new features</li>
                </ul>
              </div>
            </div>
            
            
            <h2 className="mt-8 border-b pb-2">3. Your Rights</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium">Access & Control</h3>
                <p>Through your account settings, you can:</p>
                <ul className="list-disc pl-6 space-y-1 mt-1">
                  <li>Download all your data</li>
                  <li>Delete specific documents</li>
                  <li>Disable analytics tracking</li>
                </ul>
              </div>
            </div>
            
            <h2 className="mt-8 border-b pb-2">4. Security Measures</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end encryption for document processing</li>
              <li>Regular third-party security audits</li>
              <li>Breach notification within 72 hours of discovery</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">5. Policy Updates</h2>
            <p>We'll notify you 30 days before material changes via:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Email (for account holders)</li>
              <li>In-app banner notifications</li>
            </ul>
            
            <h2 className="mt-8 border-b pb-2">Contact Us</h2>
            <p>
              Reach out:<br />
              <a href="mailto:judextine28@gmail.com" className="text-primary hover:underline">judextine28@gmail.com</a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;