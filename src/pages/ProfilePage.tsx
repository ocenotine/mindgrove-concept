
import { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Settings, Mail, CreditCard, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileHeader from '@/components/profile/ProfileHeader';
import EditProfileForm from '@/components/profile/EditProfileForm';
import EmailPreferencePanel from '@/components/profile/EmailPreferencePanel';
import SupportPanel from '@/components/profile/SupportPanel';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/animations/PageTransition';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!user) {
    return null; 
  }
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <ProfileHeader />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="subscription" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Subscription</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Preferences</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <EditProfileForm />
                </TabsContent>
                
                <TabsContent value="subscription" className="space-y-4">
                  <SubscriptionPlans />
                </TabsContent>
                
                <TabsContent value="preferences" className="space-y-4">
                  <EmailPreferencePanel />
                </TabsContent>
              </Tabs>
            </motion.div>
            
            <SupportPanel />
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default ProfilePage;
