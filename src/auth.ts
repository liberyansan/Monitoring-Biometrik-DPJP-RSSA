// =====================================================
// Auth & Crypto Helpers for Cloudflare Workers
// Uses Web Crypto API (no Node.js crypto)
// =====================================================

export async function hashPassword(password: string, salt?: string): Promise<{hash: string, salt: string}> {
  const s = salt || Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join('');
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password + s), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(s), iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('');
  return { hash, salt: s };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const result = await hashPassword(password, salt);
  return result.hash === hash;
}

export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function hashToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(token));
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

export function generateApiKey(): { key: string, prefix: string } {
  const prefix = 'rssa_' + Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2,'0')).join('');
  const secret = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2,'0')).join('');
  return { key: `${prefix}_${secret}`, prefix };
}

export function parseApiKey(key: string): { prefix: string, secret: string } | null {
  const parts = key.split('_');
  if (parts.length < 3 || parts[0] !== 'rssa') return null;
  return { prefix: `${parts[0]}_${parts[1]}`, secret: parts.slice(2).join('_') };
}

export type UserRole = 'super_admin' | 'admin_sdm' | 'admin_dept' | 'viewer';

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin_sdm: 'Admin SDM',
  admin_dept: 'Admin Departemen',
  viewer: 'Viewer',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'],
  admin_sdm: ['cms:employees', 'cms:doctors', 'cms:schedules', 'cms:departments', 'reports:*', 'dashboard:*'],
  admin_dept: ['cms:employees:read', 'cms:schedules:read', 'reports:department', 'dashboard:*'],
  viewer: ['dashboard:*', 'reports:read'],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.some(p => {
    if (p === permission) return true;
    if (p.endsWith(':*') && permission.startsWith(p.replace(':*', ''))) return true;
    return false;
  });
}
