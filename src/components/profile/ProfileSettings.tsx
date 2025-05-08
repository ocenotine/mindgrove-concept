import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, validatePassword } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [timezone, setTimezone] = useState('UTC');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Update profile in Supabase
      await updateProfile({
        name,
        bio,
      });
      
      // Update profile in the profiles table
      await supabase
        .from('profiles')
        .update({
          name,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      toast({
        title: "Settings updated",
        description: "Your profile settings have been saved."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile settings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePasswordChange = async () => {
    setPasswordError('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    // Validate password strength - using imported function directly
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      return;
    }
    
    setIsChangingPassword(true);
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Update to the new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Clear the password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error instanceof Error ? error.message : "Failed to change password");
      
      toast({
        title: "Password change failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const enable2FA = async () => {
    toast({
      title: "Two-factor authentication",
      description: "2FA would be implemented with Supabase Auth in a production app.",
    });
    
    // In a real implementation, this would generate a QR code or secret for an authenticator app
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">General Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input 
            id="display-name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            value={user?.email || ''} 
            disabled 
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea 
            id="bio" 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSave} 
          className="mt-2"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Password</h3>
        
        {passwordError && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {passwordError}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input 
            id="current-password" 
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input 
            id="new-password" 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password" 
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters with numbers, letters, and symbols
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input 
            id="confirm-password" 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password" 
          />
        </div>
        
        <Button 
          onClick={handlePasswordChange} 
          disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
        >
          {isChangingPassword ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing Password...
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Security</h3>
        
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-sm">Two-Factor Authentication (2FA)</h4>
            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <Button variant="outline" size="sm" onClick={enable2FA}>
            Enable 2FA
          </Button>
        </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-sm">Study Reminders</h4>
            <p className="text-xs text-muted-foreground">Get reminders to maintain your study streak</p>
          </div>
          <Switch 
            checked={emailNotifications} 
            onCheckedChange={setEmailNotifications} 
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-sm">Product Updates</h4>
            <p className="text-xs text-muted-foreground">Learn about new features and improvements</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
