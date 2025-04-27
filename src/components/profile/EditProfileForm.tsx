
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

interface EditProfileFormProps {
  onSave?: (formData: any) => Promise<void>;
}

const EditProfileForm = ({ onSave }: EditProfileFormProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    async function loadProfile() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setName(data.name || '');
          setBio(data.bio || '');
          setAvatar(data.avatar_url || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile information.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, [user, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // File validation
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image under 2MB.',
          variant: 'destructive',
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      setNewAvatar(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    try {
      let avatarUrl = avatar;
      
      // Upload new avatar if selected
      if (newAvatar) {
        try {
          // Check if avatars bucket exists, create if not
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.some(bucket => bucket.name === 'avatars')) {
            await supabase.storage.createBucket('avatars', {
              public: true
            });
          }
          
          const filename = `${user.id}-${Date.now()}-${newAvatar.name}`;
          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(filename, newAvatar);
            
          if (uploadError) throw uploadError;
          
          if (data) {
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(data.path);
              
            avatarUrl = urlData.publicUrl;
          }
        } catch (storageError) {
          console.error('Storage error:', storageError);
          throw new Error('Failed to upload avatar image');
        }
      }
      
      const formData = {
        name,
        bio,
        avatar_url: avatarUrl,
      };
      
      // Use the onSave prop function if provided, otherwise update directly
      if (onSave) {
        await onSave(formData);
      } else {
        // Update profile in database
        const { error } = await supabase
          .from('profiles')
          .update({
            name,
            bio,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
        
        // Navigate back to profile page
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              <User className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
            <Camera className="h-4 w-4" />
            <input
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Click the camera icon to change your profile picture
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio about yourself"
            className="min-h-[100px]"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full md:w-auto"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
