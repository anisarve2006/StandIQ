
import { Mono } from './Typography';

export const Metric = ({ value, label, className = '' }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <div className="text-3xl font-bold tracking-tight text-text-primary">{value}</div>
    <Mono className="text-xs text-text-muted">{label}</Mono>
  </div>
);
