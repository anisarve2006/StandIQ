import React from 'react';
import { type LabelHTMLAttributes } from 'react';

export const Label = React.forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`label block ${className}`}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";
