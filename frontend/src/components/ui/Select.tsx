import React from 'react';
import { type SelectHTMLAttributes } from 'react';
import { Label } from './Label';
import { Small } from './Typography';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  description?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, description, id, required, options, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label htmlFor={selectId}>
            {label} {required && <span className="text-error">*</span>}
          </Label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`flex h-10 w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? 'border-error focus-visible:ring-error' : ''} ${className}`}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {description && !error && <Small>{description}</Small>}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
