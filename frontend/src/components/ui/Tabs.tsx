import { useState } from 'react';

export const Tabs = ({ tabs, defaultActive, onChange, className = '' }: any) => {
  const [active, setActive] = useState(defaultActive || tabs[0]?.id);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center border-b border-border gap-6 overflow-x-auto" role="tablist">
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            disabled={tab.disabled}
            onClick={() => {
              setActive(tab.id);
              onChange?.(tab.id);
            }}
            className={`pb-2 uppercase font-mono text-xs tracking-wide border-b-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active === tab.id
                ? 'border-text-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-muted'
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4" role="tabpanel">
        {tabs.find((t: any) => t.id === active)?.content}
      </div>
    </div>
  );
};
