
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileStats from '@/components/profile/ProfileStats';
import { Settings, Lock, Bell, Key } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getOpenRouterApiKey } from '@/utils/openRouterUtils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    setApiKey(getOpenRouterApiKey());
  }, []);

  // Function to format email for display
  const formatEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container max-w-4xl mx-auto p-6 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Card className="w-full md:w-auto">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-4">
                <ProfileAvatar user={user} size="xl" />
                <div>
                  <h2 className="text-xl font-semibold">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</h2>
                  <p className="text-muted-foreground text-sm">{formatEmail(user?.email || '')}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            <div className="w-full space-y-6">
              <ProfileStats />
              
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">General Settings</CardTitle>
                      <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProfileSettings />
                      <div className="space-y-2">
                        <Label htmlFor="api-key">OpenRouter API Key</Label>
                        <Input 
                          id="api-key"
                          value={apiKey}
                          readOnly
                          className="font-mono bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">API key is used for AI features like document analysis and chat.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lock className="h-4 w-4" /> Security Settings
                      </CardTitle>
                      <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Password</h3>
                          <Button variant="outline" size="sm">Change Password</Button>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                          <Button variant="outline" size="sm">Enable 2FA</Button>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">API Keys</h3>
                          <Button variant="outline" size="sm">
                            <Key className="mr-2 h-4 w-4" /> Manage API Keys
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bell className="h-4 w-4" /> Notification Settings
                      </CardTitle>
                      <CardDescription>Manage how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <div>ON</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Push Notifications</h3>
                            <p className="text-sm text-muted-foreground">Receive notifications in-app</p>
                          </div>
                          <div>ON</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
