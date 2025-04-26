
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 128, 
  className = '' 
}) => {
  return (
    <QRCodeSVG 
      value={value} 
      size={size} 
      className={className}
      level="M"
      includeMargin={true}
    />
  );
};

export default QRCodeGenerator;
