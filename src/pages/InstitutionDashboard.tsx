
import React, { useState, useEffect } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ChartData {
  date: string;
  count: number;
}

const InstitutionDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setInstitutionId(user.user_metadata?.institution_id || user.institution_id || null);
    }
  }, [user]);

  // Fetch chart data
  const fetchCharts = async () => {
    if (!institutionId || !user?.id) return;
    
    try {
      // Simplify the query to avoid deep type instantiation errors
      const { data: documents, error } = await supabase
        .from('documents')
        .select('created_at')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      if (documents) {
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
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, [institutionId, user]);

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
                    <div className="text-2xl font-bold">350</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Total Documents</div>
                    <div className="text-2xl font-bold">1,245</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Average Uploads/User</div>
                    <div className="text-2xl font-bold">3.5</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-lg font-semibold">Active Users (Last 30 Days)</div>
                    <div className="text-2xl font-bold">280</div>
                  </div>
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
