
import { Mono } from './Typography';

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-surface-elevated rounded-sm ${className}`} />
);

export const LoadingState = ({ message = 'LOADING...', className = '' }: { message?: string, className?: string }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-sm ${className}`}>
    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-text-muted border-t-transparent mb-4" />
    <Mono className="text-text-secondary">{message}</Mono>
  </div>
);
