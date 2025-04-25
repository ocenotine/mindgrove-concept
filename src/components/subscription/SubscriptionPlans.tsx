
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { subscriptionTiers, simulatePayment } from '@/services/subscriptionService';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const SubscriptionPlans = () => {
  const { user } = useAuthStore();
  const [processing, setProcessing] = useState<string | null>(null);
  
  if (!user) return null;
  
  const handleSubscribe = async (tierId: string) => {
    if (tierId === user.subscriptionTier) {
      toast({
        title: "Already subscribed",
        description: `You're already on the ${tierId} plan.`,
      });
      return;
    }
    
    try {
      setProcessing(tierId);

      // For demo purposes, we'll use simulated payments
      if (tierId === 'weekly' || tierId === 'monthly') {
        // In a real app, this would redirect to Selar
        toast({
          title: "Redirecting to payment",
          description: "In a real app, you would be redirected to Selar for payment.",
        });
        
        // Simulate a successful payment after 2 seconds
        setTimeout(async () => {
          await simulatePayment(tierId as 'weekly' | 'monthly');
          setProcessing(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast({
        title: "Subscription error",
        description: "There was an error processing your subscription.",
        variant: "destructive",
      });
      setProcessing(null);
    }
  };
  
  // Render a tier card
  const renderTierCard = (tier: typeof subscriptionTiers[0]) => {
    const isCurrentTier = user.subscriptionTier === tier.id;
    const isProcessing = processing === tier.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: tier.id === 'free' ? 0 : tier.id === 'weekly' ? 0.1 : 0.2 }}
        className="flex-1"
      >
        <Card className={`h-full ${isCurrentTier ? 'border-primary border-2' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {tier.id === 'free' && 'Free Plan'}
                {tier.id === 'weekly' && (
                  <span className="flex items-center gap-1">
                    <Zap className="h-5 w-5 text-blue-500" /> Weekly
                  </span>
                )}
                {tier.id === 'monthly' && (
                  <span className="flex items-center gap-1">
                    <Crown className="h-5 w-5 text-amber-500" /> Monthly
                  </span>
                )}
              </CardTitle>
              
              {isCurrentTier && (
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Current Plan
                </Badge>
              )}
            </div>
            
            <div className="flex items-end gap-1 mt-2">
              <span className="text-3xl font-bold">
                {tier.price === 0 ? 'Free' : `${tier.price.toLocaleString()}`}
              </span>
              {tier.price > 0 && (
                <span className="text-muted-foreground mb-1">{tier.currency}</span>
              )}
            </div>
            
            <CardDescription className="pt-2">
              {tier.id === 'weekly' && 'Affordable weekly access'}
              {tier.id === 'monthly' && 'Best value for serious students'}
              {tier.id === 'free' && 'Basic features to get started'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={isCurrentTier ? "outline" : "default"}
              disabled={isProcessing || (isCurrentTier && tier.id !== 'free')}
              onClick={() => handleSubscribe(tier.id)}
            >
              {isProcessing ? "Processing..." : 
               isCurrentTier ? "Current Plan" : 
               `Upgrade to ${tier.id === 'weekly' ? 'Weekly' : 'Monthly'}`}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that fits your research and learning needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTiers.map(renderTierCard)}
      </div>
      
      <div className="bg-muted/40 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Why Upgrade?</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Premium features unlock powerful AI tools to enhance your learning experience. 
          Upgrade today to access unlimited document uploads, AI-powered summaries, flashcards,
          and much more.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
