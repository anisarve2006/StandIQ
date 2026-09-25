

export const Table = ({ children, className = '' }: any) => (
  <div className="w-full overflow-auto border border-border rounded-sm">
    <table className={`w-full text-left text-sm ${className}`}>{children}</table>
  </div>
);

export const TableHeader = ({ children, className = '' }: any) => <thead className={`border-b border-border bg-surface-elevated ${className}`}>{children}</thead>;
export const TableRow = ({ children, className = '', selected = false }: any) => <tr className={`border-b border-border last:border-0 hover:bg-surface-elevated transition-colors ${selected ? 'bg-surface-elevated' : ''} ${className}`}>{children}</tr>;
export const TableHead = ({ children, className = '' }: any) => <th className={`p-3 font-mono text-xs uppercase text-text-secondary font-medium tracking-wide ${className}`}>{children}</th>;
export const TableCell = ({ children, className = '' }: any) => <td className={`p-3 text-text-primary ${className}`}>{children}</td>;
