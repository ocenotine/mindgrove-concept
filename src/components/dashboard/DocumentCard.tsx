
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common/Card';
import { Clock, FileText, Bookmark } from 'lucide-react';
import { Document } from '@/utils/mockData';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import DocumentMenu from '@/components/document/DocumentMenu';
import { getDocumentThumbnail } from '@/utils/documentUtils';

interface DocumentCardProps {
  document: Document;
  className?: string;
}

const DocumentCard = ({ document, className }: DocumentCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuthStore();
  const [canAccess, setCanAccess] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the user has access to this document
    if (user && document.userId && document.userId !== user.id) {
      setCanAccess(false);
    } else {
      setCanAccess(true);
    }
  }, [user, document.userId]);
  
  // Format the date to show how long ago it was last accessed
  const getLastAccessedTime = () => {
    try {
      return formatDistanceToNow(new Date(document.lastAccessed), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };
  
  // Toggle bookmark state
  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when menu is open
    if (isMenuOpen) {
      e.preventDefault();
    } else {
      navigate(`/document/${document.id}`);
    }
  };

  if (!canAccess) {
    return null; // Don't display documents the user can't access
  }

  return (
    <Link to={`/document/${document.id}`} onClick={handleCardClick}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={`h-full transition-all duration-300 hover:shadow-md ${className}`}
          isHoverable
          isInteractive
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base truncate" title={document.title}>
                {document.title}
              </CardTitle>
              <div className="flex gap-1">
                <button 
                  onClick={toggleBookmark}
                  className={`p-1 rounded-full hover:bg-muted/80 ${isBookmarked ? 'text-yellow-500' : 'text-muted-foreground'}`}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <DocumentMenu 
                  document={document}
                  onOpenChange={setIsMenuOpen}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video mb-3 rounded-md overflow-hidden bg-muted/50 flex items-center justify-center">
              <img 
                src={getDocumentThumbnail(document.fileType)} 
                alt={document.title}
                className="h-16 w-16 object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {document.description || document.summary?.substring(0, 100) || 'No description available'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{document.pages || 1} pages</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getLastAccessedTime()}</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default DocumentCard;
