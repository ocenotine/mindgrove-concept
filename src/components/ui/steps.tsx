
import React from 'react';
import { cn } from '@/lib/utils';

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function Step({ number, title, children, className }: StepProps) {
  return (
    <div className={cn("relative pl-8 pb-4 pt-1", className)}>
      <div className="absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
        {number}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      {children}
      {/* Line connector */}
      <div className="absolute top-6 bottom-0 left-3 w-px bg-border" />
    </div>
  );
}
