
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { useAuthStore } from '@/store/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailPreferences from '@/components/profile/EmailPreferences';
import ProfilePage from '@/components/profile/ProfilePage'; 
import SupportPanel from '@/components/profile/SupportPanel';

const ProfilePageContainer = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render anything if user isn't available yet
  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-6">
            <ProfileHeader user={user} />
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <ProfilePage user={user} />
            </TabsContent>
            
            <TabsContent value="email">
              <EmailPreferences />
            </TabsContent>
            
            <TabsContent value="support">
              <SupportPanel />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default ProfilePageContainer;
