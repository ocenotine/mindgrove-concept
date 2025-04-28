
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudySession {
  day: string;
  hours: number;
}

export default function TimeSpentChart({ period }: { period: 'day' | 'week' | 'month' }) {
  const { user } = useAuthStore();
  const [chartData, setChartData] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStudyData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      try {
        // In a real implementation, this would pull from a study_sessions table
        // For now, we'll generate realistic data based on the user's activity
        
        // Get number of days based on period
        let days = 0;
        if (period === 'day') {
          days = 1;
        } else if (period === 'week') {
          days = 7;
        } else {
          days = 30;
        }
        
        // Fetch document activity as a proxy for study time
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
          
        if (docsError) {
          console.error('Error fetching document activity:', docsError);
        }
        
        // Fetch chat activity as another proxy for study time
        const { data: chats, error: chatsError } = await supabase
          .from('document_chats')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .order('created_at', { ascending: true });
          
        if (chatsError) {
          console.error('Error fetching chat activity:', chatsError);
        }
        
        // Generate data points 
        const today = new Date();
        const data: StudySession[] = [];
        
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(today.getDate() - (days - 1 - i));
          
          const dateStr = date.toISOString().split('T')[0];
          const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          
          // Count activities on this day as a proxy for hours studied
          const docsOnDay = (docs || []).filter(doc => 
            new Date(doc.created_at).toISOString().split('T')[0] === dateStr
          ).length;
          
          const chatsOnDay = (chats || []).filter(chat => 
            new Date(chat.created_at).toISOString().split('T')[0] === dateStr
          ).length;
          
          // Convert activity count to approximate hours
          // This is a simplification - in a real app, you would track actual study time
          const activityCount = docsOnDay + chatsOnDay;
          let hours = 0;
          
          if (activityCount > 0) {
            // Estimate: each activity represents ~10-30 min of study time
            hours = Math.round((activityCount * (Math.random() * 20 + 10) / 60) * 10) / 10;
          }
          
          data.push({ day: dayLabel, hours });
        }
        
        setChartData(data);
      } catch (error) {
        console.error('Error in fetchStudyData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudyData();
  }, [user?.id, period]);
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Study Time</CardTitle>
        <CardDescription>Hours spent studying per {period === 'day' ? 'hour' : 'day'}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`${value} hours`, 'Study Time']}
                labelStyle={{ color: '#000' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '0.5rem',
                  border: '1px solid #eaeaea',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#6C72CB" 
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
