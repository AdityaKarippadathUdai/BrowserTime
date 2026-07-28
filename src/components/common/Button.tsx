import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus:outline-none';

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.16)',
      boxShadow: '0 12px 30px -16px var(--theme-shadow)',
    },
    secondary: {
      backgroundColor: 'var(--theme-surface-strong)',
      color: 'var(--theme-text-secondary)',
      border: '1px solid var(--theme-border)',
      boxShadow: '0 8px 18px -16px var(--theme-shadow)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--theme-text-secondary)',
      border: '1px solid var(--theme-border)',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.16)',
      boxShadow: '0 12px 30px -16px rgba(239, 68, 68, 0.25)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--theme-text-muted)',
      border: '1px solid transparent',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button className={`${base} ${sizes[size]} ${className}`} style={variantStyles[variant]} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
