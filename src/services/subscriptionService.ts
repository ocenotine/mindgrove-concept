
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  aiQueries: number;
  maxDocuments: number;
  documentSize: number; // in MB
  durationDays: number;
  paymentLink: string;
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'UGX',
    features: [
      'Basic PDF uploads (3 docs/month)',
      'Limited AI queries (10/day)',
      'Basic document tools',
    ],
    aiQueries: 10,
    maxDocuments: 3,
    documentSize: 5,
    durationDays: 0,
    paymentLink: '',
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: 4000,
    currency: 'UGX',
    features: [
      'Unlimited document uploads',
      '50 AI queries per day',
      'Priority support',
      'Document summarization',
      'Flashcard generation'
    ],
    aiQueries: 50,
    maxDocuments: 999,
    documentSize: 20,
    durationDays: 7,
    paymentLink: 'https://selar.com/o54g54/weekly',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 10000,
    currency: 'UGX',
    features: [
      'Unlimited document uploads',
      'Unlimited AI queries',
      'Priority support',
      'Advanced document analytics',
      'Code artifact generation',
      'Bulk document processing',
      'Study session tracking',
      'Premium flashcard features'
    ],
    aiQueries: 999,
    maxDocuments: 999,
    documentSize: 50,
    durationDays: 30,
    paymentLink: 'https://selar.com/o54g54/monthly',
  }
];

// Function to get the user's current subscription tier
export const getUserSubscriptionTier = (): SubscriptionTier => {
  const { user } = useAuthStore.getState();
  
  if (!user) return subscriptionTiers[0]; // Default to free tier
  
  const tierIndex = subscriptionTiers.findIndex(tier => 
    tier.id === user.subscriptionTier
  );
  
  return tierIndex >= 0 ? subscriptionTiers[tierIndex] : subscriptionTiers[0];
};

// Function to check if a feature is available for the user's current subscription
export const canAccessFeature = (featureName: string): boolean => {
  const { user } = useAuthStore.getState();
  
  if (!user) return false;
  
  // Check if subscription has expired
  if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
    // Subscription has expired, downgrade to free tier
    downgradeExpiredSubscription();
    return featureIsAvailableForTier(featureName, 'free');
  }
  
  return featureIsAvailableForTier(featureName, user.subscriptionTier);
};

// Check if a specific feature is available for a given tier
const featureIsAvailableForTier = (featureName: string, tierId: string): boolean => {
  switch (featureName) {
    case 'documentUpload':
      return true; // All tiers can upload documents (with limits)
    
    case 'aiQueries':
      return true; // All tiers can use AI queries (with limits)
    
    case 'documentSummary':
      return tierId !== 'free'; // Available for weekly and monthly
    
    case 'flashcards':
      return tierId !== 'free'; // Available for weekly and monthly
    
    case 'codeGeneration':
      return tierId === 'monthly'; // Only available for monthly
    
    case 'bulkProcessing':
      return tierId === 'monthly'; // Only available for monthly
      
    case 'advancedAnalytics':
      return tierId === 'monthly'; // Only available for monthly
      
    default:
      return false;
  }
};

// Function to check if a user can upload more documents
export const canUploadMoreDocuments = async (): Promise<boolean> => {
  const { user } = useAuthStore.getState();
  
  if (!user) return false;
  
  const tier = getUserSubscriptionTier();
  
  // If unlimited documents (weekly or monthly tiers)
  if (tier.maxDocuments === 999) return true;
  
  // For free tier, check count of documents uploaded this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());
  
  if (error) {
    console.error('Error checking document count:', error);
    return false;
  }
  
  return (data?.length || 0) < tier.maxDocuments;
};

// Function to check if user has AI queries remaining today
export const hasRemainingAIQueries = async (): Promise<boolean> => {
  const { user } = useAuthStore.getState();
  
  if (!user) return false;
  
  const tier = getUserSubscriptionTier();
  
  // If unlimited queries (monthly tier)
  if (tier.aiQueries === 999) return true;
  
  // For free and weekly tiers, check count of AI queries made today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  // For testing, we'll just retrieve this from localStorage
  // In a real implementation, you'd track this in the database
  const queriesKey = `${user.id}_ai_queries_${startOfDay.toDateString()}`;
  const queriesUsed = parseInt(localStorage.getItem(queriesKey) || '0', 10);
  
  return queriesUsed < tier.aiQueries;
};

// Function to record an AI query usage
export const recordAIQueryUsage = (): void => {
  const { user } = useAuthStore.getState();
  
  if (!user) return;
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const queriesKey = `${user.id}_ai_queries_${startOfDay.toDateString()}`;
  const queriesUsed = parseInt(localStorage.getItem(queriesKey) || '0', 10);
  
  localStorage.setItem(queriesKey, (queriesUsed + 1).toString());
};

// Function to initialize subscription webhook (simulated)
export const initializeWebhook = (userId: string, subscriptionId: string): void => {
  console.log(`Webhook initialized for user ${userId} with subscription ${subscriptionId}`);
  // In a real implementation, this would register with a webhook service
};

// Function to handle downgrading an expired subscription
export const downgradeExpiredSubscription = async (): Promise<void> => {
  const { user, updateSubscription } = useAuthStore.getState();
  
  if (!user) return;
  
  try {
    await updateSubscription('free');
    
    toast({
      title: "Subscription expired",
      description: "Your subscription has expired and has been downgraded to the free tier.",
      variant: "destructive",
    });
  } catch (error) {
    console.error('Error downgrading subscription:', error);
  }
};

// Function to simulate handling a Selar webhook response (for demo purposes)
export const processPaymentWebhook = async (
  userId: string, 
  tier: 'free' | 'weekly' | 'monthly', 
  successful: boolean
): Promise<void> => {
  const { updateSubscription } = useAuthStore.getState();
  
  if (!successful) {
    toast({
      title: "Payment failed",
      description: "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
    return;
  }
  
  try {
    // Calculate expiry date based on tier
    const expiryDate = new Date();
    if (tier === 'weekly') {
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
    } else if (tier === 'monthly') {
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
    }
    
    // Update subscription
    await updateSubscription(tier, expiryDate.toISOString());
    
    // Log subscription event - using custom function that doesn't rely on subscription_events table
    logSubscriptionEvent(userId, 'upgrade', tier, expiryDate.toISOString());
    
    toast({
      title: "Subscription activated",
      description: `Your ${tier} subscription has been successfully activated.`,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    toast({
      title: "Activation error",
      description: "There was an error activating your subscription. Please contact support.",
      variant: "destructive",
    });
  }
};

// Helper function to log subscription events without using the subscription_events table
const logSubscriptionEvent = (userId: string, eventType: string, tier: string, expiryDate: string): void => {
  // Instead of using a DB table, we'll log to console and localStorage for demo
  console.log(`Subscription event: ${userId} - ${eventType} - ${tier} - ${expiryDate}`);
  
  // Save event to localStorage for demo purposes
  const events = JSON.parse(localStorage.getItem('subscription_events') || '[]');
  events.push({
    user_id: userId,
    event_type: eventType,
    tier,
    expiry_date: expiryDate,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('subscription_events', JSON.stringify(events));
};

// For development purposes only: simulate a payment and upgrade
export const simulatePayment = async (tier: 'weekly' | 'monthly'): Promise<void> => {
  const { user } = useAuthStore.getState();
  
  if (!user) return;
  
  await processPaymentWebhook(user.id, tier, true);
};
