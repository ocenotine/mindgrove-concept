
import React, { useEffect, useState } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Image, Mail, Bell, Globe, Shield, Palette } from 'lucide-react';

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
  description?: string;
  contact_email?: string;
  is_premium: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  selar_co_id: string | null;
  branding_colors?: BrandingColors;
  notification_settings?: {
    email_notifications: boolean;
    research_alerts: boolean;
    user_activity: boolean;
  };
  privacy_settings?: {
    share_analytics: boolean;
    public_profile: boolean;
  };
}

const InstitutionSettings = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    description: '',
    contact_email: '',
    primary_color: '#6C72CB',
    secondary_color: '#CB69C1',
    accent_color: '#FEAC5E',
    email_notifications: true,
    research_alerts: true,
    user_activity: true,
    share_analytics: false,
    public_profile: true,
  });

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!user || user.user_metadata?.account_type !== 'institution') {
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      try {
        const institutionId = user.user_metadata?.institution_id || user.institution_id;
        
        if (!institutionId) {
          // Create a default institution if none exists
          const { data: newInstitution, error: createError } = await supabase
            .from('institutions')
            .insert({
              name: user.user_metadata?.institution_name || 'My Institution',
              domain: user.user_metadata?.domain || 'example.edu',
              is_premium: false
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          // Update user metadata with the new institution ID
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              institution_id: newInstitution.id
            }
          });
          
          if (updateError) throw updateError;
          
          setInstitutionData(newInstitution);
          initializeFormData(newInstitution);
        } else {
          // Fetch existing institution data
          const { data: institution, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', institutionId)
            .single();

          if (error) throw error;
          setInstitutionData(institution);
          initializeFormData(institution);
        }
      } catch (error) {
        console.error('Error fetching institution:', error);
        const defaultInstitution = {
          id: 'temp-id',
          name: user.user_metadata?.institution_name || 'My Institution',
          domain: user.user_metadata?.domain || 'example.edu',
          logo_url: null,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          selar_co_id: null,
          branding_colors: {
            primary: '#6C72CB',
            secondary: '#CB69C1',
            accent: '#FEAC5E',
          },
          notification_settings: {
            email_notifications: true,
            research_alerts: true,
            user_activity: true
          },
          privacy_settings: {
            share_analytics: false,
            public_profile: true
          }
        };
        
        setInstitutionData(defaultInstitution);
        initializeFormData(defaultInstitution);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, [user, navigate]);

  const initializeFormData = (institution: InstitutionData) => {
    const brandingColors = institution.branding_colors || {
      primary: '#6C72CB',
      secondary: '#CB69C1',
      accent: '#FEAC5E',
    };
    
    const notificationSettings = institution.notification_settings || {
      email_notifications: true,
      research_alerts: true,
      user_activity: true
    };
    
    const privacySettings = institution.privacy_settings || {
      share_analytics: false,
      public_profile: true
    };
    
    setFormData({
      name: institution.name,
      domain: institution.domain,
      logo_url: institution.logo_url || '',
      description: institution.description || '',
      contact_email: institution.contact_email || user?.email || '',
      primary_color: brandingColors.primary || '#6C72CB',
      secondary_color: brandingColors.secondary || '#CB69C1',
      accent_color: brandingColors.accent || '#FEAC5E',
      email_notifications: notificationSettings.email_notifications,
      research_alerts: notificationSettings.research_alerts,
      user_activity: notificationSettings.user_activity,
      share_analytics: privacySettings.share_analytics,
      public_profile: privacySettings.public_profile,
    });
  };

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
          description: formData.description,
          contact_email: formData.contact_email,
          // Store branding colors as an object
          branding_colors: {
            primary: formData.primary_color,
            secondary: formData.secondary_color,
            accent: formData.accent_color,
          },
          notification_settings: {
            email_notifications: formData.email_notifications,
            research_alerts: formData.research_alerts,
            user_activity: formData.user_activity,
          },
          privacy_settings: {
            share_analytics: formData.share_analytics,
            public_profile: formData.public_profile,
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
        description: formData.description,
        contact_email: formData.contact_email,
        branding_colors: {
          primary: formData.primary_color,
          secondary: formData.secondary_color,
          accent: formData.accent_color,
        },
        notification_settings: {
          email_notifications: formData.email_notifications,
          research_alerts: formData.research_alerts,
          user_activity: formData.user_activity,
        },
        privacy_settings: {
          share_analytics: formData.share_analytics,
          public_profile: formData.public_profile,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="container pb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Institution Settings</h1>
            <p className="text-gray-400 mt-1">
              Customize your institution's profile and preferences
            </p>
          </div>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4 bg-[#191C27] border-gray-800">
              <TabsTrigger value="general" className="data-[state=active]:bg-primary/20">
                <Settings className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="branding" className="data-[state=active]:bg-primary/20">
                <Palette className="mr-2 h-4 w-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/20">
                <Shield className="mr-2 h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading settings...</p>
              </div>
            ) : (
              <>
                <TabsContent value="general">
                  <Card className="bg-[#191C27] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">General Information</CardTitle>
                      <CardDescription className="text-gray-400">
                        Your institution's basic details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name" className="text-gray-200">Institution Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-[#131620] border-gray-700 text-white"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="domain" className="text-gray-200">Domain</Label>
                          <Input
                            id="domain"
                            type="url"
                            value={formData.domain}
                            onChange={handleInputChange}
                            className="bg-[#131620] border-gray-700 text-white"
                          />
                          <p className="text-xs text-gray-400">e.g. university.edu</p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description" className="text-gray-200">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="bg-[#131620] border-gray-700 text-white resize-none"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contact_email" className="text-gray-200">Contact Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={handleInputChange}
                            className="bg-[#131620] border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#191C27] border-gray-800 mt-6">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Image className="mr-2 h-5 w-5" />
                        Logo Settings
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Upload your institution's logo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="logo_url" className="text-gray-200">Logo URL</Label>
                          <Input
                            id="logo_url"
                            type="url"
                            value={formData.logo_url}
                            onChange={handleInputChange}
                            className="bg-[#131620] border-gray-700 text-white"
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        <div className="flex items-center justify-center p-4 bg-[#0D1117] rounded-lg border border-gray-700">
                          {formData.logo_url ? (
                            <div className="text-center">
                              <img 
                                src={formData.logo_url} 
                                alt="Institution logo"
                                className="max-h-20 max-w-full mx-auto"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Logo+Error';
                                }}
                              />
                              <p className="text-xs text-gray-400 mt-2">Current logo preview</p>
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <Image className="h-10 w-10 text-gray-500 mx-auto" />
                              <p className="text-sm text-gray-400 mt-2">No logo uploaded</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="branding">
                  <Card className="bg-[#191C27] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Brand Colors</CardTitle>
                      <CardDescription className="text-gray-400">
                        Customize your institution's colors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <Label htmlFor="primary_color" className="text-gray-200">Primary Color</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              type="color"
                              id="primary_color"
                              value={formData.primary_color}
                              onChange={handleInputChange}
                              className="w-16 h-10 p-1 bg-[#131620] border-gray-700"
                            />
                            <Input
                              type="text"
                              value={formData.primary_color}
                              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                              className="bg-[#131620] border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="secondary_color" className="text-gray-200">Secondary Color</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              type="color"
                              id="secondary_color"
                              value={formData.secondary_color}
                              onChange={handleInputChange}
                              className="w-16 h-10 p-1 bg-[#131620] border-gray-700"
                            />
                            <Input
                              type="text"
                              value={formData.secondary_color}
                              onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                              className="bg-[#131620] border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="accent_color" className="text-gray-200">Accent Color</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              type="color"
                              id="accent_color"
                              value={formData.accent_color}
                              onChange={handleInputChange}
                              className="w-16 h-10 p-1 bg-[#131620] border-gray-700"
                            />
                            <Input
                              type="text"
                              value={formData.accent_color}
                              onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                              className="bg-[#131620] border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-white mb-2">Preview</h3>
                          <div className="bg-[#0D1117] border border-gray-800 rounded-lg p-6">
                            <div className="flex flex-wrap gap-4 mb-4">
                              <div 
                                className="w-20 h-20 rounded-md flex items-center justify-center text-white font-medium" 
                                style={{ backgroundColor: formData.primary_color }}
                              >
                                Primary
                              </div>
                              <div 
                                className="w-20 h-20 rounded-md flex items-center justify-center text-white font-medium" 
                                style={{ backgroundColor: formData.secondary_color }}
                              >
                                Secondary
                              </div>
                              <div 
                                className="w-20 h-20 rounded-md flex items-center justify-center text-white font-medium" 
                                style={{ backgroundColor: formData.accent_color }}
                              >
                                Accent
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div 
                                className="w-full h-24 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4"
                                style={{ 
                                  background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})` 
                                }}
                              >
                                {formData.name || 'Institution Name'}
                              </div>
                              
                              <div className="flex gap-4">
                                <button
                                  className="px-4 py-2 rounded-md text-white font-medium"
                                  style={{ backgroundColor: formData.primary_color }}
                                >
                                  Primary Button
                                </button>
                                <button
                                  className="px-4 py-2 rounded-md text-white font-medium"
                                  style={{ backgroundColor: formData.secondary_color }}
                                >
                                  Secondary Button
                                </button>
                                <button
                                  className="px-4 py-2 rounded-md text-white font-medium"
                                  style={{ backgroundColor: formData.accent_color }}
                                >
                                  Accent Button
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card className="bg-[#191C27] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Notification Preferences</CardTitle>
                      <CardDescription className="text-gray-400">
                        Control how and when you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email_notifications" className="text-gray-200">Email Notifications</Label>
                            <p className="text-xs text-gray-400">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="email_notifications"
                            checked={formData.email_notifications}
                            onCheckedChange={(checked) => handleSwitchChange('email_notifications', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="research_alerts" className="text-gray-200">Research Alerts</Label>
                            <p className="text-xs text-gray-400">Get notifications about new research trends</p>
                          </div>
                          <Switch
                            id="research_alerts"
                            checked={formData.research_alerts}
                            onCheckedChange={(checked) => handleSwitchChange('research_alerts', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="user_activity" className="text-gray-200">User Activity Reports</Label>
                            <p className="text-xs text-gray-400">Weekly reports on user engagement</p>
                          </div>
                          <Switch
                            id="user_activity"
                            checked={formData.user_activity}
                            onCheckedChange={(checked) => handleSwitchChange('user_activity', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="privacy">
                  <Card className="bg-[#191C27] border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Privacy Settings</CardTitle>
                      <CardDescription className="text-gray-400">
                        Control your institution's visibility and data sharing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="share_analytics" className="text-gray-200">Share Analytics Data</Label>
                            <p className="text-xs text-gray-400">
                              Allow anonymous usage data for platform improvement
                            </p>
                          </div>
                          <Switch
                            id="share_analytics"
                            checked={formData.share_analytics}
                            onCheckedChange={(checked) => handleSwitchChange('share_analytics', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="public_profile" className="text-gray-200">Public Institution Profile</Label>
                            <p className="text-xs text-gray-400">
                              Make your institution visible in public directories
                            </p>
                          </div>
                          <Switch
                            id="public_profile"
                            checked={formData.public_profile}
                            onCheckedChange={(checked) => handleSwitchChange('public_profile', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⊝</span>
                  Saving...
                </>
              ) : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionSettings;
