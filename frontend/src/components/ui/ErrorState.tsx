
import { H3, Body, Mono } from './Typography';
import { Button } from './Button';

export const ErrorState = ({ title = 'DATA UNAVAILABLE', description, onRetry, details, className = '' }: any) => (
  <div className={`flex flex-col items-start p-6 border border-red-500/30 bg-red-500/5 rounded-sm ${className}`}>
    <H3 className="text-red-500 mb-2">{title}</H3>
    {description && <Body className="mb-6">{description}</Body>}
    {details && (
      <div className="w-full p-3 bg-background border border-border rounded-sm mb-6 overflow-x-auto">
        <Mono className="text-xs text-text-muted">{details}</Mono>
      </div>
    )}
    {onRetry && (
      <Button variant="secondary" onClick={onRetry}>RETRY →</Button>
    )}
  </div>
);
