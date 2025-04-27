
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
  const [documentCount, setDocumentCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch real data counts from Supabase
    const fetchActivityData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Get time period filter
        const now = new Date();
        let startDate = new Date();
        
        if (period === 'day') {
          startDate.setHours(0, 0, 0, 0); // Start of today
        } else if (period === 'week') {
          startDate.setDate(now.getDate() - 7); // Last 7 days
        } else if (period === 'month') {
          startDate.setMonth(now.getMonth() - 1); // Last 30 days
        }
        
        const startDateIso = startDate.toISOString();
        
        // Fetch AI chat count
        const { count: chatCount, error: chatError } = await supabase
          .from('document_chats')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('role', 'user')
          .gte('created_at', startDateIso);
        
        if (chatError) {
          console.error('Error fetching AI chat count:', chatError);
        } else {
          setAiChatCount(chatCount || 0);
        }
        
        // Fetch document count
        const { count: docsCount, error: docsError } = await supabase
          .from('documents')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startDateIso);
        
        if (docsError) {
          console.error('Error fetching document count:', docsError);
        } else {
          setDocumentCount(docsCount || 0);
        }
        
        // Fetch flashcard count
        const { count: cardsCount, error: cardsError } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startDateIso);
        
        if (cardsError) {
          console.error('Error fetching flashcard count:', cardsError);
        } else {
          setFlashcardCount(cardsCount || 0);
        }
      } catch (error) {
        console.error('Error in fetchActivityData:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityData();
  }, [user?.id, period]);
  
  // Create data array for chart
  const data: PerformanceData[] = [
    { name: 'Documents', value: documentCount, color: '#6C72CB' },
    { name: 'Flashcards', value: flashcardCount, color: '#CB69C1' },
    { name: 'AI Chats', value: aiChatCount, color: '#FEAC5E' },
  ];
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Course Performance</CardTitle>
        <CardDescription>
          Your activity summary for this {period}
          {isLoading && ' (Loading...)'}
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
