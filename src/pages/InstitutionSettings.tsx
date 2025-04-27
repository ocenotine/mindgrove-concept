import React, { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Save } from 'lucide-react';
import { InstitutionData } from '@/types/institution';

// Define the institution branding type
interface InstitutionBranding {
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

const InstitutionSettings = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [emailDomainRestriction, setEmailDomainRestriction] = useState(false);
  const [customBranding, setCustomBranding] = useState<InstitutionBranding>({
    logo: '',
    colors: {
      primary: '#0284c7',
      secondary: '#7f1d1d',
      accent: '#0f766e'
    }
  });
  
  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!user) return;
      
      try {
        const institutionId = user?.user_metadata?.institution_id || user?.institution_id;
        
        if (!institutionId) {
          toast({
            title: "Error",
            description: "No institution ID found for this user",
            variant: "destructive"
          });
          return;
        }
        
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', institutionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Convert the database data to our InstitutionData type
          const typedData: InstitutionData = {
            ...data,
            branding_colors: typeof data.branding_colors === 'string' 
              ? JSON.parse(data.branding_colors) 
              : data.branding_colors || { primary: '#0284c7', secondary: '#7f1d1d', accent: '#0f766e' }
          };
          
          setInstitutionData(typedData);
          setName(typedData.name || '');
          setDomain(typedData.domain || '');
          setEmailDomainRestriction(typedData.email_domain_restriction || false);
          
          // Set branding data
          let brandingData: InstitutionBranding = {
            logo: typedData.logo_url || '',
            colors: {
              primary: typedData.branding_colors?.primary || '#0284c7',
              secondary: typedData.branding_colors?.secondary || '#7f1d1d',
              accent: typedData.branding_colors?.accent || '#0f766e'
            }
          };
          
          setCustomBranding(brandingData);
        }
      } catch (error) {
        console.error("Error fetching institution data:", error);
        toast({
          title: "Error",
          description: "Failed to load institution settings",
          variant: "destructive"
        });
      }
    };
    
    fetchInstitutionData();
  }, [user, toast]);
  
  const handleSave = async () => {
    if (!user) return;
    
    const institutionId = user?.user_metadata?.institution_id || user?.institution_id;
    
    if (!institutionId) {
      toast({
        title: "Error",
        description: "No institution ID found for this user",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('institutions')
        .update({
          name,
          domain,
          email_domain_restriction: emailDomainRestriction,
          logo_url: customBranding.logo,
          branding_colors: customBranding.colors,
          updated_at: new Date().toISOString()
        })
        .eq('id', institutionId);
        
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your institution settings have been updated",
      });
    } catch (error) {
      console.error("Error saving institution settings:", error);
      toast({
        title: "Error",
        description: "Failed to save institution settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleColorChange = (colorKey: 'primary' | 'secondary' | 'accent', value: string) => {
    setCustomBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="container mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Institution Settings</h1>
          
          <Tabs defaultValue="general">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Institution Details</CardTitle>
                  <CardDescription>
                    Manage your institution's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution-name">Institution Name</Label>
                    <Input 
                      id="institution-name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter institution name" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="institution-domain">Institution Domain</Label>
                    <Input 
                      id="institution-domain" 
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.edu" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for identifying your institution and email verification
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage security and authentication options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-restriction">Email Domain Restriction</Label>
                      <p className="text-sm text-muted-foreground">
                        Only allow email addresses with your institution domain
                      </p>
                    </div>
                    <Switch
                      id="email-restriction"
                      checked={emailDomainRestriction}
                      onCheckedChange={setEmailDomainRestriction}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="branding" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>
                    Customize your institution's appearance in the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand-logo">Logo URL</Label>
                    <Input 
                      id="brand-logo" 
                      value={customBranding.logo || ''}
                      onChange={(e) => setCustomBranding({...customBranding, logo: e.target.value})}
                      placeholder="https://example.com/logo.png" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL for your institution's logo image
                    </p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Label>Brand Colors</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: customBranding.colors?.primary }}
                          ></div>
                          <Label htmlFor="primary-color">Primary Color</Label>
                        </div>
                        <Input 
                          id="primary-color" 
                          type="color"
                          value={customBranding.colors?.primary || '#0284c7'}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: customBranding.colors?.secondary }}
                          ></div>
                          <Label htmlFor="secondary-color">Secondary Color</Label>
                        </div>
                        <Input 
                          id="secondary-color" 
                          type="color"
                          value={customBranding.colors?.secondary || '#7f1d1d'}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: customBranding.colors?.accent }}
                          ></div>
                          <Label htmlFor="accent-color">Accent Color</Label>
                        </div>
                        <Input 
                          id="accent-color" 
                          type="color"
                          value={customBranding.colors?.accent || '#0f766e'}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionSettings;
