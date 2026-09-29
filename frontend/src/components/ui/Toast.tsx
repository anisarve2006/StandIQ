
import { X } from 'lucide-react';
import { Mono } from './Typography';

export const Toast = ({ variant = 'info', message, onClose, className = '' }: any) => {
  const variants = {
    info: 'border-border bg-surface text-text-primary',
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    error: 'border-error/30 bg-error/10 text-error',
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-sm shadow-lg max-w-sm w-full ${variants[variant as keyof typeof variants]} ${className}`}>
      <Mono className="text-xs font-medium">{message}</Mono>
      {onClose && (
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 focus:outline-none cursor-pointer">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
