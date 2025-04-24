
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const SupportPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-card/80 rounded-lg border p-4 shadow-sm"
    >
      <div className="flex items-start">
        <HelpCircle className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium">Need help?</h4>
          <p className="text-sm text-muted-foreground mt-1">
            If you need assistance with your account or have any questions, please 
            contact us at <a href="mailto:judextine28@gmail.com" className="text-primary hover:underline">judextine28@gmail.com</a>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportPanel;
