
import React from 'react';
import { ArrowRight, BookOpen, GraduationCap, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <Logo size="large" className="mx-auto mb-4" />
        <h1 className="text-4xl font-semibold mb-4">Welcome to Mindgrove</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered research assistant to help you explore knowledge,
          find answers, and deepen your understanding.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Research Assistant</CardTitle>
            <CardDescription>
              Ask questions and get comprehensive, accurate answers backed by the latest knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Simply type your research questions and Mindgrove will analyze relevant sources to provide you with insightful responses.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/search">
                Start Researching <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <BookMarked className="h-8 w-8 text-secondary mb-2" />
            <CardTitle>Knowledge Library</CardTitle>
            <CardDescription>
              Save valuable insights and organize your research findings for easy reference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Maintain a personal library of saved responses and research findings that you can revisit anytime.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/saved">
                View Library <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="bg-muted rounded-lg p-6 text-center">
        <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-semibold mb-2">Ready to explore?</h2>
        <p className="mb-4 text-muted-foreground">
          Begin your research journey with Mindgrove and discover the power of AI-assisted learning.
        </p>
        <Button asChild size="lg">
          <Link to="/search">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
