import React from 'react';
import { H2, Meta } from '../ui/Typography';

interface SectionHeaderProps {
  number?: string;
  title: string;
  actions?: React.ReactNode;
}

export function SectionHeader({ number, title, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
      <div className="flex flex-col gap-1">
        {number && <Meta>{number}</Meta>}
        <H2 className="text-lg uppercase tracking-wide">{title}</H2>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
