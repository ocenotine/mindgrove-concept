
import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StreakCounter from '@/components/dashboard/StreakCounter';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentCard from '@/components/dashboard/DocumentCard';
import { motion } from 'framer-motion';
import { Plus, Rocket, BookOpen, BrainCircuit, ChartLine, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/common/ContactForm';
import LeaderboardCard from '@/components/dashboard/LeaderboardCard';
import QuoteWidget from '@/components/dashboard/QuoteWidget';
import { adaptStoreDocumentsToMockDocuments } from '@/utils/documentAdapter';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { documents, refreshDocuments } = useDocuments();
  
  useEffect(() => {
    // Refresh documents when page loads to get real-time data
    refreshDocuments();
  }, [refreshDocuments]);
  
  // Only show user's actual documents (filter by user_id)
  const recentDocuments = user && documents.length > 0 
    ? adaptStoreDocumentsToMockDocuments(documents.filter(doc => doc.user_id === user.id)).slice(0, 3)
    : [];

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
        <div className="flex justify-between items-start">
          <DashboardHeader title="Dashboard" subtitle="Welcome back to MindGrove" />
          <QuoteWidget />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.3 }}
            className="md:col-span-2 bg-background/30 backdrop-blur-md rounded-2xl p-6 h-full border border-white/10 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Welcome, {user?.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Last login: Today, 10:30 AM</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg mb-1">Your Progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Keep up the momentum with your research and study goals
                  </p>
                </div>
                <div className="flex items-center">
                  <ChartLine className="h-6 w-6 text-primary mr-2" />
                  <StreakCounter />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="bg-background/60 rounded-lg p-3 border border-white/5 shadow-sm">
                  <h4 className="font-medium text-sm text-muted-foreground">Documents</h4>
                  <p className="text-2xl font-bold">{documents.length || 0}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 border border-white/5 shadow-sm">
                  <h4 className="font-medium text-sm text-muted-foreground">Flashcards</h4>
                  <p className="text-2xl font-bold">{user?.flashcard_count || 0}</p>
                </div>
                <div className="bg-background/60 rounded-lg p-3 border border-white/5 shadow-sm">
                  <h4 className="font-medium text-sm text-muted-foreground">Study Streak</h4>
                  <p className="text-2xl font-bold">{user?.streak_count || 0} days</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <Link to="/document/upload">
                <motion.div 
                  variants={item}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-background/40 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 h-full border border-white/10 hover:border-primary/20 hover:shadow-md hover:bg-background/50"
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
                  className="bg-background/40 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 h-full border border-white/10 hover:border-primary/20 hover:shadow-md hover:bg-background/50"
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
                  className="bg-background/40 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 h-full border border-white/10 hover:border-primary/20 hover:shadow-md hover:bg-background/50"
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
            {user?.account_type === 'student' ? (
              <LeaderboardCard />
            ) : (
              <ContactForm className="h-full" />
            )}
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
