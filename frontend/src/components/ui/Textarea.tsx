import React from 'react';
import { type TextareaHTMLAttributes } from 'react';
import { Label } from './Label';
import { Small } from './Typography';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, description, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label htmlFor={inputId}>
            {label} {required && <span className="text-error">*</span>}
          </Label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={`flex min-h-[80px] w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? 'border-error focus-visible:ring-error' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {description && !error && <Small>{description}</Small>}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
