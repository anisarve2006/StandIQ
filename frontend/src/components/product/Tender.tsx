import { Mono, Body } from '../ui/Typography';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Button } from '../ui/Button';

export const RequirementRow = ({ index, parameter, value, status }: any) => {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0 hover:bg-surface transition-colors">
      <Mono className="text-text-muted shrink-0 w-8">{index.toString().padStart(2, '0')}</Mono>
      <Body className="text-sm flex-1 min-w-0">{parameter}</Body>
      <div className="w-1/3 shrink-0">
        {value === '—' ? <Mono className="text-text-muted text-sm">—</Mono> : <Mono className="text-sm text-text-primary">{value}</Mono>}
      </div>
      <div className="w-24 shrink-0 flex justify-end">
        <StatusIndicator status={status} />
      </div>
    </div>
  );
};

export const FindingRow = ({ status, title, description, actionLabel, onAction }: any) => {
  return (
    <div className="flex flex-col gap-3 p-4 border border-border bg-surface rounded-sm">
      <div className="flex items-start justify-between">
        <StatusIndicator status={status} />
        {onAction && (
          <Button variant="ghost" size="sm" onClick={onAction} className="px-0 h-auto py-0 uppercase text-xs font-mono text-accent">
            {actionLabel} →
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Mono className="text-sm font-bold text-text-primary">{title}</Mono>
        <Body className="text-sm text-text-secondary">{description}</Body>
      </div>
    </div>
  );
};
