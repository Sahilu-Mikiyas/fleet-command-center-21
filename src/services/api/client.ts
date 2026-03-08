const API_BASE = 'https://fleet-management-kzif.onrender.com/api/v1';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  return localStorage.getItem('fleet_token');
}

export function setToken(token: string) {
  localStorage.setItem('fleet_token', token);
}

export function clearToken() {
  localStorage.removeItem('fleet_token');
}

async function parseResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    isFormData?: boolean;
    auth?: boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', body, isFormData = false, auth = true } = options;

  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let requestBody: any;

  if (body) {
    if (isFormData) {
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      requestBody = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: requestBody,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new ApiError(
      data?.message || `Request failed with status ${res.status}`,
      res.status,
      data
    );
  }

  return data as T;
}

export { ApiError };
