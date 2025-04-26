
import { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { PageTransition } from '@/components/animations/PageTransition';
import { InstitutionData } from '@/types/institution';
import { format, addDays } from 'date-fns';

const InstitutionSubscription = () => {
  const { user } = useAuthStore();
  const [institutionData, setInstitutionData] = useState<InstitutionData>({
    id: '',
    name: '',
    domain: '',
    logo_url: null,
    is_premium: false,
    branding_colors: {
      primary: '#6C72CB',
      secondary: '#CB69C1'
    },
    created_at: '',
    updated_at: '',
    selar_co_id: null,
    subscription_expiry: null
  });
  const [loading, setLoading] = useState(true);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const [groveToken, setGroveToken] = useState('');
  const [processingToken, setProcessingToken] = useState(false);
  
  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!user?.institution_id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', user.institution_id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Parse branding colors from JSON if needed
          let brandingColors = {
            primary: '#6C72CB',
            secondary: '#CB69C1'
          };
          
          if (data.branding_colors) {
            if (typeof data.branding_colors === 'string') {
              try {
                brandingColors = JSON.parse(data.branding_colors);
              } catch (e) {
                console.error('Error parsing branding colors:', e);
              }
            } else if (typeof data.branding_colors === 'object') {
              brandingColors = data.branding_colors as any;
            }
          }
          
          const institutionWithTypedData: InstitutionData = {
            ...data,
            branding_colors: brandingColors,
            subscription_expiry: data.subscription_expiry || null
          };
          
          setInstitutionData(institutionWithTypedData);
        }
      } catch (error) {
        console.error('Error fetching institution data:', error);
        toast({
          title: 'Error',
          description: 'Could not load subscription data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutionData();
  }, [user?.institution_id]);
  
  const redeemGroveToken = async () => {
    if (!user?.institution_id) return;
    
    try {
      setProcessingToken(true);
      
      if (groveToken.trim().toUpperCase() !== 'THEGROVE') {
        throw new Error('Invalid token');
      }
      
      // Set the institution to premium
      const expiryDate = addDays(new Date(), 30); // 30-day subscription
      
      const { error } = await supabase
        .from('institutions')
        .update({
          is_premium: true,
          subscription_expiry: expiryDate.toISOString()
        })
        .eq('id', user.institution_id);
      
      if (error) throw error;
      
      // Update local state
      setInstitutionData({
        ...institutionData,
        is_premium: true,
        subscription_expiry: expiryDate.toISOString()
      });
      
      toast({
        title: 'Premium Activated',
        description: 'Your institution is now on the premium plan!'
      });
      
      setTokenDialogOpen(false);
    } catch (error: any) {
      console.error('Error redeeming token:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not redeem token. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessingToken(false);
    }
  };
  
  const getSubscriptionStatus = () => {
    if (!institutionData.is_premium) {
      return 'Free';
    }
    
    if (institutionData.subscription_expiry) {
      const expiryDate = new Date(institutionData.subscription_expiry);
      if (expiryDate > new Date()) {
        return 'Premium';
      }
    }
    
    return 'Expired';
  };
  
  const getRemainingDays = () => {
    if (!institutionData.subscription_expiry) return 0;
    
    const expiryDate = new Date(institutionData.subscription_expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Current Plan</span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    institutionData.is_premium ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getSubscriptionStatus()}
                  </span>
                </CardTitle>
                <CardDescription>
                  {institutionData.is_premium && institutionData.subscription_expiry ? (
                    <>Your subscription expires on {format(new Date(institutionData.subscription_expiry), 'PPP')}.</>
                  ) : (
                    <>You are currently on the Basic plan.</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {institutionData.is_premium && (
                    <div className="text-3xl font-bold">
                      {getRemainingDays()} days remaining
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    {institutionData.is_premium 
                      ? 'Manage your premium features and get the most out of MindGrove.' 
                      : 'Upgrade to Premium to unlock all features.'}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                {!institutionData.is_premium && (
                  <Button onClick={() => setTokenDialogOpen(true)} className="mr-2">
                    Upgrade Now
                  </Button>
                )}
                <Button variant="outline">View Usage</Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic</CardTitle>
                    <div className="text-3xl font-bold">Free</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Basic AI chat</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Up to 5 users</span>
                      </li>
                      <li className="flex items-start">
                        <XIcon className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">User management</span>
                      </li>
                      <li className="flex items-start">
                        <XIcon className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Advanced analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" disabled>Current Plan</Button>
                  </CardFooter>
                </Card>
                
                <Card className={`border-primary/50 ${institutionData.is_premium ? 'bg-primary/5' : ''}`}>
                  <CardHeader>
                    <CardTitle>Premium</CardTitle>
                    <div className="text-3xl font-bold">$49<span className="text-lg font-normal">/month</span></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Unlimited AI chat</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Unlimited users</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>User management</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>Advanced analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {institutionData.is_premium ? (
                      <Button variant="outline" disabled>Current Plan</Button>
                    ) : (
                      <Button onClick={() => setTokenDialogOpen(true)}>Upgrade</Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large institutions with custom needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Contact our sales team for a custom quote and tailored solutions.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
        
        <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade to Premium</DialogTitle>
              <DialogDescription>
                Choose how you'd like to activate your premium subscription.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-4">
                <h3 className="font-medium">Option 1: Redeem Grove Token</h3>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Enter your token"
                    value={groveToken}
                    onChange={(e) => setGroveToken(e.target.value)}
                  />
                  <Button onClick={redeemGroveToken} disabled={processingToken}>
                    {processingToken ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              </div>
              
              <div className="my-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Option 2: Pay Online</h3>
                <Button 
                  onClick={() => window.open('https://selar.com/o54g54', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setTokenDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionSubscription;
