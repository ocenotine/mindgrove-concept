
import { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Check, AlertCircle, CreditCard, Gift, Calendar, Users, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InstitutionSubscription = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [institutionId, setInstitutionId] = useState<string>('');
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Get institution ID
        const instId = user.user_metadata?.institution_id || user.institution_id;
        
        if (!instId) {
          toast({
            title: "No institution found",
            description: "Your account is not associated with any institution.",
            variant: "destructive"
          });
          return;
        }
        
        setInstitutionId(instId);
        
        // Get institution data
        const { data: institutionData, error: institutionError } = await supabase
          .from('institutions')
          .select('is_premium, subscription_expiry')
          .eq('id', instId)
          .single();
        
        if (institutionError) throw institutionError;
        
        setIsPremium(institutionData.is_premium);
        
        // Get subscription data if available
        if (institutionData.is_premium) {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('institution_id', instId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (!subscriptionError) {
            setSubscriptionData(subscriptionData);
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscriptionData();
  }, [user]);

  const handleRedeemCode = async () => {
    if (!redeemCode || !institutionId) return;
    
    setIsRedeeming(true);
    
    try {
      // Check if code is valid
      if (redeemCode.toUpperCase() !== 'THEGROVE') {
        toast({
          title: 'Invalid redemption code',
          description: 'Please check your code and try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // Calculate expiry date (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Update institution to premium
      const { error: updateError } = await supabase
        .from('institutions')
        .update({
          is_premium: true,
          subscription_expiry: expiryDate.toISOString(),
        })
        .eq('id', institutionId);
        
      if (updateError) throw updateError;
      
      // Create subscription record
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          institution_id: institutionId,
          plan_type: 'premium',
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString(),
          selar_co_order_id: `REDEEM-${Date.now()}`
        });
        
      if (subscriptionError) throw subscriptionError;
      
      setIsPremium(true);
      toast({
        title: 'Redemption Successful',
        description: 'Your account has been upgraded to Premium!',
        variant: 'default',
      });
      
      // Reload page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast({
        title: 'Redemption failed',
        description: 'An error occurred while activating your subscription.',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <InstitutionLayout>
        <div className="flex justify-center items-center h-full py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your institution subscription plan and billing information
          </p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8 border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">
                  {isPremium ? 'Premium Plan' : 'Basic Plan'}
                </h3>
                {isPremium ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Your subscription {subscriptionData?.expires_at ? `expires on ${new Date(subscriptionData.expires_at).toLocaleDateString()}` : 'is active'}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Limited features available. Upgrade for full access.
                  </p>
                )}
              </div>
              {!isPremium && (
                <Button>
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="plans">
          <TabsList className="mb-6">
            <TabsTrigger value="plans">Plan Options</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Code</TabsTrigger>
            {isPremium && (
              <TabsTrigger value="billing">Billing</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Plan */}
              <Card className={`border ${!isPremium ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>Basic Plan</CardTitle>
                  <CardDescription>Free tier for small institutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Up to 10 users</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Basic document management</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Limited AI features</span>
                    </li>
                    <li className="flex items-center opacity-50">
                      <Lock className="h-4 w-4 mr-2" />
                      <span>User management</span>
                    </li>
                    <li className="flex items-center opacity-50">
                      <Lock className="h-4 w-4 mr-2" />
                      <span>Advanced analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled={!isPremium}>
                    {!isPremium ? 'Current Plan' : 'Downgrade'}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className={`border ${isPremium ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>Premium Plan</CardTitle>
                  <CardDescription>Full-featured for growing institutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Unlimited users</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Advanced document management</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Full AI features</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>User management</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>Advanced analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={isPremium}>
                    {isPremium ? 'Current Plan' : 'Upgrade Now'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="redeem">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Redeem Promotional Code
                </CardTitle>
                <CardDescription>
                  Have a promotional code? Redeem it here to upgrade your plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="promo-code">Promotional Code</Label>
                    <Input
                      id="promo-code"
                      placeholder="Enter your code"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                    />
                  </div>
                  <div className="self-end">
                    <Button 
                      onClick={handleRedeemCode} 
                      disabled={!redeemCode || isRedeeming || isPremium}
                    >
                      {isRedeeming ? 'Redeeming...' : 'Redeem'}
                    </Button>
                  </div>
                </div>
                
                {isPremium && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Already on Premium Plan</AlertTitle>
                    <AlertDescription>
                      Your institution is already subscribed to the Premium plan.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {isPremium && (
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    View and manage your billing details and history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Subscription Details</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Plan:</span>
                            <span>Premium Plan</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-green-500 font-medium">Active</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Renewal Date:</span>
                            <span>{subscriptionData?.expires_at ? new Date(subscriptionData.expires_at).toLocaleDateString() : 'N/A'}</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <span>Promotional Code</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Features Included</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-primary" />
                            <span>Annual billing cycle</span>
                          </li>
                          <li className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            <span>Unlimited users</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            <span>User management system</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => window.print()}>
                    Print Receipt
                  </Button>
                  <Button variant="outline">
                    Cancel Subscription
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionSubscription;
