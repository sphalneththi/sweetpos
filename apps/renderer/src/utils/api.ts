const API_BASE = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('sweetpos-access-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Try refresh token
      const refreshed = await this.tryRefresh();
      if (!refreshed) {
        localStorage.removeItem('sweetpos-access-token');
        localStorage.removeItem('sweetpos-refresh-token');
        localStorage.removeItem('sweetpos-user');
        window.location.reload();
        throw new Error('Session expired');
      }
      throw new Error('RETRY');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error((error as any).message || `HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('sweetpos-refresh-token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as any;
      localStorage.setItem('sweetpos-access-token', data.accessToken);
      localStorage.setItem('sweetpos-refresh-token', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();
