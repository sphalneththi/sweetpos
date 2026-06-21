import { create } from 'zustand';
import { UserRole } from '@sweetpos/shared-types';

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';

  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  theme: (localStorage.getItem('sweetpos-theme') as 'dark' | 'light') || 'dark',

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('sweetpos-access-token', accessToken);
    localStorage.setItem('sweetpos-refresh-token', refreshToken);
    localStorage.setItem('sweetpos-user', JSON.stringify(user));
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('sweetpos-access-token');
    localStorage.removeItem('sweetpos-refresh-token');
    localStorage.removeItem('sweetpos-user');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('sweetpos-access-token', accessToken);
    localStorage.setItem('sweetpos-refresh-token', refreshToken);
    set({ accessToken, refreshToken });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sweetpos-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    set({ theme: newTheme });
  },
}));

// Initialize theme on load
const storedTheme = localStorage.getItem('sweetpos-theme') || 'dark';
document.documentElement.setAttribute('data-theme', storedTheme);

// Restore session from localStorage
const storedUser = localStorage.getItem('sweetpos-user');
const storedAccessToken = localStorage.getItem('sweetpos-access-token');
const storedRefreshToken = localStorage.getItem('sweetpos-refresh-token');

if (storedUser && storedAccessToken) {
  try {
    const user = JSON.parse(storedUser);
    useAuthStore.getState().login(user, storedAccessToken, storedRefreshToken || '');
  } catch {
    // Invalid stored data, clear it
    localStorage.removeItem('sweetpos-user');
    localStorage.removeItem('sweetpos-access-token');
    localStorage.removeItem('sweetpos-refresh-token');
  }
}
