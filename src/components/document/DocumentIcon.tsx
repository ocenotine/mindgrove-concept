
import React from 'react';
import { 
  FileText, FileImage, FileVideo, FileAudio, 
  FileCode, FilePen, FileSpreadsheet, FileQuestion, 
  File, FileUp, FileJson, FileWarning, FileKey
} from 'lucide-react';

interface DocumentIconProps {
  fileType?: string;
  className?: string;
  size?: number;
  color?: string;
}

const DocumentIcon: React.FC<DocumentIconProps> = ({ 
  fileType, 
  className = "h-5 w-5",
  size,
  color 
}) => {
  const iconProps = {
    className,
    size: size || undefined,
    color: color || undefined
  };

  // Determine the appropriate icon based on file type
  if (!fileType) {
    return <FileText {...iconProps} />;
  }

  const type = fileType.toLowerCase();
  
  // Image files
  if (type.includes('image') || type.endsWith('png') || type.endsWith('jpg') || 
      type.endsWith('jpeg') || type.endsWith('svg') || type.endsWith('gif') || 
      type.endsWith('webp') || type.endsWith('bmp')) {
    return <FileImage {...iconProps} color={color || "#4C6EF5"} />;
  }
  
  // Video files
  if (type.includes('video') || type.endsWith('mp4') || type.endsWith('mov') || 
      type.endsWith('avi') || type.endsWith('mkv') || type.endsWith('webm')) {
    return <FileVideo {...iconProps} color={color || "#FA5252"} />;
  }
  
  // Audio files
  if (type.includes('audio') || type.endsWith('mp3') || type.endsWith('wav') || 
      type.endsWith('ogg') || type.endsWith('flac') || type.endsWith('aac')) {
    return <FileAudio {...iconProps} color={color || "#BE4BDB"} />;
  }
  
  // Code files
  if (type.includes('code') || type.endsWith('js') || type.endsWith('ts') || 
      type.endsWith('html') || type.endsWith('css') || type.endsWith('jsx') || 
      type.endsWith('tsx') || type.endsWith('php') || type.endsWith('py')) {
    return <FileCode {...iconProps} color={color || "#15AABF"} />;
  }
  
  // Document files
  if (type.endsWith('doc') || type.endsWith('docx') || type.endsWith('rtf') || 
      type.includes('word') || type.includes('document')) {
    return <FilePen {...iconProps} color={color || "#4285f4"} />;
  }
  
  // Spreadsheet files
  if (type.endsWith('xls') || type.endsWith('xlsx') || type.endsWith('csv') || 
      type.includes('sheet') || type.includes('spreadsheet')) {
    return <FileSpreadsheet {...iconProps} color={color || "#21a366"} />;
  }
  
  // PDF files
  if (type.endsWith('pdf') || type.includes('pdf')) {
    return <FileText {...iconProps} color={color || "#ff5733"} />;
  }
  
  // Presentation files
  if (type.endsWith('ppt') || type.endsWith('pptx') || type.includes('presentation') || 
      type.includes('powerpoint') || type.includes('slide')) {
    return <FileQuestion {...iconProps} color={color || "#FF9900"} />;
  }
  
  // Text files
  if (type.endsWith('txt') || type.includes('text/plain') || type.includes('text')) {
    return <FileText {...iconProps} color={color || "#495057"} />;
  }
  
  // JSON files
  if (type.endsWith('json')) {
    return <FileJson {...iconProps} color={color || "#FFB15E"} />;
  }
  
  // Archive files
  if (type.endsWith('zip') || type.endsWith('rar') || type.endsWith('7z') || 
      type.endsWith('tar') || type.endsWith('gz')) {
    return <FileUp {...iconProps} color={color || "#74C0FC"} />;
  }
  
  // Executable files
  if (type.endsWith('exe') || type.endsWith('msi') || type.endsWith('dmg') || 
      type.endsWith('app')) {
    return <FileWarning {...iconProps} color={color || "#F59F00"} />;
  }
  
  // Key/certificate files
  if (type.endsWith('key') || type.endsWith('pem') || type.endsWith('cert') || 
      type.endsWith('crt')) {
    return <FileKey {...iconProps} color={color || "#40C057"} />;
  }
  
  // Default to a generic file icon
  return <File {...iconProps} color={color || "#6C757D"} />;
};

export default DocumentIcon;
