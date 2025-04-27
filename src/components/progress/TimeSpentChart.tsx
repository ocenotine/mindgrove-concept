
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SubjectTime = {
  day: string;
  Math: number;
  Physics: number;
  History: number;
  Computer: number;
}

export default function TimeSpentChart({ period }: { period: 'day' | 'week' | 'month' }) {
  // Mock data - in a real app, this would come from the database
  const dailyData: SubjectTime[] = [
    { day: 'Mon', Math: 2, Physics: 1, History: 0.5, Computer: 1 },
    { day: 'Tue', Math: 1, Physics: 1.5, History: 1, Computer: 0.5 },
    { day: 'Wed', Math: 0.5, Physics: 0, History: 2, Computer: 1.5 },
    { day: 'Thu', Math: 1.5, Physics: 1, History: 0, Computer: 2 },
    { day: 'Fri', Math: 0, Physics: 2, History: 1.5, Computer: 1 },
    { day: 'Sat', Math: 0, Physics: 0.5, History: 1, Computer: 0 },
    { day: 'Sun', Math: 0.5, Physics: 0.5, History: 0, Computer: 0.5 },
  ];
  
  const weeklyData: SubjectTime[] = [
    { day: 'Week 1', Math: 5, Physics: 4, History: 3, Computer: 2 },
    { day: 'Week 2', Math: 4, Physics: 3, History: 5, Computer: 6 },
    { day: 'Week 3', Math: 6, Physics: 5, History: 4, Computer: 3 },
    { day: 'Week 4', Math: 3, Physics: 6, History: 2, Computer: 5 },
  ];
  
  const monthlyData: SubjectTime[] = [
    { day: 'Jan', Math: 20, Physics: 15, History: 10, Computer: 12 },
    { day: 'Feb', Math: 18, Physics: 20, History: 14, Computer: 15 },
    { day: 'Mar', Math: 15, Physics: 18, History: 20, Computer: 10 },
    { day: 'Apr', Math: 25, Physics: 15, History: 12, Computer: 18 },
  ];
  
  const getPeriodData = () => {
    switch (period) {
      case 'day':
        return dailyData;
      case 'week':
        return weeklyData;
      case 'month':
        return monthlyData;
      default:
        return dailyData;
    }
  };
  
  const data = getPeriodData();
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Time Spent Per Subject</CardTitle>
        <CardDescription>
          Hours spent studying per subject
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => [`${value} hours`, '']}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '0.5rem',
                border: '1px solid #eaeaea',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line type="monotone" dataKey="Math" stroke="#6C72CB" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Physics" stroke="#CB69C1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="History" stroke="#FEAC5E" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Computer" stroke="#4FD1C5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
