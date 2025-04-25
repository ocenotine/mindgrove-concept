
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LockIcon, ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscriptionTiers } from '@/services/subscriptionService';
import { useAuthStore } from '@/store/authStore';

interface FeaturePaywallProps {
  featureName: string;
  tierRequired: 'weekly' | 'monthly';
  children: React.ReactNode;
  buttonText?: string;
}

const FeaturePaywall = ({ featureName, tierRequired, children, buttonText = "Upgrade Now" }: FeaturePaywallProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  
  if (!user) return null;

  // Check if user has access to this feature
  const hasAccess = tierRequired === 'weekly' 
    ? user.subscriptionTier === 'weekly' || user.subscriptionTier === 'monthly'
    : user.subscriptionTier === 'monthly';
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  const tier = subscriptionTiers.find(t => t.id === tierRequired);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[1px] rounded-md flex items-center justify-center z-10">
            <div className="bg-primary/90 text-primary-foreground p-2 rounded-full">
              <LockIcon className="h-5 w-5" />
            </div>
          </div>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Premium Feature</DialogTitle>
          <DialogDescription>
            This feature requires a {tierRequired} subscription
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Feature: {featureName}</h3>
            <ul className="space-y-2 text-sm">
              {tier?.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium">Price:</span> {tier?.price.toLocaleString()} {tier?.currency}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Maybe Later
          </Button>
          <Button 
            className="flex items-center gap-1"
            onClick={() => {
              setOpen(false);
              navigate('/profile'); // Navigate to profile page with subscription tab
            }}
          >
            {buttonText} <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturePaywall;
