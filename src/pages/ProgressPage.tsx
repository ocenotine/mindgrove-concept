
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Clock } from 'lucide-react';
import CoursePerformanceChart from '@/components/progress/CoursePerformanceChart';
import TimeSpentChart from '@/components/progress/TimeSpentChart';
import WellbeingTracker from '@/components/progress/WellbeingTracker';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';

export default function ProgressPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const { user } = useAuthStore();
  const { documents } = useDocuments();
  
  // Real data from user account
  const studyTime = user?.study_hours || 0;
  const flashcardsReviewed = user?.flashcard_count || 0;
  const documentsStudied = documents?.length || 0;
  const dailyStreak = user?.streak_count || 0;
  
  const handleExport = (format: 'pdf' | 'csv') => {
    toast({
      title: `Exporting ${format.toUpperCase()}`,
      description: `Your progress data is being exported as ${format.toUpperCase()}.`,
    });
  };
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Progress Tracking</h1>
              <p className="text-muted-foreground">
                Monitor your learning progress and study habits
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="bg-background/80 p-1 rounded-lg border">
              <Button
                variant={period === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('day')}
                className="rounded-lg"
              >
                Today
              </Button>
              <Button
                variant={period === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('week')}
                className="rounded-lg"
              >
                This Week
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod('month')}
                className="rounded-lg"
              >
                This Month
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Daily Streak</CardDescription>
                <CardTitle className="text-4xl font-bold">{dailyStreak} days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep up the good work!
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Study Time</CardDescription>
                <CardTitle className="text-4xl font-bold">{studyTime} hrs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This {period}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Flashcards Reviewed</CardDescription>
                <CardTitle className="text-4xl font-bold">{flashcardsReviewed}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This {period}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Documents Studied</CardDescription>
                <CardTitle className="text-4xl font-bold">{documentsStudied}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This {period}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <CoursePerformanceChart period={period} />
            <TimeSpentChart period={period} />
          </div>
          
          <div className="mb-8">
            <Tabs defaultValue="wellbeing">
              <TabsList>
                <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
                <TabsTrigger value="study-habits">Study Habits</TabsTrigger>
              </TabsList>
              <TabsContent value="wellbeing" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                      <CardTitle>Wellbeing Tracker</CardTitle>
                      <CardDescription>
                        Track your focus and stress levels to build better study habits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <WellbeingTracker />
                        
                        <div>
                          <h3 className="font-medium mb-2">Weekly Trends</h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Focus</span>
                                <span className="text-sm font-medium">65%</span>
                              </div>
                              <Progress value={65} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Stress Management</span>
                                <span className="text-sm font-medium">78%</span>
                              </div>
                              <Progress value={78} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Break Compliance</span>
                                <span className="text-sm font-medium">45%</span>
                              </div>
                              <Progress value={45} className="h-2" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                          <h3 className="font-medium mb-2">Wellbeing Insights</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Your focus is highest on Tuesdays and Thursdays - consider scheduling important study sessions then.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>You've only taken 12 out of 20 suggested breaks this week. Regular breaks can help maintain focus.</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Your stress levels tend to rise mid-week. Consider adding relaxation exercises on Wednesdays.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="study-habits" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Optimal Study Times</CardTitle>
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-primary/5 p-3 rounded-md">
                          <p className="text-sm font-medium">Best time to study</p>
                          <p className="text-xl font-bold">9:00 AM - 11:30 AM</p>
                        </div>
                        <div className="bg-secondary/5 p-3 rounded-md">
                          <p className="text-sm font-medium">Secondary peak time</p>
                          <p className="text-xl font-bold">4:00 PM - 6:00 PM</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Based on your focus data over the past 30 days</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Study Location Impact</CardTitle>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Library</span>
                          <span className="text-sm font-medium">95%</span>
                        </div>
                        <Progress value={95} className="h-2" indicatorClassName="bg-green-500" />
                        
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Home Desk</span>
                          <span className="text-sm font-medium">82%</span>
                        </div>
                        <Progress value={82} className="h-2" indicatorClassName="bg-blue-500" />
                        
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Coffee Shop</span>
                          <span className="text-sm font-medium">67%</span>
                        </div>
                        <Progress value={67} className="h-2" indicatorClassName="bg-yellow-500" />
                        
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Living Room</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <Progress value={45} className="h-2" indicatorClassName="bg-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Study Technique Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 rounded-md border">
                          <p className="text-sm font-medium">Most Effective</p>
                          <p className="text-lg">Pomodoro Technique</p>
                          <p className="text-xs text-muted-foreground">85% productive sessions</p>
                        </div>
                        <div className="p-3 rounded-md border">
                          <p className="text-sm font-medium">Least Effective</p>
                          <p className="text-lg">Marathon Sessions</p>
                          <p className="text-xs text-muted-foreground">32% productive sessions</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          View Full Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
