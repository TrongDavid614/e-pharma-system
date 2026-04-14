import { User } from '@/types';

const TOKEN_KEY = 'epharma_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): User | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      username: decoded.sub || decoded.username || '',
      role: decoded.role || decoded.authorities?.[0]?.replace('ROLE_', '') || 'PHARMACIST',
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const exp = decoded.exp;
    if (exp && Date.now() / 1000 > exp) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
