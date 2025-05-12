
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Book, Calendar, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import DocumentSummary from '@/components/document/DocumentSummary';
import DocumentAI from '@/components/document/DocumentAI';
import DocumentChat from '@/components/document/DocumentChat';
import DocumentIcon from '@/components/document/DocumentIcon';
import { Document } from '@/store/documentStore';
import { supabase } from '@/integrations/supabase/client';

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDocumentById } = useDocuments();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return navigate('/documents');
      
      try {
        setLoading(true);
        const doc = await fetchDocumentById(id);
        
        if (!doc) {
          toast({
            title: "Document not found",
            description: "The requested document could not be found.",
            variant: "destructive",
          });
          navigate('/documents');
          return;
        }
        
        setDocument(doc);
      } catch (error) {
        console.error("Error loading document:", error);
        toast({
          title: "Error loading document",
          description: "There was a problem loading the document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDocument();
  }, [id, navigate, fetchDocumentById]);

  const goBack = () => navigate(-1);
  
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      if (document.file_path) {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(document.file_path);
          
        if (error) throw error;
        
        const url = URL.createObjectURL(data);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.title}`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (document.content) {
        const blob = new Blob([document.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.title}.txt`;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        toast({
          title: "No content available",
          description: "This document has no content to download.",
          variant: "destructive",
        });
      }
      
      toast({
        title: "Download started",
        description: "Your document is being downloaded.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the document.",
        variant: "destructive",
      });
    }
  };

  const handleStudy = () => {
    if (document) {
      navigate(`/flashcards?document=${document.id}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="container mx-auto p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 bg-muted rounded-md"></div>
              <div className="h-4 w-full bg-muted rounded-md"></div>
              <div className="h-4 w-5/6 bg-muted rounded-md"></div>
              <div className="h-80 w-full bg-muted rounded-md"></div>
            </div>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }
  
  if (!document) return null;
  
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{document.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <DocumentIcon fileType={document.file_type} className="mr-1 h-4 w-4" />
                    {document.file_type || "Text Document"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Created {getTimeAgo(document.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Updated {getTimeAgo(document.updated_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button onClick={handleStudy}>
                  <Book className="mr-2 h-4 w-4" /> Study
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6">
              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Document Content</h2>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {document.content ? (
                    <div className="whitespace-pre-line">{document.content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">No content available for this document.</p>
                  )}
                </div>
              </div>
              
              <DocumentSummary document={document} />
            </div>
            
            <div className="xl:col-span-4 space-y-6">
              <DocumentAI 
                documentId={document.id} 
                documentText={document.content || ""} 
              />
              
              <DocumentChat 
                documentId={document.id} 
                documentText={document.content || ""} 
              />
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
