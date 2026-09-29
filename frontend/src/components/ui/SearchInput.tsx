import React from 'react';
import { type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className = '', onClear, isLoading, value, ...props }, ref) => {
    return (
      <div className={`relative flex items-center w-full ${className}`}>
        <Search className="absolute left-3 w-4 h-4 text-text-muted" />
        <input
          ref={ref}
          value={value}
          className="flex h-10 w-full rounded border border-border bg-surface pl-9 pr-20 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          {...props}
        />
        <div className="absolute right-3 flex items-center gap-2">
          {isLoading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-text-muted" />}
          {value && onClear && (
            <button onClick={onClear} className="text-text-muted hover:text-text-primary focus:outline-none text-xs font-mono">
              CLEAR
            </button>
          )}
          {!value && !isLoading && (
            <span className="text-xs font-mono text-text-muted border border-border rounded px-1">/</span >
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
