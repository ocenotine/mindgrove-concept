
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface ContactFormProps {
  className?: string;
}

const ContactForm = ({ className = '' }: ContactFormProps) => {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: 'Form incomplete',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert feedback into the database
      const { error } = await supabase.from('feedback').insert({
        name,
        email,
        message,
        user_id: user ? user.id : null
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Redirect to separate service for email
      try {
        // Send email to the administrator
        await fetch('https://formsubmit.co/ajax/judextine28@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            message,
            _subject: 'New MindGrove Feedback'
          })
        });
      } catch (emailError) {
        console.log('Email sending failed but feedback was saved', emailError);
      }
      
      setSubmitted(true);
      setMessage('');
      
      toast({
        title: 'Feedback submitted!',
        description: 'Thanks for your feedback. We appreciate your input.',
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Could not submit your feedback',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className={`rounded-lg border bg-card p-6 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4">Send Feedback</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium mb-1 text-foreground"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Your name"
            required
            disabled={isSubmitting || submitted}
          />
        </div>
        
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium mb-1 text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Your email"
            required
            disabled={isSubmitting || submitted}
          />
        </div>
        
        <div>
          <label 
            htmlFor="message" 
            className="block text-sm font-medium mb-1 text-foreground"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
            placeholder="What would you like to tell us?"
            required
            disabled={isSubmitting || submitted}
          />
        </div>
        
        <motion.button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || submitted}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : submitted ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Sent! Thank you
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
