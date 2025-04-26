
import React, { useEffect, useState } from 'react';
import InstitutionLayout from '@/components/layout/InstitutionLayout';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Book, 
  Calendar,
  BarChart3, 
  TrendingUp, 
  Clock, 
  FileText,
  Pin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InstitutionData {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  is_premium: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  selar_co_id: string | null;
  branding_colors?: any;
}

const InstitutionDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usageMetrics, setUsageMetrics] = useState({
    totalUsers: 102,
    activeUsers: 78,
    researchProjects: 12,
    documentsProcessed: 347,
    studyHours: 1245,
    daysRemaining: 25, // Premium plan days remaining
  });
  
  // Mock data for charts
  const activityData = [
    { name: 'Jan', value: 42 },
    { name: 'Feb', value: 38 },
    { name: 'Mar', value: 67 },
    { name: 'Apr', value: 78 },
    { name: 'May', value: 51 },
    { name: 'Jun', value: 72 },
    { name: 'Jul', value: 90 }
  ];
  
  const userActivityData = [
    { name: 'Mon', value: 24 },
    { name: 'Tue', value: 32 },
    { name: 'Wed', value: 18 },
    { name: 'Thu', value: 29 },
    { name: 'Fri', value: 43 },
    { name: 'Sat', value: 12 },
    { name: 'Sun', value: 8 }
  ];
  
  const documentTypeData = [
    { name: 'Research', value: 45 },
    { name: 'Lecture Notes', value: 25 },
    { name: 'Assignments', value: 20 },
    { name: 'Other', value: 10 },
  ];
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!user || user.user_metadata?.account_type !== 'institution') {
        navigate('/dashboard');
        return;
      }

      setIsLoading(true);
      try {
        const institutionId = user.user_metadata?.institution_id || user.institution_id;
        
        if (!institutionId) {
          // Instead of showing an error toast, create a default institution record
          const { data: newInstitution, error: createError } = await supabase
            .from('institutions')
            .insert({
              name: user.user_metadata?.institution_name || 'My Institution',
              domain: user.user_metadata?.domain || 'example.edu',
              is_premium: false
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          // Update user metadata with the new institution ID
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              institution_id: newInstitution.id
            }
          });
          
          if (updateError) throw updateError;
          
          setInstitutionData(newInstitution);
        } else {
          // Fetch the institution data
          const { data: institution, error } = await supabase
            .from('institutions')
            .select('*')
            .eq('id', institutionId)
            .single();

          if (error) throw error;
          setInstitutionData(institution);
        }
      } catch (error) {
        console.error('Error fetching institution:', error);
        // Create a fallback institution object instead of showing an error
        setInstitutionData({
          id: 'temp-id',
          name: user.user_metadata?.institution_name || 'My Institution',
          domain: user.user_metadata?.domain || 'example.edu',
          logo_url: null,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          selar_co_id: null,
          branding_colors: {
            primary: '#6C72CB',
            secondary: '#CB69C1',
            accent: '#FEAC5E',
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setUsageMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        documentsProcessed: prev.documentsProcessed + Math.floor(Math.random() * 2),
        studyHours: prev.studyHours + Math.floor(Math.random() * 5),
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  // Get today's date for the calendar
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();

  return (
    <InstitutionLayout>
      <PageTransition>
        <div className="pb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {isLoading ? 'Loading...' : `Welcome to ${institutionData?.name || 'your Institution'} Dashboard`}
            </h1>
            <p className="text-gray-400 mt-1">
              Here's an overview of your institution's activities and metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-200 flex items-center text-sm font-medium">
                  <Users className="mr-2 h-4 w-4 text-indigo-400" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{usageMetrics.totalUsers}</div>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-400">+5%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-200 flex items-center text-sm font-medium">
                  <FileText className="mr-2 h-4 w-4 text-blue-400" />
                  Documents Processed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{usageMetrics.documentsProcessed}</div>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-400">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-200 flex items-center text-sm font-medium">
                  <Book className="mr-2 h-4 w-4 text-purple-400" />
                  Research Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{usageMetrics.researchProjects}</div>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-400">+2</span> new this week
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-200 flex items-center text-sm font-medium">
                  <Clock className="mr-2 h-4 w-4 text-pink-400" />
                  Total Study Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{usageMetrics.studyHours}</div>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-green-400">+24h</span> from yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Activity over time */}
            <Card className="col-span-2 bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Activity Trends</CardTitle>
                <CardDescription className="text-gray-400">
                  Document processing and user engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activityData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#191C27', borderColor: '#333' }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#8884d8' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Document Type Distribution */}
            <Card className="bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Document Types</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution of document categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={documentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {documentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#191C27', borderColor: '#333' }}
                        labelStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar and Premium Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2 bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                  {currentMonth} {currentYear}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Weekly user activity pattern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userActivityData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#aaa" />
                      <YAxis stroke="#aaa" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#191C27', borderColor: '#333' }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#82ca9d' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#82ca9d" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card className="bg-[#191C27] border-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Pin className="mr-2 h-5 w-5 text-amber-400" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-white">
                    {institutionData?.is_premium ? "Premium Plan" : "Basic Plan"}
                  </div>
                  
                  {institutionData?.is_premium ? (
                    <>
                      <div className="mt-2 text-white/80 text-sm">
                        {usageMetrics.daysRemaining} days remaining
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full mt-3">
                        <div 
                          className="h-full bg-white rounded-full" 
                          style={{ width: `${(usageMetrics.daysRemaining / 30) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-4">
                        <button className="w-full bg-white/20 hover:bg-white/30 text-white py-1 rounded transition">
                          Manage Subscription
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2 text-white/80 text-sm">
                      Upgrade to Premium to unlock all features
                      <div className="mt-4">
                        <button 
                          className="w-full bg-white/20 hover:bg-white/30 text-white py-1 rounded transition"
                          onClick={() => navigate('/institution/subscription')}
                        >
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-400">
                  <div className="flex items-center justify-between py-1">
                    <span>Document Processing</span>
                    <span>347/500</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>AI Queries</span>
                    <span>{institutionData?.is_premium ? "Unlimited" : "118/200"}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>User Accounts</span>
                    <span>{institutionData?.is_premium ? "Unlimited" : "102/150"}</span>
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
