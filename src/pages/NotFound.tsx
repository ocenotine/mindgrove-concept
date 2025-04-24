
import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-brand text-primary">MindGrove</Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-primary">404</h1>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you are looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex justify-center">
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
