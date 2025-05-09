
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface InstitutionStats {
  totalUsers: number;
  activeCourses: number;
  totalDocuments: number;
  totalStudents: number;
  recentDocuments: Array<{
    id: string;
    title: string;
    user_email?: string;
    created_at: string;
  }>;
}

const InstitutionDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<InstitutionStats>({
    totalUsers: 0,
    activeCourses: 0,
    totalDocuments: 0,
    totalStudents: 0,
    recentDocuments: []
  });
  const [institutionName, setInstitutionName] = useState<string>('');
  
  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const institutionId = user.institution_id || user.user_metadata?.institution_id;
        
        // If we have an institution ID, fetch the institution details
        if (institutionId) {
          const { data: institutionData } = await supabase
            .from('institutions')
            .select('name')
            .eq('id', institutionId)
            .single();
            
          if (institutionData) {
            setInstitutionName(institutionData.name);
          }
        }
        
        // Count users associated with this institution
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id')
          .eq('institution_id', institutionId);
          
        if (usersError) throw usersError;
        
        // Count documents created by users in this institution
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (documentsError) throw documentsError;
        
        // Process document data to include user information
        const recentDocs = await Promise.all(documentsData.map(async (doc) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', doc.user_id)
            .single();
            
          return {
            id: doc.id,
            title: doc.title,
            user_email: userData?.email || 'Unknown user',
            created_at: doc.created_at
          };
        }));
        
        // Get count of students (users with account_type = 'student')
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('account_type', 'student')
          .eq('institution_id', institutionId);
          
        if (studentsError) throw studentsError;
        
        setStats({
          totalUsers: usersData?.length || 0,
          totalStudents: studentsData?.length || 0,
          activeCourses: Math.floor(Math.random() * 5) + 1, // Still mock data for courses
          totalDocuments: documentsData?.length || 0,
          recentDocuments: recentDocs
        });
      } catch (error) {
        console.error("Error fetching institution data:", error);
        toast({
          title: "Error",
          description: "Failed to load institution data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInstitutionData();
  }, [user]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Institution Dashboard</h1>
            <p className="text-muted-foreground">
              {institutionName ? `Welcome to ${institutionName} dashboard` : 'Welcome to your institution dashboard'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Number of users in your institution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Active Courses</CardTitle>
                <CardDescription>Number of active courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeCourses}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Documents</CardTitle>
                <CardDescription>Number of documents uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalDocuments}</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="documents" className="w-full">
            <TabsList>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Recent Documents
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>
                    Recently uploaded documents in your institution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recentDocuments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">Title</th>
                            <th className="text-left py-2 font-medium">Uploaded By</th>
                            <th className="text-left py-2 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentDocuments.map((doc) => (
                            <tr key={doc.id} className="border-b hover:bg-muted/40">
                              <td className="py-2">{doc.title}</td>
                              <td className="py-2">{doc.user_email}</td>
                              <td className="py-2">{formatDate(doc.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found. Upload some documents to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Institution Users</CardTitle>
                  <CardDescription>
                    Users associated with your institution
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">Total Students: {stats.totalStudents}</h3>
                    <p className="text-muted-foreground mb-4">
                      Manage your institution's users to give them access to your content
                    </p>
                    <Button>View All Users</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Overview</CardTitle>
                  <CardDescription>
                    Usage analytics for your institution
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">Analytics Coming Soon</h3>
                    <p className="text-muted-foreground">
                      We're working on detailed analytics for your institution
                    </p>
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

export default InstitutionDashboard;
