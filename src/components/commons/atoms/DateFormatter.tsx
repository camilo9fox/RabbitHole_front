import React from 'react';

interface DateFormatterProps {
  timestamp: number;
  format?: 'short' | 'medium' | 'long';
  className?: string;
}

const DateFormatter: React.FC<DateFormatterProps> = ({
  timestamp,
  format = 'medium',
  className = ''
}) => {
  const formatDate = () => {
    const date = new Date(timestamp);
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('es-CL');
      case 'long':
        return date.toLocaleDateString('es-CL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'medium':
      default:
        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };
  
  return (
    <span className={className}>
      {formatDate()}
    </span>
  );
};

export default DateFormatter;
