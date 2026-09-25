import React from 'react';


export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-mono font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2";
    
    const variants = {
      default: "border-border bg-surface text-text-primary",
      accent: "border-accent/30 bg-accent/10 text-accent",
      success: "border-green-500/30 bg-green-500/10 text-green-500",
      warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
      danger: "border-red-500/30 bg-red-500/10 text-red-500",
      neutral: "border-transparent bg-surface-elevated text-text-secondary",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
