import React from 'react';
import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 border whitespace-nowrap";
    
    const variants = {
      primary: "bg-text-primary text-background border-transparent hover:bg-text-secondary",
      secondary: "bg-surface text-text-primary border-border hover:bg-surface-elevated",
      ghost: "bg-transparent text-text-primary border-transparent hover:bg-surface-elevated",
      destructive: "bg-transparent text-error border-error/20 hover:bg-error/10",
    };
    
    const sizes = {
      sm: "h-8 px-3 text-sm rounded-sm",
      md: "h-10 px-4 py-2 text-sm rounded",
      lg: "h-12 px-8 text-base rounded",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
