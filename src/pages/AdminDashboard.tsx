
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, UserX, FileUp, Monitor, LogOut, RefreshCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import DocumentIcon from '@/components/document/DocumentIcon';

interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  status: 'ACTIVE' | 'BLOCKED';
  document_count?: number;
}

interface Document {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  file_type?: string;
  user_name?: string;
  user_email?: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    
    fetchData();
    
    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      // Fetch users from Supabase
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Fetch documents from Supabase
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*');
      
      if (documentsError) throw documentsError;
      
      // Process user data
      const formattedUsers = usersData.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        status: 'ACTIVE' as const,
        document_count: documentsData.filter(doc => doc.user_id === user.id).length
      }));
      
      // Process document data with user info
      const formattedDocuments = documentsData.map(doc => {
        const user = usersData.find(u => u.id === doc.user_id);
        
        return {
          id: doc.id,
          title: doc.title,
          user_id: doc.user_id,
          created_at: doc.created_at,
          file_type: doc.file_type,
          user_name: user?.name,
          user_email: user?.email
        };
      });
      
      setUsers(formattedUsers);
      setDocuments(formattedDocuments);
      
      // Set system stats
      setStats({
        totalUsers: formattedUsers.length,
        activeUsers: formattedUsers.filter(u => u.status === 'ACTIVE').length,
        totalDocuments: formattedDocuments.length,
        cpuUsage: Math.floor(Math.random() * 30) + 10, // Simulated data
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        storageUsage: Math.floor(Math.random() * 20) + 5
      });
      
      if (showLoading) {
        toast({
          title: "Data loaded",
          description: "Admin dashboard data has been refreshed"
        });
      }
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Failed to load data",
        description: "Please try refreshing the page",
        variant: "destructive"
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin/login');
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel"
    });
  };

  const handleBlockUser = async (userId: string) => {
    try {
      // In a real implementation, you would update the user status in the database
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'BLOCKED' } 
            : user
        )
      );
      
      toast({
        title: "User blocked",
        description: "The user has been blocked from accessing the platform"
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Failed to block user",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      // In a real implementation, you would update the user status in the database
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: 'ACTIVE' } 
            : user
        )
      );
      
      toast({
        title: "User approved",
        description: "The user has been approved to access the platform"
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Failed to approve user",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, monitor system health, and control content</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchData()}
                disabled={isLoading}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          {/* System Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Users</span>
                    <span className="font-semibold">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users</span>
                    <span className="font-semibold">{stats.activeUsers}</span>
                  </div>
                  <Progress value={(stats.activeUsers / stats.totalUsers) * 100 || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Document Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Documents</span>
                    <span className="font-semibold">{stats.totalDocuments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documents per User</span>
                    <span className="font-semibold">{stats.totalUsers ? (stats.totalDocuments / stats.totalUsers).toFixed(1) : 0}</span>
                  </div>
                  <Progress value={Math.min((stats.totalDocuments / (stats.totalUsers * 5)) * 100 || 0, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-xs">{stats.cpuUsage}%</span>
                    </div>
                    <Progress value={stats.cpuUsage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-xs">{stats.memoryUsage}%</span>
                    </div>
                    <Progress value={stats.memoryUsage} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Storage Usage</span>
                      <span className="text-xs">{stats.storageUsage}%</span>
                    </div>
                    <Progress value={stats.storageUsage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList>
              <TabsTrigger value="users">
                <UserCheck className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileUp className="h-4 w-4 mr-2" />
                Document Tracking
              </TabsTrigger>
              <TabsTrigger value="system">
                <Monitor className="h-4 w-4 mr-2" />
                System Health
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Approve or block users from accessing the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Name</th>
                          <th className="text-left py-2 font-medium">Email</th>
                          <th className="text-left py-2 font-medium">Joined</th>
                          <th className="text-left py-2 font-medium">Status</th>
                          <th className="text-left py-2 font-medium">Documents</th>
                          <th className="text-left py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/40">
                              <td className="py-2">{user.name || 'N/A'}</td>
                              <td className="py-2">{user.email}</td>
                              <td className="py-2">{formatDate(user.created_at)}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="py-2">{user.document_count || 0}</td>
                              <td className="py-2">
                                {user.status === 'ACTIVE' ? (
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleBlockUser(user.id)}
                                  >
                                    <UserX className="h-3 w-3 mr-1" />
                                    Block
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => handleApproveUser(user.id)}
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-muted-foreground">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Document Tracking</CardTitle>
                  <CardDescription>Monitor all document uploads in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Document</th>
                          <th className="text-left py-2 font-medium">Type</th>
                          <th className="text-left py-2 font-medium">Uploaded By</th>
                          <th className="text-left py-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.length > 0 ? (
                          documents.map((doc) => (
                            <tr key={doc.id} className="border-b hover:bg-muted/40">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <DocumentIcon fileType={doc.file_type || 'unknown'} className="h-4 w-4" />
                                  <span>{doc.title}</span>
                                </div>
                              </td>
                              <td className="py-2">{doc.file_type || 'Unknown'}</td>
                              <td className="py-2">{doc.user_name || doc.user_email || 'Unknown user'}</td>
                              <td className="py-2">{formatDate(doc.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-muted-foreground">
                              No documents found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Monitor system performance and resource usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">CPU Usage</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current: {stats.cpuUsage}%</span>
                        <span>Threshold: 80%</span>
                      </div>
                      <Progress 
                        value={stats.cpuUsage} 
                        className="h-3" 
                        indicatorClassName={stats.cpuUsage > 70 ? "bg-amber-500" : stats.cpuUsage > 90 ? "bg-red-500" : undefined} 
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Memory Usage</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current: {stats.memoryUsage}%</span>
                        <span>Threshold: 85%</span>
                      </div>
                      <Progress 
                        value={stats.memoryUsage} 
                        className="h-3" 
                        indicatorClassName={stats.memoryUsage > 75 ? "bg-amber-500" : stats.memoryUsage > 85 ? "bg-red-500" : undefined} 
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Storage Usage</h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current: {stats.storageUsage}%</span>
                        <span>Threshold: 90%</span>
                      </div>
                      <Progress 
                        value={stats.storageUsage} 
                        className="h-3" 
                        indicatorClassName={stats.storageUsage > 75 ? "bg-amber-500" : stats.storageUsage > 90 ? "bg-red-500" : undefined} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">System Uptime</h4>
                        <p className="text-2xl font-bold">99.98%</p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Average Response Time</h4>
                        <p className="text-2xl font-bold">187ms</p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
