const API_BASE = '/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('sweetpos-access-token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error((error as any).message || `HTTP ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { headers: this.getHeaders() });
    return this.handleResponse<T>(r);
  }
  async post<T>(path: string, body?: unknown): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: this.getHeaders(), body: body ? JSON.stringify(body) : undefined });
    return this.handleResponse<T>(r);
  }
  async put<T>(path: string, body?: unknown): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers: this.getHeaders(), body: body ? JSON.stringify(body) : undefined });
    return this.handleResponse<T>(r);
  }
  async delete<T>(path: string): Promise<T> {
    const r = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers: this.getHeaders() });
    return this.handleResponse<T>(r);
  }
}

export const api = new ApiClient();
