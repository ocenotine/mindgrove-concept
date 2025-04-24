
import React from 'react';
import { useChatContext } from '@/context/ChatContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

const Saved: React.FC = () => {
  const { savedResponses, deleteSavedResponse, sendMessage } = useChatContext();

  const handleAskFollowUp = (query: string) => {
    sendMessage(`Follow-up on: "${query}"`);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Saved Research</h1>
        <p className="text-muted-foreground">
          Your collection of saved responses and research findings.
        </p>
      </div>

      {savedResponses.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-muted inline-block p-4 rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2">No saved responses yet</h2>
          <p className="text-muted-foreground mb-6">
            When you find useful information, save it here for easy reference.
          </p>
          <Button asChild>
            <Link to="/search">
              Start Researching <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {savedResponses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {response.query}
                </CardTitle>
                <CardDescription>{formatDate(response.timestamp)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  {response.content.length > 300
                    ? `${response.content.substring(0, 300)}...`
                    : response.content}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => deleteSavedResponse(response.id)}
                >
                  <Trash size={14} className="mr-1" />
                  Delete
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleAskFollowUp(response.query)}
                >
                  <MessageSquare size={14} className="mr-1" />
                  Ask Follow-up
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
