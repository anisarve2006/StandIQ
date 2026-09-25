

export const Card = ({ children, className = '', interactive = false, selected = false, disabled = false, ...props }: any) => {
  const base = "border border-border bg-surface rounded flex flex-col";
  const interact = interactive && !disabled ? "hover:bg-surface-elevated cursor-pointer transition-colors" : "";
  const select = selected ? "border-text-primary" : "";
  const disable = disabled ? "opacity-50 cursor-not-allowed" : "";
  return <div className={`${base} ${interact} ${select} ${disable} ${className}`} {...props}>{children}</div>;
};

export const CardHeader = ({ children, className = '' }: any) => <div className={`p-4 border-b border-border ${className}`}>{children}</div>;
export const CardBody = ({ children, className = '' }: any) => <div className={`p-4 flex-1 ${className}`}>{children}</div>;
export const CardFooter = ({ children, className = '' }: any) => <div className={`p-4 border-t border-border ${className}`}>{children}</div>;
