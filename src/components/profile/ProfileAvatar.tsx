
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserWithMetadata } from '@/store/authStore';

interface ProfileAvatarProps {
  user?: UserWithMetadata | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, size = 'md' }) => {
  const getInitials = () => {
    if (!user) return '?';
    
    if (user.user_metadata?.name) {
      return user.user_metadata.name.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    
    return user.email ? user.email[0].toUpperCase() : '?';
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-16 w-16';
      case 'xl': return 'h-24 w-24';
      default: return 'h-12 w-12';
    }
  };
  
  // Safely access avatar_url from user metadata if it exists
  const avatarUrl = user?.user_metadata && 'avatar_url' in user.user_metadata 
    ? (user.user_metadata as any).avatar_url 
    : '';
  
  return (
    <Avatar className={`${getSizeClass()} border-2 border-primary/10`}>
      <AvatarImage src={avatarUrl} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
