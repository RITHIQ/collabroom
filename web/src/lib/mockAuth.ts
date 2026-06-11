import type { User, UserRole } from '../types';

/** Stored token when using frontend-only mock auth (no Supabase). */
export const MOCK_AUTH_TOKEN = 'mock-colabroom-token';

/**
 * Offline / no-backend auth for local development.
 * - Default: enabled in `vite dev` (`import.meta.env.DEV`).
 * - Set `VITE_MOCK_AUTH=false` in `.env` to use real Supabase while developing.
 * - Set `VITE_MOCK_AUTH=true` to enable in production builds (e.g. static demos).
 */
export function isMockAuthEnabled(): boolean {
  if (import.meta.env.VITE_MOCK_AUTH === 'false') return false;
  if (import.meta.env.VITE_MOCK_AUTH === 'true') return true;
  return import.meta.env.DEV;
}

/**
 * When true, creators / campaigns / contracts list APIs return local seed data (no Supabase rows needed).
 * - Default: follows mock auth (enabled in `vite dev`).
 * - `VITE_MOCK_CATALOG=true` forces seed data even when mock auth is off.
 * - `VITE_MOCK_CATALOG=false` uses Supabase only.
 */
export function shouldUseMockCatalog(): boolean {
  if (import.meta.env.VITE_MOCK_CATALOG === 'false') return false;
  if (import.meta.env.VITE_MOCK_CATALOG === 'true') return true;
  return isMockAuthEnabled();
}

/** 6-digit code accepted in mock mode for login + registration verify. */
export function getMockOtp(): string {
  const v = (import.meta.env.VITE_MOCK_OTP as string | undefined)?.trim();
  if (v && /^\d{4,8}$/.test(v)) return v;
  return '123456';
}

function stableMockUserId(email: string, role: UserRole): string {
  const s = `${email.toLowerCase()}:${role}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `mock_${(h >>> 0).toString(16)}_${role}`;
}

export function buildMockVerifyResult(email: string, role: UserRole): { token: string; user: User } {
  return {
    token: MOCK_AUTH_TOKEN,
    user: {
      id: stableMockUserId(email, role),
      email,
      role,
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
  };
}
