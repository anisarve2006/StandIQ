import React from 'react';

export default function PageContainer({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-6 md:p-8 lg:p-12 w-full max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}
