import { Moon } from 'lucide-react';

// ThemeToggle is now a no-op stub — ColabRoom uses HashFame dark mode exclusively.
// Kept as component to avoid import errors in any files that still reference it.
export default function ThemeToggle() {
  return (
    <div
      id="theme-toggle-btn"
      style={{
        width: 34, height: 34, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.25)',
        cursor: 'default',
      }}
      title="Dark mode only"
      aria-label="Dark mode"
    >
      <Moon size={15} />
    </div>
  );
}
