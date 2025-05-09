
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle auth callback logic here
    // For now, just redirect to dashboard
    toast({
      title: "Authentication successful",
      description: "You have been logged in successfully.",
    });
    navigate('/dashboard');
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing authentication...</h1>
        <div className="animate-pulse">Please wait</div>
      </div>
    </div>
  );
};

export default AuthCallback;
