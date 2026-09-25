import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link to={item.href} className="text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-text-primary font-medium" : "text-text-secondary"}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-border mx-1">→</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
