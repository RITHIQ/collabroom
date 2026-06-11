/**
 * Demo admin access: enter this exact value on `/admin/login` to open the dashboard.
 * Set `VITE_ADMIN_DEMO_CODE` in `.env` to change it; rebuild dev server after edits.
 */
const fromEnv = (import.meta.env.VITE_ADMIN_DEMO_CODE as string | undefined)?.trim();

export const ADMIN_DEMO_ACCESS_CODE = fromEnv && fromEnv.length > 0 ? fromEnv : '123456';
