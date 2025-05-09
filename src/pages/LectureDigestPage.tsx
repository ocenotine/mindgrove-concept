
import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, FileText, Lightbulb } from 'lucide-react';
import VideoUploader from '@/components/video/VideoUploader';
import VideoDigestProcessor from '@/components/video/VideoDigestProcessor';
import { useToast } from '@/components/ui/use-toast';

export default function LectureDigestPage() {
  const [uploadedVideo, setUploadedVideo] = useState<{ id: string; url: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const { toast } = useToast();
  
  const handleUploadSuccess = (videoId: string, videoUrl: string) => {
    setUploadedVideo({ id: videoId, url: videoUrl });
    setActiveTab('process');
    
    toast({
      title: "Video uploaded successfully",
      description: "You can now generate a summary digest of your lecture video.",
    });
  };
  
  const handleProcessComplete = () => {
    setActiveTab('digest');
  };
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Lecture Video Digest</h1>
          <p className="text-muted-foreground mt-2 mb-8">
            Upload lecture videos and get AI-generated summaries with key concepts
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-3 max-w-md">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger 
                value="process" 
                className="flex items-center gap-2"
                disabled={!uploadedVideo}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Process</span>
              </TabsTrigger>
              <TabsTrigger 
                value="digest" 
                className="flex items-center gap-2"
                disabled={activeTab !== 'digest'}
              >
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Digest</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Lecture Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoUploader onUploadSuccess={handleUploadSuccess} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="process" className="space-y-4">
              {uploadedVideo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Process Lecture Video</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VideoDigestProcessor 
                      videoId={uploadedVideo.id} 
                      videoUrl={uploadedVideo.url}
                      onProcessComplete={handleProcessComplete}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="digest" className="space-y-4">
              {uploadedVideo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Video Digest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VideoDigestProcessor 
                      videoId={uploadedVideo.id} 
                      videoUrl={uploadedVideo.url} 
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
