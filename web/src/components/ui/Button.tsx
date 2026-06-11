import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  as?: 'button';
}

/**
 * Shared Button component — maps variant + size to CSS classes.
 * loading state shows a spinner and disables the button.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconOnly = false,
  children,
  className = '',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md';
  const variantClass = `btn-${variant}`;
  const iconClass = iconOnly ? 'btn-icon' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${iconClass} ${className}`}
      disabled={disabled || loading}
      style={style}
      {...rest}
    >
      {loading ? (
        <span style={{
          display: 'inline-block',
          width: size === 'lg' ? 18 : size === 'sm' ? 13 : 15,
          height: size === 'lg' ? 18 : size === 'sm' ? 13 : 15,
          border: '2px solid rgba(255,255,255,0.4)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          {!iconOnly && children}
        </>
      )}
    </button>
  );
}
