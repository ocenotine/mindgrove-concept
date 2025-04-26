
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition } from '@/components/animations/PageTransition';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BrandingColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface InstitutionData {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  is_premium: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  selar_co_id: string | null;
  branding_colors?: BrandingColors;
}

const InstitutionDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    primary_color: '#6C72CB',
    secondary_color: '#CB69C1',
    accent_color: '#FEAC5E',
  });

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!user || user.user_metadata?.account_type !== 'institution') {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to view this page.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      try {
        // If user.institution_id is not available, try to find the institution by user id
        const institutionId = user.user_metadata?.institution_id;
        
        if (!institutionId) {
          toast({
            title: 'Institution ID Missing',
            description: 'Unable to find your institution information.',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }
        
        // Fetch the institution data
        const { data: institution, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', institutionId)
          .single();

        if (error) throw error;

        // Initialize with default branding colors if not present
        const brandingColors = institution.branding_colors as BrandingColors || {
          primary: '#6C72CB',
          secondary: '#CB69C1',
          accent: '#FEAC5E',
        };

        const institutionWithBranding: InstitutionData = {
          ...institution,
          branding_colors: brandingColors
        };

        setInstitutionData(institutionWithBranding);
        setFormData({
          name: institutionWithBranding.name,
          domain: institutionWithBranding.domain,
          logo_url: institutionWithBranding.logo_url || '',
          primary_color: brandingColors.primary || '#6C72CB',
          secondary_color: brandingColors.secondary || '#CB69C1',
          accent_color: brandingColors.accent || '#FEAC5E',
        });
      } catch (error) {
        console.error('Error fetching institution:', error);
        toast({
          title: 'Error',
          description: 'Failed to load institution data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, [user, navigate]);

  const handleSaveChanges = async () => {
    if (!institutionData) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          name: formData.name,
          domain: formData.domain,
          logo_url: formData.logo_url,
          // Store branding colors as an object
          branding_colors: {
            primary: formData.primary_color,
            secondary: formData.secondary_color,
            accent: formData.accent_color,
          }
        })
        .eq('id', institutionData.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Institution settings saved successfully.',
      });
      
      // Update local state
      setInstitutionData({
        ...institutionData,
        name: formData.name,
        domain: formData.domain,
        logo_url: formData.logo_url,
        branding_colors: {
          primary: formData.primary_color,
          secondary: formData.secondary_color,
          accent: formData.accent_color,
        }
      });
      
    } catch (error) {
      console.error('Error updating institution:', error);
      toast({
        title: 'Error',
        description: 'Failed to save institution settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto py-10">
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="settings">
              {isLoading ? (
                <div className="text-center">Loading...</div>
              ) : institutionData ? (
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <h3 className="font-bold text-lg mb-4">General Settings</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Institution Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                          id="domain"
                          type="url"
                          value={formData.domain}
                          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input
                          id="logo"
                          type="url"
                          value={formData.logo_url}
                          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <h3 className="font-bold text-lg mb-4">Branding</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="primary_color">Primary Color</Label>
                        <Input
                          type="color"
                          id="primary_color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="secondary_color">Secondary Color</Label>
                        <Input
                          type="color"
                          id="secondary_color"
                          value={formData.secondary_color}
                          onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="accent_color">Accent Color</Label>
                        <Input
                          type="color"
                          id="accent_color"
                          value={formData.accent_color}
                          onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  Failed to load institution data.
                </div>
              )}
            </TabsContent>
            <TabsContent value="subscription">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <h3 className="font-bold text-lg mb-4">Subscription Details</h3>
                {institutionData?.is_premium ? (
                  <>
                    <Badge variant="outline">Premium</Badge>
                    <p>You are currently on the premium plan.</p>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary">Basic</Badge>
                    <p>You are currently on the basic plan.</p>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="users">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <h3 className="font-bold text-lg mb-4">User Management</h3>
                <p>Coming Soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default InstitutionDashboard;
