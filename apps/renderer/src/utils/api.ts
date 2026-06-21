const API_BASE = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('sweetpos-access-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(response: Response, retry?: () => Promise<T>): Promise<T> {
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.tryRefresh();
      if (refreshed && retry) {
        return retry();
      }
      // Refresh failed — clear session and reload
      localStorage.removeItem('sweetpos-access-token');
      localStorage.removeItem('sweetpos-refresh-token');
      localStorage.removeItem('sweetpos-user');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error((error as any).message || `HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('sweetpos-refresh-token');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json() as any;
      localStorage.setItem('sweetpos-access-token', data.accessToken);
      if (data.refreshToken) localStorage.setItem('sweetpos-refresh-token', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(path: string): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { headers: this.getHeaders() });
    return this.handleResponse<T>(r, () => this.get<T>(path));
  }
  async post<T>(path: string, body?: unknown): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: this.getHeaders(), body: body ? JSON.stringify(body) : undefined });
    return this.handleResponse<T>(r, () => this.post<T>(path, body));
  }
  async put<T>(path: string, body?: unknown): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: this.getHeaders(), body: body ? JSON.stringify(body) : undefined });
    return this.handleResponse<T>(r, () => this.put<T>(path, body));
  }
  async delete<T>(path: string): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: this.getHeaders() });
    return this.handleResponse<T>(r, () => this.delete<T>(path));
  }
}

export const api = new ApiClient();
