import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { PageTransition } from '@/components/animations/PageTransition';
import { Mail, Lock, User, ArrowRight, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import ParallaxScroll from '@/components/animations/ParallaxScroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('student');
  
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  const [institutionName, setInstitutionName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [domain, setDomain] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleBackToLanding = () => {
    navigate('/landing');
  };

  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signup(studentEmail, studentPassword, studentName);
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInstitutionSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signup(adminEmail, adminPassword, adminName, {
        accountType: 'institution',
        institutionName,
        domain
      });
      
      toast({
        title: "Institution registration started",
        description: "Please check your email to verify your account and complete setup.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error("Institution signup error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToLanding}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Create an account</h1>
                <p className="text-muted-foreground mt-2">
                  Join MindGrove to elevate your learning experience
                </p>
              </div>
              
              <Tabs 
                defaultValue="student" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="institution">Institution</TabsTrigger>
                </TabsList>
                
                <TabsContent value="student">
                  <Card className="p-6">
                    <form onSubmit={handleStudentSignup} className="space-y-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="text" 
                            placeholder="Full Name" 
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="Email" 
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Password" 
                            value={studentPassword}
                            onChange={(e) => setStudentPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 6 characters
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create student account
                          </span>
                        )}
                      </Button>
                      
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleGoogleLogin}
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </Button>
                      </div>
                    </form>
                  </Card>
                </TabsContent>
                
                <TabsContent value="institution">
                  <Card className="p-6">
                    <form onSubmit={handleInstitutionSignup} className="space-y-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="Institution Name" 
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="Institution Domain (e.g., university.edu)" 
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="Admin Name" 
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            type="email" 
                            placeholder="Admin Email" 
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            type="password" 
                            placeholder="Admin Password" 
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Must be at least 6 characters
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Create institution account"}
                      </Button>
                    </form>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/30 p-12">
            <div className="h-full flex flex-col justify-center">
              <ParallaxScroll direction="up" speed={0.3}>
                <div className="text-center">
                  <img 
                    src="/lovable-uploads/d501d0da-a7b8-48c8-82f1-fea9624331d3.png" 
                    alt="MindGrove AI Research" 
                    className="mx-auto max-w-full h-auto mb-6"
                  />
                  
                  <h2 className="text-3xl font-bold mb-4">
                    {activeTab === "student" ? (
                      "Join thousands of students"
                    ) : (
                      "Empower your institution"
                    )}
                  </h2>
                  
                  <p className="text-lg text-muted-foreground mb-6">
                    {activeTab === "student" ? (
                      "Transform your learning journey with MindGrove's AI-powered tools"
                    ) : (
                      "Gain powerful insights into your institution's research trends"
                    )}
                  </p>
                  
                  <div className="max-w-sm mx-auto grid gap-6">
                    {activeTab === "student" ? (
                      <div className="p-6 rounded-lg bg-card/90 backdrop-blur-sm border shadow-lg">
                        <div className="font-medium mb-2 text-lg">For Students:</div>
                        <ul className="text-sm text-left space-y-2">
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>AI-powered document summarization</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>Automatic flashcard generation</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>Track your study streaks &amp; build habits</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>Always free for students!</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="p-6 rounded-lg bg-card/90 backdrop-blur-sm border shadow-lg">
                        <div className="font-medium mb-2 text-lg">For Institutions:</div>
                        <ul className="text-sm text-left space-y-2">
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>Research collaboration portals</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>Data-driven analytics dashboard</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>AI lecture upgrader with latest research</span>
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                            <span>Customizable branding &amp; design</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </ParallaxScroll>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;
