
import React, { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Lock, MoreHorizontal, Search, UserPlus, Shield, UserCog, Mail, Trash, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  account_type: string;
  avatar_url?: string | null;
  last_active?: string | null;
}

const InstitutionUsers = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('student');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const loadInstitutionData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const instId = user.user_metadata?.institution_id || user.institution_id;
        
        if (!instId) {
          toast({
            title: "No institution found",
            description: "Your account is not associated with any institution.",
            variant: "destructive"
          });
          return;
        }
        
        setInstitutionId(instId);
        
        // Check if premium
        const { data: institutionData, error: institutionError } = await supabase
          .from('institutions')
          .select('is_premium')
          .eq('id', instId)
          .single();
        
        if (institutionError) throw institutionError;
        setIsPremium(institutionData.is_premium);
        
        if (institutionData.is_premium) {
          // Load users if premium
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, name, email, account_type, avatar_url, last_active')
            .eq('institution_id', instId);
          
          if (usersError) throw usersError;
          setUsers(usersData || []);
          setFilteredUsers(usersData || []);
        }
      } catch (error) {
        console.error('Error loading institution users:', error);
        toast({
          title: "Failed to load users",
          description: "There was a problem loading user data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInstitutionData();
  }, [user, toast]);

  // Filter users based on search query and role
  useEffect(() => {
    let filtered = [...users];
    
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.account_type === selectedRole);
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, selectedRole, users]);

  const handleInviteUser = async () => {
    if (!inviteEmail || !institutionId) return;
    
    setIsInviting(true);
    try {
      // In a real implementation, this would send an email invitation
      // For now, let's create a new user profile
      
      // Check if email exists
      const { data: existingUser, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();
      
      if (existingUser) {
        toast({
          title: "User already exists",
          description: "This email is already associated with an account.",
          variant: "destructive"
        });
        return;
      }
      
      // Generate a random ID for simulation
      const newUserId = `sim-${Date.now()}`;
      
      // Create new user profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          email: inviteEmail,
          name: inviteEmail.split('@')[0], // Simple name from email
          account_type: inviteRole,
          institution_id: institutionId,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      
      // Add the new user to the list
      const newUser: User = {
        id: newUserId,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        account_type: inviteRole
      };
      
      setUsers([...users, newUser]);
      setShowInviteDialog(false);
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Failed to send invitation",
        description: "There was a problem sending the invitation.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User removed",
        description: "The user has been removed from your institution.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Failed to remove user",
        description: "There was a problem removing the user.",
        variant: "destructive"
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      // Update user role
      const { error } = await supabase
        .from('profiles')
        .update({ account_type: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, account_type: newRole } : user
      ));
      
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Failed to update role",
        description: "There was a problem updating the user's role.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500';
      case 'teacher':
        return 'bg-blue-500/10 text-blue-500';
      case 'student':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <InstitutionLayout>
        <div className="flex justify-center items-center h-full py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </InstitutionLayout>
    );
  }

  if (!isPremium) {
    return (
      <InstitutionLayout>
        <PageTransition>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Users</h1>
            <p className="text-muted-foreground">
              Manage users associated with your institution
            </p>
          </div>
          
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Premium Feature
              </CardTitle>
              <CardDescription>
                User management is available with our Premium plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Upgrade Required</AlertTitle>
                <AlertDescription>
                  This feature requires a premium subscription. Upgrade your plan to access user management tools.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Button asChild className="mt-4">
                  <a href="/institution/subscription">Upgrade to Premium</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageTransition>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">
            Manage users associated with your institution
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Invite User</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your institution
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role
                    </label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteUser} disabled={!inviteEmail || isInviting}>
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Institution Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-3">User</th>
                    <th className="text-left font-medium p-3">Email</th>
                    <th className="text-left font-medium p-3">Role</th>
                    <th className="text-left font-medium p-3">Last Active</th>
                    <th className="text-right font-medium p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <span>{user.name || user.email.split('@')[0]}</span>
                          </div>
                        </td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.account_type)}`}>
                            {user.account_type}
                          </span>
                        </td>
                        <td className="p-3">
                          {user.last_active 
                            ? new Date(user.last_active).toLocaleDateString() 
                            : 'Never'}
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>Send Message</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleChangeRole(user.id, 'admin')}
                                disabled={user.account_type === 'admin'}
                              >
                                <Shield className="h-4 w-4" />
                                <span>Make Admin</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleChangeRole(user.id, 'teacher')}
                                disabled={user.account_type === 'teacher'}
                              >
                                <UserCog className="h-4 w-4" />
                                <span>Make Teacher</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleChangeRole(user.id, 'student')}
                                disabled={user.account_type === 'student'}
                              >
                                <UserCog className="h-4 w-4" />
                                <span>Make Student</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash className="h-4 w-4" />
                                <span>Remove User</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionUsers;
