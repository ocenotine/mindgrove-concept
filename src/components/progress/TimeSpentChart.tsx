
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
        // Get number of days based on period
        let days = 0;
        if (period === 'day') {
          days = 1;
        } else if (period === 'week') {
          days = 7;
        } else {
          days = 30;
        }
        
        // Start date based on period
        const now = new Date();
        let startDate = new Date();
        
        if (period === 'day') {
          startDate.setHours(0, 0, 0, 0); // Start of today
        } else if (period === 'week') {
          startDate.setDate(now.getDate() - 7); // Last 7 days
        } else if (period === 'month') {
          startDate.setMonth(now.getMonth() - 1); // Last 30 days
        }
        
        const startDateStr = startDate.toISOString();
        
        // Fetch document activity
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDateStr)
          .order('created_at', { ascending: true });
          
        if (docsError) {
          console.error('Error fetching document activity:', docsError);
        }
        
        // Fetch chat activity 
        const { data: chats, error: chatsError } = await supabase
          .from('document_chats')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('role', 'user')
          .gte('created_at', startDateStr)
          .order('created_at', { ascending: true });
          
        if (chatsError) {
          console.error('Error fetching chat activity:', chatsError);
        }
        
        // Fetch quiz activity 
        const { data: quizzes, error: quizzesError } = await supabase
          .from('quizzes')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startDateStr)
          .order('created_at', { ascending: true });
          
        if (quizzesError) {
          console.error('Error fetching quiz activity:', quizzesError);
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
          
          // Count activities on this day
          const docsOnDay = (docs || []).filter(doc => 
            new Date(doc.created_at).toISOString().split('T')[0] === dateStr
          ).length;
          
          const chatsOnDay = (chats || []).filter(chat => 
            new Date(chat.created_at).toISOString().split('T')[0] === dateStr
          ).length;
          
          const quizzesOnDay = (quizzes || []).filter(quiz => 
            new Date(quiz.created_at).toISOString().split('T')[0] === dateStr
          ).length;
          
          // Convert activity count to approximate hours
          const activityCount = docsOnDay + chatsOnDay + quizzesOnDay;
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
