import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Check } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';

const EditProfile = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setAvatarUrl(user.user_metadata?.avatarUrl || '');
      // Fetch bio from the 'profiles' table
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('bio')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setBio(data.bio || '');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.updateUser({
        // Use avatarUrl instead of avatar_url to match the UserWithMetadata type
        data: {
          name: name || user?.user_metadata?.name,
          avatarUrl: avatarUrl || user?.user_metadata?.avatarUrl
        }
      });
      
      if (error) throw error;
      
      // Update the profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name,
          avatar_url: avatarUrl,
          bio
        })
        .eq('id', user?.id);
      
      if (profileError) throw profileError;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated.'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Implement upload to storage and get URL
      const uploadAvatar = async () => {
        setIsLoading(true);
        try {
          const filename = `${user?.id}-${Date.now()}.${file.name.split('.').pop()}`;
          const { data, error } = await supabase
            .storage
            .from('avatars')
            .upload(filename, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw error;
          }

          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
          setAvatarUrl(publicUrl);
          toast({
            title: 'Avatar updated',
            description: 'Your avatar has been updated.'
          });
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast({
            title: 'Error uploading avatar',
            description: error.message || 'Failed to upload avatar. Please try again.',
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      };
      uploadAvatar();
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Edit Profile</CardTitle>
              <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={name} />
                    ) : (
                      <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  {isEditing && (
                    <>
                      <Label htmlFor="avatar-upload" className="cursor-pointer hover:text-primary">
                        Upload New Avatar
                      </Label>
                      <Input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isLoading}
                      />
                      {isLoading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    </>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                {isEditing && (
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                )}
              </form>
            </CardContent>
            <CardDescription className="px-4 py-2 text-center text-sm text-muted-foreground">
              Your profile information is visible to other users.
            </CardDescription>
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default EditProfile;
