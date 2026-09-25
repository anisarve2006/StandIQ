

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
};

export const Display = ({ children, className = '' }: TypographyProps) => (
  <h1 className={`display font-bold text-text-primary ${className}`}>{children}</h1>
);

export const H1 = ({ children, className = '' }: TypographyProps) => (
  <h1 className={`h1 font-bold text-text-primary ${className}`}>{children}</h1>
);

export const H2 = ({ children, className = '' }: TypographyProps) => (
  <h2 className={`h2 font-bold text-text-primary ${className}`}>{children}</h2>
);

export const H3 = ({ children, className = '' }: TypographyProps) => (
  <h3 className={`h3 font-bold text-text-primary ${className}`}>{children}</h3>
);

export const Body = ({ children, className = '' }: TypographyProps) => (
  <p className={`body text-text-secondary ${className}`}>{children}</p>
);

export const Small = ({ children, className = '' }: TypographyProps) => (
  <p className={`small text-text-secondary ${className}`}>{children}</p>
);

export const Meta = ({ children, className = '' }: TypographyProps) => (
  <span className={`metadata uppercase ${className}`}>{children}</span>
);

export const Mono = ({ children, className = '' }: TypographyProps) => (
  <span className={`mono ${className}`}>{children}</span>
);

export const Code = ({ children, className = '' }: TypographyProps) => (
  <code className={`code ${className}`}>{children}</code>
);
