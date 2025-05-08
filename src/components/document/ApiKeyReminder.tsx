
import React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ApiKeyReminder = () => {
  // Always indicate API status is valid since we're using the built-in OpenRouter API key
  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              AI features enabled
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              AI-powered document analysis features are ready to use
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyReminder;
