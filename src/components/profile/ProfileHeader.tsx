
import { motion } from 'framer-motion';
import { LogOut, Loader2, Calendar, Book, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const ProfileHeader = () => {
  const { user, updateProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length) return;
    if (!user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);

    try {
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({
        avatarUrl: data.publicUrl,
      });

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg border p-6 shadow-sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          {isUploading ? (
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="group relative">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                {user.avatarUrl ? (
                  <AvatarImage 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="text-4xl font-semibold bg-primary/10 text-primary">
                    {user.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <button 
                className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="sr-only"
              />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
        <p className="text-muted-foreground mb-4">{user.email}</p>
        
        <div className="bg-muted w-full rounded-md p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Member since</span>
            <span className="text-sm font-medium">
              {user.createdAt 
                ? new Date(user.createdAt).toLocaleDateString() 
                : new Date().toLocaleDateString()
              }
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Documents</span>
            <span className="text-sm font-medium">{user.documentCount || 0}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Flashcards</span>
            <span className="text-sm font-medium">{user.flashcardCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Daily Streak</span>
            <span className="text-sm font-medium">{user.streak || 0} days 🔥</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
