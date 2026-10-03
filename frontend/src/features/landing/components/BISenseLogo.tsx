import React from 'react';

interface BISenseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
}

export const BISenseLogo: React.FC<BISenseLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-slate-900',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-extrabold',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official BISense Geometric Triangle Prism Logo */}
      <img
        src="/logo.png"
        alt="BISense Logo"
        className={`${iconSizes[size]} object-contain shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-2xs`}
        loading="eager"
      />

      {showText && (
        <span className={`tracking-tight ${textColor} ${textSizes[size]}`}>
          BISense
        </span>
      )}
    </div>
  );
};

export default BISenseLogo;
