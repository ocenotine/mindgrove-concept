
import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, this would call an API endpoint
    // For now, we'll simulate sending an email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    setIsSubmitting(false);
    
    // Show success message
    toast({
      title: "Message Sent!",
      description: "Thank you for your feedback. We'll get back to you soon.",
    });
    
    // Play notification sound
    const audio = new Audio('/sounds/notification.mp3');
    audio.play();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Send Us Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.form 
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              placeholder="Your feedback or questions"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Your message will be sent to the MindGrove team for review.
          </p>
        </motion.form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
