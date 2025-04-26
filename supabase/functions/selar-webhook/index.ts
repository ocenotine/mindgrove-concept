
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SelarWebhookPayload {
  event: string;
  data: {
    order_id: string;
    product_id: string;
    customer_email: string;
    customer_name: string;
    product_name: string;
    price: number;
    currency: string;
    paid_at: string;
    expires_at?: string;
  };
}

// Get Supabase connection from environment
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client with service role key (admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse webhook payload
    const payload: SelarWebhookPayload = await req.json();
    console.log('Received webhook:', JSON.stringify(payload));
    
    // Validate webhook payload
    if (!payload.event || !payload.data) {
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle different event types
    switch (payload.event) {
      case 'order.successful':
        // Process successful payment
        await handleSuccessfulPayment(supabase, payload.data);
        break;
        
      case 'subscription.renewed':
        // Process subscription renewal
        await handleSubscriptionRenewal(supabase, payload.data);
        break;
        
      case 'subscription.expired':
        // Process subscription expiration
        await handleSubscriptionExpiration(supabase, payload.data);
        break;
        
      default:
        console.log(`Unhandled event type: ${payload.event}`);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleSuccessfulPayment(supabase, orderData) {
  try {
    // First, find the institution by email
    const { data: institutionUsers, error: userError } = await supabase
      .from('profiles')
      .select('id, institution_id')
      .eq('email', orderData.customer_email)
      .eq('account_type', 'institution')
      .single();
    
    if (userError || !institutionUsers) {
      console.error('Error finding institution user:', userError);
      return;
    }
    
    // Get institution ID
    const institutionId = institutionUsers.institution_id;
    
    // Calculate expiry date - default to 30 days if not specified
    const expiresAt = orderData.expires_at 
      ? new Date(orderData.expires_at) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Update institution to premium status
    await supabase
      .from('institutions')
      .update({ 
        is_premium: true,
        selar_co_id: orderData.order_id 
      })
      .eq('id', institutionId);
    
    // Create or update subscription
    const { data: existingSub, error: subError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('institution_id', institutionId)
      .single();
    
    if (existingSub) {
      // Update existing subscription
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: orderData.product_name,
          expires_at: expiresAt.toISOString(),
          selar_co_order_id: orderData.order_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id);
    } else {
      // Create new subscription
      await supabase
        .from('subscriptions')
        .insert({
          institution_id: institutionId,
          plan_type: orderData.product_name,
          status: 'active',
          starts_at: new Date(orderData.paid_at).toISOString(),
          expires_at: expiresAt.toISOString(),
          selar_co_order_id: orderData.order_id
        });
    }
    
    console.log('Successfully processed payment for institution:', institutionId);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handleSubscriptionRenewal(supabase, renewalData) {
  try {
    // Find subscription by order ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id, institution_id')
      .eq('selar_co_order_id', renewalData.order_id)
      .single();
    
    if (error || !subscription) {
      console.error('Error finding subscription:', error);
      return;
    }
    
    // Calculate new expiry date
    const expiresAt = renewalData.expires_at 
      ? new Date(renewalData.expires_at) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Update subscription
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);
    
    // Ensure institution is still marked as premium
    await supabase
      .from('institutions')
      .update({ is_premium: true })
      .eq('id', subscription.institution_id);
    
    console.log('Successfully processed subscription renewal');
  } catch (error) {
    console.error('Error handling subscription renewal:', error);
    throw error;
  }
}

async function handleSubscriptionExpiration(supabase, expirationData) {
  try {
    // Find subscription by order ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id, institution_id')
      .eq('selar_co_order_id', expirationData.order_id)
      .single();
    
    if (error || !subscription) {
      console.error('Error finding subscription:', error);
      return;
    }
    
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);
    
    // Downgrade institution from premium status
    await supabase
      .from('institutions')
      .update({ is_premium: false })
      .eq('id', subscription.institution_id);
    
    console.log('Successfully processed subscription expiration');
  } catch (error) {
    console.error('Error handling subscription expiration:', error);
    throw error;
  }
}
