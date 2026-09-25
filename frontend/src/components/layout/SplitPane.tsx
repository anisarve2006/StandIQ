import React from 'react';

interface SplitPaneProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
}

export function SplitPane({ primary, secondary }: SplitPaneProps) {
  return (
    <div className="flex flex-col lg:flex-row w-full gap-8 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {primary}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {secondary}
      </div>
    </div>
  );
}
