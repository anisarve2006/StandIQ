
import { Mono } from './Typography';

export const StatusIndicator = ({ status, description, className = '' }: any) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-text-primary" />
        <Mono className="text-sm font-medium">{status}</Mono>
      </div>
      {description && <span className="text-xs text-text-muted">{description}</span>}
    </div>
  );
};
