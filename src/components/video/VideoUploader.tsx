
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface VideoUploaderProps {
  onUploadSuccess: (videoId: string, videoUrl: string) => void;
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    // Validate file type
    if (file && (file.type === 'video/mp4' || file.type === 'video/webm')) {
      // Check file size (2GB max)
      if (file.size <= 2 * 1024 * 1024 * 1024) {
        setSelectedFile(file);
      } else {
        toast({
          title: "File too large",
          description: "Video files must be 2GB or smaller",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Invalid file type",
        description: "Only MP4 or WebM video files are accepted",
        variant: "destructive"
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm']
    },
    maxFiles: 1,
    disabled: uploading
  });
  
  const uploadVideo = async () => {
    if (!selectedFile || !user) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `videos/${user.id}/${Date.now()}.${fileExt}`;
      
      // Create upload client with progress tracking
      const { data, error } = await supabase.storage
        .from('lectures')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          }
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lectures')
        .getPublicUrl(filePath);
      
      // Insert video metadata into database
      const { data: videoData, error: dbError } = await supabase
        .from('lecture_videos')
        .insert({
          user_id: user.id,
          file_path: filePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          status: 'uploaded',
          duration_seconds: null, // Will be updated after processing
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      // Success!
      onUploadSuccess(videoData.id, publicUrl);
      
      toast({
        title: "Upload successful",
        description: "Your lecture video has been uploaded and will be processed shortly.",
      });
      
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        <FileVideo className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="font-medium">Drop the video file here...</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop a lecture video, or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">MP4 or WebM, 2GB maximum</p>
          </>
        )}
      </div>
      
      {selectedFile && (
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileVideo className="h-5 w-5" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button 
              onClick={uploadVideo}
              disabled={uploading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
    </div>
  );
}
