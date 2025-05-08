
import React, { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { InstitutionMetrics } from '@/types/institution';

interface ChartData {
  date: string;
  count: number;
}

const InstitutionDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<InstitutionMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    researchProjects: 0,
    documentsProcessed: 0,
    studyHours: 0,
  });

  useEffect(() => {
    if (user) {
      const id = user.user_metadata?.institution_id || user.institution_id || null;
      setInstitutionId(id);
    }
  }, [user]);

  // Fetch institution metrics
  const fetchMetrics = async () => {
    if (!institutionId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch total users for this institution
      const { count: totalUsers, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId);
        
      if (userError) throw userError;
      
      // Fetch active users (users who have been active in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .gte('last_active', thirtyDaysAgo.toISOString());
        
      if (activeError) throw activeError;
      
      // Fetch research projects/uploads count
      const { count: researchProjects, error: researchError } = await supabase
        .from('research_uploads')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId);
        
      if (researchError) throw researchError;
      
      // Fetch documents processed
      const { count: documentsProcessed, error: docsError } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId);
        
      if (docsError) throw docsError;
      
      // Sum study hours from all users in this institution
      const { data: studyData, error: studyError } = await supabase
        .from('profiles')
        .select('study_hours')
        .eq('institution_id', institutionId);
        
      if (studyError) throw studyError;
      
      const studyHours = studyData && studyData.length > 0 
        ? studyData.reduce((sum, profile) => sum + (profile.study_hours || 0), 0)
        : 0;
      
      // Get subscription data
      const { data: subscriptionData, error: subError } = await supabase
        .from('institutions')
        .select('is_premium, subscription_expiry')
        .eq('id', institutionId)
        .single();
        
      if (subError) throw subError;
      
      // Calculate days remaining if premium
      let daysRemaining = undefined;
      if (subscriptionData?.is_premium && subscriptionData?.subscription_expiry) {
        const expiry = new Date(subscriptionData.subscription_expiry);
        const now = new Date();
        daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      setMetrics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        researchProjects: researchProjects || 0,
        documentsProcessed: documentsProcessed || 0,
        studyHours: studyHours,
        daysRemaining
      });

      console.log('Metrics loaded:', {
        totalUsers,
        activeUsers,
        researchProjects,
        documentsProcessed,
        studyHours,
        daysRemaining
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Error loading dashboard',
        description: 'Failed to load institution metrics.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch chart data
  const fetchCharts = async () => {
    if (!institutionId) return;
    
    try {
      // Get document uploads by date
      const { data: documents, error } = await supabase
        .from('documents')
        .select('created_at')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (documents && documents.length > 0) {
        // Process the data to create chart data
        const dailyCounts: { [key: string]: number } = {};
        documents.forEach((doc) => {
          const date = new Date(doc.created_at).toLocaleDateString();
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const chartData: ChartData[] = Object.entries(dailyCounts).map(([date, count]) => ({
          date,
          count,
        }));

        setChartData(chartData);
      } else {
        // If no documents, check research uploads
        const { data: uploads, error: uploadError } = await supabase
          .from('research_uploads')
          .select('created_at')
          .eq('institution_id', institutionId)
          .order('created_at', { ascending: true });
          
        if (!uploadError && uploads && uploads.length > 0) {
          const dailyCounts: { [key: string]: number } = {};
          uploads.forEach((doc) => {
            const date = new Date(doc.created_at).toLocaleDateString();
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          });
          
          const chartData: ChartData[] = Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count,
          }));
          
          setChartData(chartData);
        }
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    if (institutionId) {
      fetchMetrics();
      fetchCharts();
    }
  }, [institutionId]);

  if (isLoading) {
    return (
      <InstitutionLayout>
        <PageTransition>
          <div className="flex justify-center items-center h-full min-h-[50vh]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </PageTransition>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="container mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Institution Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Uploads Over Time</CardTitle>
                <CardDescription>
                  A visual representation of document uploads by day
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No document upload data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
                <CardDescription>
                  Key metrics about your institution's usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Total Users</div>
                    <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Total Documents</div>
                    <div className="text-2xl font-bold">{metrics.documentsProcessed}</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Research Projects</div>
                    <div className="text-2xl font-bold">{metrics.researchProjects}</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Active Users (Last 30 Days)</div>
                    <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                  </div>
                  
                  {metrics.daysRemaining !== undefined && (
                    <div className="p-4 rounded-md bg-primary/10 col-span-2">
                      <div className="text-lg font-semibold">Premium Plan</div>
                      <div className="text-2xl font-bold">{metrics.daysRemaining} days remaining</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </InstitutionLayout>
  );
};

export default InstitutionDashboard;
