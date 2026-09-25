import React from 'react';
import { type InputHTMLAttributes } from 'react';
import { Label } from './Label';
import { Small } from './Typography';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, description, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label htmlFor={inputId}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`flex h-10 w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? 'border-red-500 focus-visible:ring-red-500' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {description && !error && <Small>{description}</Small>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
