
import { H3, Body, Meta } from './Typography';

export const EmptyState = ({ eyebrow, title, description, action, className = '' }: any) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed border-border bg-surface/50 rounded-sm ${className}`}>
    {eyebrow && <Meta className="mb-2">{eyebrow}</Meta>}
    <H3 className="mb-2">{title}</H3>
    {description && <Body className="max-w-md mb-6">{description}</Body>}
    {action && <div>{action}</div>}
  </div>
);
