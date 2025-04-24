
import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StreakCounter from '@/components/dashboard/StreakCounter';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { motion } from 'framer-motion';
import { Plus, Rocket, BookOpen, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/common/ContactForm';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { documents } = useDocuments();
  
  // Only show user's actual documents (not demo documents)
  const recentDocuments = user ? documents.filter(doc => doc.userId === user.id).slice(0, 3) : [];

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
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <DashboardHeader title="Dashboard" subtitle="Welcome back to MindGrove" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.3 }}
            className="col-span-2 bg-background/30 backdrop-blur-md rounded-2xl p-6 h-full border border-white/10 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Welcome, {user?.name}</h2>
            <p className="text-muted-foreground mb-6">
              Track your progress, manage your documents and create flashcards to enhance your learning.
            </p>
            
            <div className="flex items-center mb-4">
              <StreakCounter />
            </div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
            >
              <Link to="/document/upload">
                <motion.div 
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-background/40 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 h-full border border-white/10"
                >
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Upload Document</h3>
                  <p className="text-sm text-muted-foreground mt-1">Add new research papers</p>
                </motion.div>
              </Link>
              
              <Link to="/documents">
                <motion.div 
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-background/40 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 h-full border border-white/10"
                >
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">View Documents</h3>
                  <p className="text-sm text-muted-foreground mt-1">Browse your library</p>
                </motion.div>
              </Link>
              
              <Link to="/flashcards">
                <motion.div 
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-background/40 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 h-full border border-white/10"
                >
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Study Flashcards</h3>
                  <p className="text-sm text-muted-foreground mt-1">Review key concepts</p>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-background/30 backdrop-blur-md rounded-2xl h-full border border-white/10 shadow-lg"
          >
            <ContactForm className="h-full" />
          </motion.div>
        </div>
        
        {/* Recent documents */}
        <motion.div
          variants={item}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-background/30 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Link to="/documents" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
              View all
            </Link>
          </div>
          
          {recentDocuments.length === 0 ? (
            <div className="text-center py-10">
              <motion.div 
                className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <Rocket className="h-8 w-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Let's get started!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your first document to start organizing your research materials and creating flashcards.
              </p>
              <Link to="/document/upload">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                >
                  Upload Document
                </motion.button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentDocuments.map((document) => (
                <motion.div
                  key={document.id}
                  whileHover={{ y: -5 }}
                  className="transition-all duration-300"
                >
                  <DocumentCard document={document} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;
