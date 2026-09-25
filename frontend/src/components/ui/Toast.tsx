
import { Mono } from './Typography';

export const Toast = ({ variant = 'info', message, onClose, className = '' }: any) => {
  const variants = {
    info: 'border-border bg-surface text-text-primary',
    success: 'border-green-500/30 bg-green-500/10 text-green-500',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500',
    error: 'border-red-500/30 bg-red-500/10 text-red-500',
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-sm shadow-lg max-w-sm w-full ${variants[variant as keyof typeof variants]} ${className}`}>
      <Mono className="text-xs font-medium">{message}</Mono>
      {onClose && (
        <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 focus:outline-none">✕</button>
      )}
    </div>
  );
};
