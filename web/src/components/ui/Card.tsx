import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hoverable' | 'stat';
  padding?: number | string;
  children: React.ReactNode;
}

/**
 * Shared Card component — wraps content in the standard card treatment.
 * variant="hoverable" adds lift-on-hover animation.
 * variant="stat" uses the stat-card preset padding.
 */
export default function Card({
  variant = 'default',
  padding,
  children,
  className = '',
  style,
  ...rest
}: CardProps) {
  const baseClass =
    variant === 'hoverable' ? 'card card-hoverable'
    : variant === 'stat'     ? 'card card-stat'
    : 'card';

  const computedPadding =
    padding !== undefined ? padding
    : variant === 'stat' ? undefined  // stat-card has built-in padding
    : 20;

  return (
    <div
      className={`${baseClass} ${className}`}
      style={{ padding: computedPadding, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
