
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const InstitutionBanner: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubscribeClick = () => {
    if (!isAuthenticated) {
      // If not logged in, redirect to login with a return URL
      toast({
        title: "Login Required",
        description: "You need to sign in as an institution to subscribe",
        variant: "default",
      });
      navigate('/login', { state: { returnUrl: '/institution/dashboard', requiredAccountType: 'admin' } });
      return;
    }
    
    if (user?.account_type !== 'admin') {
      // If logged in but not an institution account
      toast({
        title: "Institutional Account Required",
        description: "Only institutional accounts can subscribe to premium features",
        variant: "destructive",
      });
      return;
    }
    
    // If already logged in as institution, proceed to payment
    window.open('https://selar.com/o54g54', '_blank');
  };
  
  const handleLearnMore = () => {
    if (!isAuthenticated) {
      navigate('/signup');
    } else {
      navigate(user?.account_type === 'admin' ? '/institution/dashboard' : '/signup');
    }
  };
  
  return (
    <motion.div 
      className="relative overflow-hidden rounded-2xl shadow-lg border bg-gradient-to-r from-blue-900 to-indigo-900 text-white mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8))]" />
      
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center">
        <div className="mb-6 md:mb-0 md:mr-8 flex-1">
          <div className="bg-white/10 p-3 rounded-full inline-flex mb-4">
            <Building2 className="h-6 w-6 text-blue-200" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Upgrade Your University's Research
          </h2>
          
          <p className="text-blue-100 mb-6 max-w-md">
            Get advanced analytics, private research portals, custom branding, and comprehensive reporting tools for your institution.
          </p>
          
          <div className="space-x-4">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              onClick={handleSubscribeClick}
            >
              Subscribe Now (UGX 100,000/month)
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="relative hidden md:block w-64 h-64 flex-shrink-0">
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              rotateZ: [0, 10, 0, -10, 0],
            }}
            transition={{ 
              duration: 10,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <div className="h-full w-full relative">
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg shadow-lg transform -rotate-6" />
              <div className="absolute top-10 left-4 right-4 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg transform rotate-3" />
              <div className="absolute top-20 left-8 right-8 h-40 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg shadow-lg transform -rotate-3" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center shadow-xl">
                  <Building2 className="h-10 w-10 text-indigo-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InstitutionBanner;
