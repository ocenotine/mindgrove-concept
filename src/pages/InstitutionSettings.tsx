
import { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ChromePicker } from 'react-color';
import { InstitutionData } from '@/types/institution';
import { PageTransition } from '@/components/animations/PageTransition';
import { Upload } from 'lucide-react';

const InstitutionSettings = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  });
  
  const [primaryColor, setPrimaryColor] = useState('#6C72CB');
  const [secondaryColor, setSecondaryColor] = useState('#CB69C1');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
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
          
          const institutionWithTypedColors: InstitutionData = {
            ...data,
            branding_colors: brandingColors
          };
          
          setInstitutionData(institutionWithTypedColors);
          setPrimaryColor(brandingColors.primary);
          setSecondaryColor(brandingColors.secondary);
          
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
          }
        }
      } catch (error) {
        console.error('Error fetching institution data:', error);
        toast({
          title: 'Error',
          description: 'Could not load institution settings.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstitutionData();
  }, [user?.institution_id]);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveSettings = async () => {
    if (!user?.institution_id) return;
    
    try {
      setSaving(true);
      
      // First upload the logo if it exists
      let logoUrl = institutionData.logo_url;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `institution_logos/${user.institution_id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('institutions')
          .upload(filePath, logoFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('institutions')
          .getPublicUrl(filePath);
        
        logoUrl = publicUrlData.publicUrl;
      }
      
      // Update the institution data
      const { error } = await supabase
        .from('institutions')
        .update({
          name: institutionData.name,
          logo_url: logoUrl,
          branding_colors: {
            primary: primaryColor,
            secondary: secondaryColor
          }
        })
        .eq('id', user.institution_id);
      
      if (error) throw error;
      
      toast({
        title: 'Settings saved',
        description: 'Your institution settings have been updated successfully.'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Could not save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Institution Settings</h1>
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Institution Information</CardTitle>
                  <CardDescription>
                    Update your institution's basic information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">Name</label>
                    <Input 
                      id="name"
                      value={institutionData.name} 
                      onChange={(e) => setInstitutionData({...institutionData, name: e.target.value})}
                      placeholder="Institution name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="domain" className="block text-sm font-medium">Domain</label>
                    <Input 
                      id="domain"
                      value={institutionData.domain}
                      disabled
                      placeholder="yourinstitution.edu"
                    />
                    <p className="text-sm text-muted-foreground">Domains cannot be changed after setup.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>
                    Customize your institution's branding colors and logo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Logo</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                          {logoPreview ? (
                            <img 
                              src={logoPreview} 
                              alt="Institution logo" 
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-400">No logo</div>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md px-4 py-2">
                              <Upload className="h-4 w-4" />
                              <span>Upload Logo</span>
                            </div>
                            <input 
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-muted-foreground mt-2">
                            Recommended size: 200x200px. PNG or JPG.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Colors</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Primary Color</label>
                          <div className="flex gap-3 items-center">
                            <div 
                              className="w-10 h-10 rounded-md border" 
                              style={{ backgroundColor: primaryColor }}
                            />
                            <ChromePicker 
                              color={primaryColor}
                              onChange={(color) => setPrimaryColor(color.hex)}
                              disableAlpha
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Secondary Color</label>
                          <div className="flex gap-3 items-center">
                            <div 
                              className="w-10 h-10 rounded-md border" 
                              style={{ backgroundColor: secondaryColor }}
                            />
                            <ChromePicker 
                              color={secondaryColor}
                              onChange={(color) => setSecondaryColor(color.hex)}
                              disableAlpha
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <label className="block text-sm font-medium mb-2">Preview</label>
                          <div 
                            className="h-16 rounded-lg w-full" 
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>
                    Connect your institution to external services.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="api-key" className="block text-sm font-medium">API Key</label>
                    <Input 
                      id="api-key"
                      value="••••••••••••••••"
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" className="mt-2">Regenerate API Key</Button>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <label htmlFor="webhook" className="block text-sm font-medium">Webhook URL</label>
                    <Input 
                      id="webhook"
                      placeholder="https://your-service.com/webhook"
                      className="font-mono"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionSettings;
