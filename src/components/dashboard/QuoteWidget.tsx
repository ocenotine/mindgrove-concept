
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Save, RefreshCcw, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';

// Quotes database - in a production app, this would be stored in Supabase
const quotes = [
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    category: "perseverance"
  },
  {
    text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X",
    category: "education"
  },
  {
    text: "The beautiful thing about learning is that nobody can take it away from you.",
    author: "B.B. King",
    category: "learning"
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: "perseverance"
  },
  {
    text: "You've prepared for this! Trust your abilities and stay focused.",
    author: "Anonymous",
    category: "confidence"
  },
  {
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss",
    category: "learning"
  },
  {
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
    category: "learning"
  },
  {
    text: "The only person who is educated is the one who has learned how to learn and change.",
    author: "Carl Rogers",
    category: "education"
  }
];

export default function QuoteWidget() {
  const [quote, setQuote] = useState<typeof quotes[0] | null>(null);
  const [saved, setSaved] = useState(false);
  const { user } = useAuthStore();
  
  // Get a new quote that hasn't been shown in the last 30 days
  const getNewQuote = () => {
    // In a real app, we would check localStorage for recently shown quotes
    const recentQuotes = JSON.parse(localStorage.getItem('recentQuotes') || '[]');
    
    // Filter out recently shown quotes
    const availableQuotes = quotes.filter(q => !recentQuotes.includes(q.text));
    
    // If all quotes have been shown, reset the list
    const quotePool = availableQuotes.length > 0 ? availableQuotes : quotes;
    
    // Select random quote based on user context (simplified version)
    let contextQuotes = quotePool;
    if (user?.document_count && user.document_count < 2) {
      contextQuotes = quotePool.filter(q => q.category === "perseverance" || q.category === "learning");
    }
    
    const randomIndex = Math.floor(Math.random() * contextQuotes.length);
    const selectedQuote = contextQuotes[randomIndex] || quotePool[0];
    
    // Save to recently shown quotes
    const updatedRecentQuotes = [...recentQuotes, selectedQuote.text].slice(-30); // Keep last 30
    localStorage.setItem('recentQuotes', JSON.stringify(updatedRecentQuotes));
    
    setQuote(selectedQuote);
    setSaved(false);
  };
  
  // Save quote to favorites
  const saveQuote = () => {
    if (!quote) return;
    
    // In a real app, save to user's profile in database
    const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes') || '[]');
    if (!savedQuotes.some(q => q.text === quote.text)) {
      localStorage.setItem('savedQuotes', JSON.stringify([...savedQuotes, quote]));
      setSaved(true);
      toast({
        title: "Quote saved",
        description: "Added to your favorites",
      });
    } else {
      toast({
        title: "Already saved",
        description: "This quote is already in your favorites",
      });
    }
  };
  
  // Share quote
  const shareQuote = () => {
    if (!quote) return;
    
    // In a real app, this would share to user's study group
    toast({
      title: "Quote shared",
      description: "Shared with your study group",
    });
  };
  
  useEffect(() => {
    // Check if it's between 6AM and 9PM
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 21) {
      // Check if we need a new quote for today
      const lastQuoteDate = localStorage.getItem('lastQuoteDate');
      const today = new Date().toDateString();
      
      if (lastQuoteDate !== today) {
        localStorage.setItem('lastQuoteDate', today);
        getNewQuote();
      } else {
        // Get the currently saved daily quote if available
        const dailyQuote = localStorage.getItem('dailyQuote');
        if (dailyQuote) {
          setQuote(JSON.parse(dailyQuote));
        } else {
          getNewQuote();
        }
      }
    }
  }, []);
  
  // Save daily quote to localStorage when it changes
  useEffect(() => {
    if (quote) {
      localStorage.setItem('dailyQuote', JSON.stringify(quote));
    }
  }, [quote]);
  
  if (!quote) return null;
  
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10 w-full max-w-[300px]">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Daily Inspiration</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={getNewQuote} className="h-6 w-6">
              <RefreshCcw className="h-3 w-3" />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={saveQuote} 
              className={`h-6 w-6 ${saved ? 'text-primary' : ''}`}
            >
              <Save className="h-3 w-3" />
              <span className="sr-only">Save</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={shareQuote} className="h-6 w-6">
              <Share className="h-3 w-3" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </div>
        
        <p className="text-base font-medium leading-tight">"{quote.text}"</p>
        <p className="text-xs text-right text-muted-foreground">— {quote.author}</p>
      </CardContent>
    </Card>
  );
}
