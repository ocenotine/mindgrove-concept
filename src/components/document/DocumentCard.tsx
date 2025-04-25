
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Document } from '@/utils/mockData';
import { getDocumentThumbnail, formatFileSize } from '@/utils/documentUtils';
import { Button } from '@/components/ui/button';

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const { title, fileType, createdAt, size = 0 } = document;
  
  const documentIcon = getDocumentThumbnail(fileType);
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex p-4 items-start">
          <div className="h-14 w-14 mr-3 flex-shrink-0">
            <img 
              src={documentIcon} 
              alt={fileType} 
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg truncate pr-2">{title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuItem>Download</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-1 h-3 w-3" />
              <span className="mr-3">{formattedDate}</span>
              <FileText className="mr-1 h-3 w-3" />
              <span>{fileType.toUpperCase()} · {formatFileSize(size)}</span>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {document.summary ? 'Analyzed' : 'Not analyzed'}
            </Badge>
            {document.isShared && (
              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Shared
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}>
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
