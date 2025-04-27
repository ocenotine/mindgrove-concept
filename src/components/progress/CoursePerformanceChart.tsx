
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

type PerformanceData = {
  name: string;
  value: number;
  color: string;
}

export default function CoursePerformanceChart({ period }: { period: 'day' | 'week' | 'month' }) {
  const { user } = useAuthStore();
  const [aiChatCount, setAiChatCount] = useState(0);
  
  useEffect(() => {
    // Fetch AI chat count from document_chats table
    const fetchAiChatCount = async () => {
      if (!user?.id) return;
      
      try {
        let query = supabase
          .from('document_chats')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('role', 'user');
        
        // Apply period filter
        const now = new Date();
        let startDate = new Date();
        
        if (period === 'day') {
          startDate.setHours(0, 0, 0, 0); // Start of today
        } else if (period === 'week') {
          startDate.setDate(now.getDate() - 7); // Last 7 days
        } else if (period === 'month') {
          startDate.setMonth(now.getMonth() - 1); // Last 30 days
        }
        
        query = query.gte('created_at', startDate.toISOString());
        
        const { count, error } = await query;
        
        if (error) {
          console.error('Error fetching AI chat count:', error);
          return;
        }
        
        setAiChatCount(count || 0);
      } catch (error) {
        console.error('Error in fetchAiChatCount:', error);
      }
    };
    
    fetchAiChatCount();
  }, [user?.id, period]);
  
  // Real data based on user stats
  const data: PerformanceData[] = [
    { name: 'Documents', value: user?.document_count || 0, color: '#6C72CB' },
    { name: 'Flashcards', value: user?.flashcard_count || 0, color: '#CB69C1' },
    { name: 'AI Chats', value: aiChatCount, color: '#FEAC5E' },
  ];
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Course Performance</CardTitle>
        <CardDescription>
          Your activity summary for this {period}
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} activities`, 'Count']}
              labelStyle={{ color: '#000' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '0.5rem',
                border: '1px solid #eaeaea',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              barSize={40}
            >
              {data.map((entry, index) => (
                <rect key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
