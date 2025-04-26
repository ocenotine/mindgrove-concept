
import React, { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Check, ExternalLink, BadgeDollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

interface InstitutionData {
  id: string;
  name: string;
  is_premium: boolean | null;
  subscription_expiry?: string | null;
}

const InstitutionSubscription = () => {
  const { user } = useAuthStore();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'basic'|'premium'>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!user || user.user_metadata?.account_type !== 'institution') {
        return;
      }

      setIsLoading(true);
      try {
        const institutionId = user.user_metadata?.institution_id || user.institution_id;
        
        if (institutionId) {
          // Fetch the institution data
          const { data: institution, error } = await supabase
            .from('institutions')
            .select('id, name, is_premium, subscription_expiry')
            .eq('id', institutionId)
            .single();

          if (error) throw error;
          setInstitutionData(institution);
        }
      } catch (error) {
        console.error('Error fetching institution:', error);
        setInstitutionData({
          id: 'temp-id',
          name: user.user_metadata?.institution_name || 'My Institution',
          is_premium: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, [user]);

  const handlePlanSelect = (plan: 'basic'|'premium') => {
    setSelectedPlan(plan);
  };

  const handleVerifyToken = async () => {
    setIsVerifying(true);
    
    try {
      // Check if the token is the valid Grove token
      if (couponCode.toUpperCase() === 'THEGROVE') {
        // Update institution to premium
        if (institutionData?.id) {
          const today = new Date();
          const expiryDate = new Date();
          expiryDate.setMonth(today.getMonth() + 1); // Set expiry to 1 month from now
          
          const { error } = await supabase
            .from('institutions')
            .update({ 
              is_premium: true,
              subscription_expiry: expiryDate.toISOString()
            })
            .eq('id', institutionData.id);
          
          if (error) throw error;
          
          // Update local state
          setInstitutionData({
            ...institutionData,
            is_premium: true,
            subscription_expiry: expiryDate.toISOString()
          });
          
          toast({
            title: 'Premium Activated!',
            description: 'Your institution has been upgraded to Premium.',
          });
          
          setTokenDialogOpen(false);
        }
      } else {
        toast({
          title: 'Invalid Token',
          description: 'The token you entered is not valid.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate premium subscription.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePaymentRedirect = () => {
    window.open('https://selar.com/o54g54', '_blank');
    toast({
      title: 'Payment Redirect',
      description: 'You are being redirected to the payment page.',
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="container pb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Subscription</h1>
            <p className="text-gray-400 mt-1">
              Manage your institution's subscription plan
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading subscription details...</p>
            </div>
          ) : (
            <>
              {/* Current Plan */}
              <Card className="bg-[#191C27] border-gray-800 mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BadgeDollarSign className="mr-2 h-5 w-5 text-primary" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Your institution's active subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {institutionData?.is_premium ? 'Premium Plan' : 'Basic Plan'}
                      </h3>
                      {institutionData?.is_premium && institutionData?.subscription_expiry && (
                        <p className="text-sm text-gray-400">
                          Expires: {formatDate(institutionData.subscription_expiry)}
                        </p>
                      )}
                    </div>
                    <Badge variant={institutionData?.is_premium ? 'default' : 'secondary'}>
                      {institutionData?.is_premium ? 'Active' : 'Free Tier'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Basic Plan */}
                <Card className={`bg-[#191C27] border-gray-800 ${!institutionData?.is_premium && 'ring-2 ring-primary'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Basic Plan</CardTitle>
                        <CardDescription className="text-gray-400">For small institutions</CardDescription>
                      </div>
                      {!institutionData?.is_premium && (
                        <Badge variant="outline" className="bg-primary/20 text-primary">Current Plan</Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-white">Free</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Up to 150 user accounts</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">500 monthly document processing</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">200 AI chat queries per month</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Basic analytics</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled={!institutionData?.is_premium}
                      onClick={() => handlePlanSelect('basic')}
                    >
                      {institutionData?.is_premium ? 'Downgrade to Basic' : 'Current Plan'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Premium Plan */}
                <Card className={`bg-[#191C27] border-gray-800 ${institutionData?.is_premium && 'ring-2 ring-primary'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Premium Plan</CardTitle>
                        <CardDescription className="text-gray-400">For established institutions</CardDescription>
                      </div>
                      {institutionData?.is_premium && (
                        <Badge variant="outline" className="bg-primary/20 text-primary">Current Plan</Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-white">UGX 100,000</span>
                      <span className="text-gray-400 ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Unlimited user accounts</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Unlimited document processing</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Unlimited AI chat queries</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Advanced analytics and reporting</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">User management features</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-300">Research collaboration tools</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {institutionData?.is_premium ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => setTokenDialogOpen(true)}
                      >
                        Upgrade to Premium
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>

              {/* Dialog for token verification */}
              <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
                <DialogContent className="bg-[#191C27] text-white">
                  <DialogHeader>
                    <DialogTitle>Upgrade to Premium</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Choose your preferred payment method
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="token">
                    <TabsList className="bg-[#131620]">
                      <TabsTrigger value="token">Grove Token</TabsTrigger>
                      <TabsTrigger value="payment">Payment</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="token" className="mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="token" className="text-gray-200">Enter Grove Token</Label>
                          <Input
                            id="token"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter token code"
                            className="bg-[#131620] border-gray-700 text-white"
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          Enter your Grove Token to activate Premium features instantly.
                          Default token is "THEGROVE".
                        </p>
                      </div>
                      <DialogFooter className="mt-4">
                        <Button onClick={handleVerifyToken} disabled={isVerifying} className="w-full">
                          {isVerifying ? 'Verifying...' : 'Activate Premium'}
                        </Button>
                      </DialogFooter>
                    </TabsContent>
                    
                    <TabsContent value="payment" className="mt-4">
                      <div className="space-y-4">
                        <p className="text-gray-300">
                          You will be redirected to our payment processor to complete your subscription.
                        </p>
                        <div className="p-3 bg-[#131620] rounded border border-gray-700">
                          <p className="text-sm text-gray-400">
                            Monthly subscription: UGX 100,000/month
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Cancel anytime
                          </p>
                        </div>
                      </div>
                      <DialogFooter className="mt-4">
                        <Button onClick={handlePaymentRedirect} className="w-full">
                          Proceed to Payment <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </DialogFooter>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionSubscription;
