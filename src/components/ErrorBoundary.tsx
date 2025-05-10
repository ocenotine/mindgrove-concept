
import React from 'react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 bg-card border rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex justify-center">
          <Button onClick={resetErrorBoundary}>Try again</Button>
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => window.location.href = '/'}
          >
            Go to home
          </Button>
        </div>
      </div>
    </div>
  );
}

export const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  onReset?: () => void;
}> = ({ children, onReset }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
