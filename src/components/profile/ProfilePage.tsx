
import React from 'react';
import { UserWithMetadata } from '@/store/authStore';

interface ProfilePageProps {
  user: UserWithMetadata;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{user.name || 'User'}'s Profile</h2>
      <div className="grid gap-4">
        <div>
          <h3 className="text-lg font-medium">Email</h3>
          <p>{user.email}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Account Type</h3>
          <p className="capitalize">{user.account_type || 'Student'}</p>
        </div>
        {user.user_metadata?.bio && (
          <div>
            <h3 className="text-lg font-medium">Bio</h3>
            <p>{user.user_metadata.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
