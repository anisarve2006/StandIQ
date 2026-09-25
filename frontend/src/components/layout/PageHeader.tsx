import React from 'react';
import { H1, Body, Meta } from '../ui/Typography';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  metadata?: string;
}

export function PageHeader({ eyebrow, title, description, actions, metadata }: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
      <div className="flex flex-col gap-2 max-w-2xl">
        {eyebrow && <Meta>{eyebrow}</Meta>}
        <H1>{title}</H1>
        {description && <Body>{description}</Body>}
        {metadata && <Meta className="mt-2 text-text-muted">{metadata}</Meta>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
