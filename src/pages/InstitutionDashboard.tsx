import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';

const InstitutionDashboard: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Institution Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your institution dashboard</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Number of users in your institution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">150</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Courses</CardTitle>
                <CardDescription>Number of active courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Documents</CardTitle>
                <CardDescription>Number of documents uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">320</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default InstitutionDashboard;
