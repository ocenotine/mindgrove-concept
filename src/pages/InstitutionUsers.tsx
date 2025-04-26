
import React, { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, UserCheck, Mail, FileText, Book, BookCopy } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'researcher' | 'librarian' | 'admin';
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  documentCount: number;
}

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  members: number;
  lastUpdated: string;
}

const InstitutionUsers = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'student' as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock user data
  const [users, setUsers] = useState<User[]>([]);
  
  // Mock research projects
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([
    {
      id: '1',
      title: 'AI in Education',
      description: 'Researching the impact of AI tools on student learning outcomes',
      status: 'active',
      members: 5,
      lastUpdated: '2023-06-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Climate Change Models',
      description: 'Developing predictive models for climate change effects on agriculture',
      status: 'active',
      members: 3,
      lastUpdated: '2023-06-10T14:20:00Z'
    },
    {
      id: '3',
      title: 'Medical Diagnosis Systems',
      description: 'AI-driven diagnostic tools for rural healthcare providers',
      status: 'completed',
      members: 4,
      lastUpdated: '2023-05-22T09:15:00Z'
    },
    {
      id: '4',
      title: 'Natural Language Processing for Local Languages',
      description: 'Developing NLP tools for underrepresented African languages',
      status: 'active',
      members: 6,
      lastUpdated: '2023-06-18T11:45:00Z'
    }
  ]);

  // Generate mock users
  useEffect(() => {
    const mockUsers: User[] = [];
    const roles = ['student', 'researcher', 'librarian', 'admin'] as const;
    const statuses = ['active', 'pending', 'inactive'] as const;
    const names = [
      'John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Williams', 
      'Michael Brown', 'Sarah Davis', 'David Miller', 'Linda Wilson',
      'James Moore', 'Patricia Taylor', 'Joseph Anderson', 'Jennifer Thomas',
      'Charles Jackson', 'Mary White', 'Daniel Harris', 'Nancy Martin'
    ];
    
    for (let i = 0; i < 16; i++) {
      const name = names[i];
      const email = name.toLowerCase().replace(' ', '.') + '@example.com';
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = Math.random() > 0.8 ? 
        (Math.random() > 0.5 ? 'pending' : 'inactive') : 
        'active';
      
      const today = new Date();
      const lastActiveDate = new Date();
      lastActiveDate.setDate(today.getDate() - Math.floor(Math.random() * 14)); // Last 14 days
      
      mockUsers.push({
        id: `user-${i + 1}`,
        name,
        email,
        role,
        status,
        lastActive: lastActiveDate.toISOString(),
        documentCount: Math.floor(Math.random() * 50)
      });
    }
    
    setUsers(mockUsers);
  }, []);

  useEffect(() => {
    const checkInstitutionPremium = async () => {
      setIsLoading(true);
      try {
        if (user?.user_metadata?.institution_id || user?.institution_id) {
          const institutionId = user?.user_metadata?.institution_id || user?.institution_id;
          
          const { data, error } = await supabase
            .from('institutions')
            .select('is_premium')
            .eq('id', institutionId)
            .single();
          
          if (error) throw error;
          setIsPremium(!!data.is_premium);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremium(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkInstitutionPremium();
  }, [user]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate new user
      const newUser: User = {
        id: `user-${users.length + 1}`,
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        status: 'pending',
        lastActive: new Date().toISOString(),
        documentCount: 0
      };
      
      setUsers([newUser, ...users]);
      setIsSubmitting(false);
      setAddUserDialogOpen(false);
      
      toast({
        title: 'User Invited',
        description: `${newUserData.name} has been invited to join your institution.`,
      });
      
      // Reset form
      setNewUserData({
        name: '',
        email: '',
        role: 'student',
      });
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <InstitutionLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-400">Loading...</span>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="container pb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">
              Manage your institution's users and research projects
            </p>
          </div>
          
          {!isPremium ? (
            <Card className="bg-[#191C27] border-gray-800 p-6 text-center">
              <div className="mb-6">
                <Badge variant="outline" className="mb-4 bg-orange-500/10 text-orange-400 border-orange-400">Premium Feature</Badge>
                <h2 className="text-2xl font-bold text-white">Upgrade to Access User Management</h2>
                <p className="text-gray-400 mt-2 max-w-lg mx-auto">
                  User management allows you to invite and manage researchers, students, and staff in your institution.
                  Upgrade to Premium to unlock this feature.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/institution/subscription'}
                className="mt-2"
              >
                Upgrade to Premium
              </Button>
            </Card>
          ) : (
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="mb-4 bg-[#191C27] border-gray-800">
                <TabsTrigger value="users" className="data-[state=active]:bg-primary/20">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="research" className="data-[state=active]:bg-primary/20">
                  <BookCopy className="mr-2 h-4 w-4" />
                  Research Projects
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="space-y-6">
                {/* Search and Add User controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      className="pl-9 bg-[#131620] border-gray-700 text-gray-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#191C27] text-white">
                      <DialogHeader>
                        <DialogTitle>Invite New User</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Add a new user to your institution. They will receive an email invitation.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-200">Full Name</Label>
                          <Input
                            id="name"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                            placeholder="John Doe"
                            className="bg-[#131620] border-gray-700 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-200">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                            placeholder="john.doe@example.com"
                            className="bg-[#131620] border-gray-700 text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-gray-200">Role</Label>
                          <Select
                            value={newUserData.role}
                            onValueChange={(value: any) => setNewUserData({...newUserData, role: value})}
                          >
                            <SelectTrigger className="bg-[#131620] border-gray-700 text-white">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#191C27] text-white border-gray-700">
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="researcher">Researcher</SelectItem>
                              <SelectItem value="librarian">Librarian</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setAddUserDialogOpen(false)}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          onClick={handleAddUser}
                          disabled={!newUserData.name || !newUserData.email || isSubmitting}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin mr-2">⊝</span>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {/* Users Table */}
                <Card className="bg-[#191C27] border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Users</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your institution's members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-800">
                          <TableHead className="text-gray-400">Name</TableHead>
                          <TableHead className="text-gray-400">Email</TableHead>
                          <TableHead className="text-gray-400">Role</TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                          <TableHead className="text-gray-400">Last Active</TableHead>
                          <TableHead className="text-gray-400">Documents</TableHead>
                          <TableHead className="text-gray-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id} className="border-gray-800 hover:bg-gray-900/50">
                              <TableCell className="font-medium text-white">{user.name}</TableCell>
                              <TableCell className="text-gray-300">{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`
                                  ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500' : ''}
                                  ${user.role === 'researcher' ? 'bg-blue-500/20 text-blue-300 border-blue-500' : ''}
                                  ${user.role === 'librarian' ? 'bg-amber-500/20 text-amber-300 border-amber-500' : ''}
                                  ${user.role === 'student' ? 'bg-green-500/20 text-green-300 border-green-500' : ''}
                                `}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  user.status === 'active' ? 'default' : 
                                  user.status === 'pending' ? 'secondary' : 'outline'
                                }>
                                  {user.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">{formatDate(user.lastActive)}</TableCell>
                              <TableCell className="text-gray-300">{user.documentCount}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400"
                                  >
                                    <path
                                      d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                      fill="currentColor"
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                              No users found matching your search criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="research" className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <h2 className="text-xl font-bold text-white">Research Projects</h2>
                  
                  <Button>
                    <Book className="mr-2 h-4 w-4" />
                    New Research Project
                  </Button>
                </div>
                
                {/* Research Projects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchProjects.map((project) => (
                    <Card key={project.id} className="bg-[#191C27] border-gray-800">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-white">{project.title}</CardTitle>
                          <Badge variant={
                            project.status === 'active' ? 'default' :
                            project.status === 'completed' ? 'secondary' : 'outline'
                          }>
                            {project.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-400">
                          Last updated: {formatDate(project.lastUpdated)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm">{project.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 text-blue-400 mr-2" />
                            <span className="text-sm text-gray-300">{project.members} members</span>
                          </div>
                          <Button size="sm" variant="outline" className="h-8 border-gray-700 text-gray-300 hover:bg-gray-800">
                            <FileText className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionUsers;
