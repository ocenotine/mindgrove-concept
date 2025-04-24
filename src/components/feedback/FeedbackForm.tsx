
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

const FeedbackForm = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save feedback to Supabase
      const { error } = await supabase
        .from('feedback')
        .insert([
          { 
            name, 
            email, 
            message,
            user_id: user?.id
          }
        ]);
        
      if (error) throw error;
      
      setIsSubmitted(true);
      
      // Clear form after successful submission
      setMessage('');
      
      // Show success notification
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback! We\'ll get back to you soon.',
      });
      
      // Reset submitted state after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your feedback. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-2">We value your feedback</h3>
      <p className="text-muted-foreground mb-6">
        Let us know how we can improve MindGrove to better serve your research needs.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-foreground">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground dark:text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="John Doe"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground dark:text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-foreground">
            Your Feedback
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground dark:text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px]"
            placeholder="Share your thoughts with us..."
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex justify-end">
          <motion.button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || isSubmitted}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : isSubmitted ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submitted
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </motion.button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Your feedback will be sent to judextine28@gmail.com. We appreciate your input!
        </p>
      </form>
    </div>
  );
};

export default FeedbackForm;
