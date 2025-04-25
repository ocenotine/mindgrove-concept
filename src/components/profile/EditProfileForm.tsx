import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const EditProfileForm = () => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedImage || !user) return null;
    
    setIsUploading(true);
    try {
      // Create buckets bucket if it doesn't exist
      const { data: bucketExists } = await supabase.storage
        .getBucket('avatars');
      
      if (!bucketExists) {
        console.log("Creating avatars bucket...");
        try {
          const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
            public: false
          });
          
          if (createBucketError) {
            throw new Error('Failed to create storage bucket');
          }
        } catch (err) {
          throw new Error('Failed to create storage bucket');
        }
      }
      
      // Upload the image
      const fileName = `${user.id}/${Date.now()}_${selectedImage.name}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedImage);
        
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: fileData } = await supabase.storage
        .from('avatars')
        .createSignedUrl(fileName, 31536000); // URL valid for 1 year
      
      return fileData?.signedUrl || null;
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Failed to upload avatar",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Upload avatar first if a new one was selected
      let avatarUrl = user?.avatar_url;
      if (selectedImage) {
        const uploadedAvatarUrl = await uploadAvatar();
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        }
      }
      
      // Update user profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state using the correct method name updateProfile
      await updateProfile({
        name,
        bio,
        avatar_url: avatarUrl
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="avatar" className="block text-sm font-medium">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold uppercase text-muted-foreground">
                {user?.name?.[0] || "?"}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="avatar-upload"
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Change
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageSelection}
                disabled={isUploading}
              />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          disabled={isSaving || isUploading}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;
