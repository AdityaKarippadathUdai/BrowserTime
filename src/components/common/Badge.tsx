import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const styles: Record<NonNullable<BadgeProps['variant']>, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--theme-surface)',
      color: 'var(--theme-text-secondary)',
      borderColor: 'var(--theme-border)',
    },
    success: {
      backgroundColor: 'rgba(34, 197, 94, 0.12)',
      color: '#4ade80',
      borderColor: 'rgba(74, 222, 128, 0.24)',
    },
    warning: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      color: '#fbbf24',
      borderColor: 'rgba(251, 191, 36, 0.24)',
    },
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      color: '#f87171',
      borderColor: 'rgba(248, 113, 113, 0.24)',
    },
    info: {
      backgroundColor: 'var(--theme-hover)',
      color: 'var(--theme-accent)',
      borderColor: 'var(--theme-border)',
    },
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizes[size]}`}
      style={styles[variant]}
    >
      {children}
    </span>
  );
};
