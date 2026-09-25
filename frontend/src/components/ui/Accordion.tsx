

export const Accordion = ({ items, className = '' }: any) => {
  return (
    <div className={`flex flex-col border border-border rounded-sm ${className}`}>
      {items.map((item: any, i: number) => (
        <details key={i} className="group border-b border-border last:border-0">
          <summary className="p-4 cursor-pointer font-medium text-text-primary hover:bg-surface-elevated transition-colors list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent relative [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between">
              {item.title}
              <span className="text-text-muted transform group-open:rotate-180 transition-transform">↓</span>
            </span>
          </summary>
          <div className="p-4 pt-0 text-text-secondary border-t border-border mt-1">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
};
