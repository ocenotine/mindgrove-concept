import { useState, useEffect } from 'react';
import { Play, Download, Flag, Clock, FileText, Lightbulb, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface VideoDigestProcessorProps {
  videoId: string;
  videoUrl: string;
  onProcessComplete?: () => void;
}

interface ProcessingState {
  status: 'idle' | 'transcribing' | 'summarizing' | 'extracting' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface Timestamp {
  time: number;
  text: string;
}

interface VideoDigest {
  transcript: string;
  summary: string;
  keyConcepts: string[];
  timestamps: Timestamp[];
}

export default function VideoDigestProcessor({ 
  videoId, 
  videoUrl,
  onProcessComplete 
}: VideoDigestProcessorProps) {
  const [processing, setProcessing] = useState<ProcessingState>({
    status: 'idle',
    progress: 0
  });
  const [digestData, setDigestData] = useState<VideoDigest | null>(null);
  const { toast } = useToast();

  // Check if video was already processed
  useEffect(() => {
    const checkExistingDigest = async () => {
      try {
        // Use typed query for video_digests table
        const { data, error } = await supabase
          .from('video_digests')
          .select('*')
          .eq('video_id', videoId)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" - not an error in our case
            console.error('Error checking for existing digest:', error);
          }
          return;
        }
        
        if (data) {
          // Parse timestamps to ensure they match the expected format
          let parsedTimestamps: Timestamp[] = [];
          
          if (data.timestamps) {
            // Handle different potential formats of timestamps data
            if (Array.isArray(data.timestamps)) {
              parsedTimestamps = data.timestamps.map((item: any) => ({
                time: typeof item.time === 'number' ? item.time : 0,
                text: typeof item.text === 'string' ? item.text : ''
              }));
            }
          }
          
          setDigestData({
            transcript: data.transcript || '',
            summary: data.summary || '',
            keyConcepts: Array.isArray(data.key_concepts) ? data.key_concepts : [],
            timestamps: parsedTimestamps
          });
          
          setProcessing({
            status: 'completed',
            progress: 100
          });
          
          if (onProcessComplete) onProcessComplete();
        }
      } catch (error) {
        console.error('Error checking for existing digest:', error);
      }
    };
    
    checkExistingDigest();
  }, [videoId, onProcessComplete]);

  const startProcessing = async () => {
    setProcessing({
      status: 'transcribing',
      progress: 5
    });
    
    try {
      // Start processing via edge function that will handle all the steps
      const { data, error } = await supabase.functions.invoke('process-lecture-video', {
        body: { 
          videoId,
          videoUrl
        }
      });
      
      if (error) throw new Error(error.message);
      
      // Set up WebSocket connection to receive real-time updates
      const wsChannel = supabase.channel(`video-processing-${videoId}`)
        .on('presence', { event: 'sync' }, () => {
          console.log('Connected to video processing updates');
        })
        .on('broadcast', { event: 'transcription_progress' }, (payload) => {
          setProcessing({
            status: 'transcribing',
            progress: Math.min(45, 5 + payload.progress * 40)
          });
        })
        .on('broadcast', { event: 'summary_progress' }, (payload) => {
          setProcessing({
            status: 'summarizing',
            progress: Math.min(85, 45 + payload.progress * 40)
          });
        })
        .on('broadcast', { event: 'concepts_progress' }, (payload) => {
          setProcessing({
            status: 'extracting',
            progress: Math.min(95, 85 + payload.progress * 10)
          });
        })
        .on('broadcast', { event: 'processing_complete' }, (payload) => {
          setDigestData(payload.data);
          setProcessing({
            status: 'completed',
            progress: 100
          });
          
          toast({
            title: "Processing complete",
            description: "Your lecture video has been summarized successfully.",
          });
          
          if (onProcessComplete) onProcessComplete();
        })
        .on('broadcast', { event: 'processing_error' }, (payload) => {
          setProcessing({
            status: 'error',
            progress: 0,
            error: payload.error
          });
          
          toast({
            title: "Processing failed",
            description: payload.error || "An error occurred during video processing",
            variant: "destructive",
          });
        })
        .subscribe();
        
      // Clean up the channel on unmount
      return () => {
        supabase.removeChannel(wsChannel);
      };
    } catch (error) {
      console.error('Error starting video processing:', error);
      setProcessing({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred during video processing",
        variant: "destructive",
      });
    }
  };
  
  const renderProcessingStatus = () => {
    switch (processing.status) {
      case 'idle':
        return (
          <div className="text-center p-6">
            <Button onClick={startProcessing}>
              <Play className="mr-2 h-4 w-4" />
              Generate Video Digest
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              This may take several minutes depending on video length
            </p>
          </div>
        );
        
      case 'transcribing':
      case 'summarizing':
      case 'extracting':
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{processing.status}...</span>
              <span>{processing.progress}%</span>
            </div>
            <Progress value={processing.progress} />
            <div className="text-sm text-muted-foreground">
              {processing.status === 'transcribing' && (
                <p className="flex items-center"><FileText className="h-4 w-4 mr-2" /> Converting speech to text</p>
              )}
              {processing.status === 'summarizing' && (
                <p className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Creating concise summary</p>
              )}
              {processing.status === 'extracting' && (
                <p className="flex items-center"><Lightbulb className="h-4 w-4 mr-2" /> Identifying key concepts</p>
              )}
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="bg-destructive/10 p-4 rounded-md">
            <h3 className="font-medium text-destructive flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Processing failed
            </h3>
            <p className="text-sm mt-2">{processing.error || "An unexpected error occurred"}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={startProcessing}
            >
              Try Again
            </Button>
          </div>
        );
        
      case 'completed':
        return renderDigestContent();
    }
  };
  
  const renderDigestContent = () => {
    if (!digestData) return null;
    
    return (
      <div className="space-y-6 p-2">
        {/* Key Concepts */}
        <div>
          <h3 className="text-lg font-medium mb-3">Key Concepts</h3>
          <div className="flex flex-wrap gap-2">
            {digestData.keyConcepts.map((concept, index) => (
              <Badge key={index} variant="outline" className="text-sm py-1.5">
                {concept}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div>
          <h3 className="text-lg font-medium mb-3">Summary</h3>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>{digestData.summary}</p>
          </div>
        </div>
        
        {/* Interactive Timestamps */}
        {digestData.timestamps && digestData.timestamps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Timestamped Highlights</h3>
            <div className="space-y-2">
              {digestData.timestamps.map((item, index) => (
                <div 
                  key={index} 
                  className="p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => {
                    // Handle clicking to jump to this position in the video
                    console.log(`Jump to ${item.time} seconds`);
                  }}
                >
                  <div className="flex">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">
                      {Math.floor(item.time / 60)}:{(item.time % 60).toString().padStart(2, '0')}
                    </span>
                    <p className="ml-2 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </Button>
          
          <Button variant="ghost" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Report Inaccuracy
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-md">
      <div className="bg-muted/30 p-3 border-b">
        <h3 className="font-medium">Lecture Video Digest</h3>
      </div>
      
      <div className="p-4">
        {renderProcessingStatus()}
      </div>
    </div>
  );
}
