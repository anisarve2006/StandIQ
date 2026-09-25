
import { Mono } from './Typography';

export const DataList = ({ items, className = '' }: any) => (
  <dl className={`flex flex-col gap-3 ${className}`}>
    {items.map((item: any, i: number) => (
      <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
        <dt className="w-32 shrink-0">
          <Mono className="text-xs text-text-muted">{item.label}</Mono>
        </dt>
        <dd className="text-sm font-medium text-text-primary">{item.value}</dd>
      </div>
    ))}
  </dl>
);
