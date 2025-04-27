
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  
  const handleSave = async (formData) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile.",
          variant: "destructive",
        });
        return;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      setUser({
        ...user,
        name: formData.name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Redirect back to profile page
      navigate('/profile');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>
          
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
              <EditProfileForm onSave={handleSave} />
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default EditProfile;
