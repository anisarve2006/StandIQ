import { useState } from 'react';

export const Tooltip = ({ children, content, className = '' }: any) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`relative inline-flex ${className}`} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}>
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-elevated border border-border rounded-sm text-xs font-mono text-text-primary whitespace-nowrap z-50">
          {content}
        </div>
      )}
    </div>
  );
};
