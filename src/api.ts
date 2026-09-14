// src/api.ts
// Real API Client for Rahe Konkur Student Portal (WordPress REST API)

export class ApiError extends Error {

  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export const BASE = (import.meta as any).env?.VITE_API_BASE || 'https://rahekonkur.ir/wp-json';
export const API_BASE = BASE;
const TOKEN_KEY = 'rksp_token';

const USER_KEY = 'rksp_user';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('rksp_active_student');
      localStorage.removeItem('rksp_active_mentor');
    } catch {}
  },
  getUser: (): any | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: any) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },
};

// Global authentication error handlers (triggered on 401 or 403)
type AuthErrorListener = () => void;
let authErrorListeners: AuthErrorListener[] = [];

export const onAuthError = (callback: AuthErrorListener) => {
  authErrorListeners.push(callback);
  return () => {
    authErrorListeners = authErrorListeners.filter(l => l !== callback);
  };
};

function handleAuthFailure() {
  tokenStorage.remove();
  authErrorListeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('Auth error listener failure:', e);
    }
  });
}

// Convert Persian and Arabic digits to Latin, and normalize to 09xxxxxxxxx
export function normalizeMobile(phone: string): string {
  if (!phone) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let clean = String(phone).trim();
  for (let i = 0; i < 10; i++) {
    clean = clean.split(persianDigits[i]).join(String(i));
    clean = clean.split(arabicDigits[i]).join(String(i));
  }
  // Remove any non-digits
  clean = clean.replace(/\D/g, '');
  // Normalize international prefix
  if (clean.startsWith('0098')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('98') && clean.length === 12) {
    clean = '0' + clean.slice(2);
  } else if (!clean.startsWith('0') && clean.length === 10) {
    clean = '0' + clean;
  }
  return clean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = options.method || 'GET';
  let url = `${BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (options.body && method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(
      err?.message || 'خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
      0,
      'NETWORK_ERROR'
    );
  }

  if (res.status === 401 || res.status === 403) {
    handleAuthFailure();
    let errorData: any = null;
    try {
      errorData = await res.json();
    } catch {}
    throw new ApiError(
      errorData?.message || 'نشست کاربری شما منقضی شده است. لطفاً مجدداً وارد شوید.',
      res.status,
      errorData?.code || 'UNAUTHORIZED',
      errorData
    );
  }

  if (!res.ok) {
    let errorData: any = null;
    try {
      errorData = await res.json();
    } catch {}
    throw new ApiError(
      errorData?.message || `خطای سرور (${res.status})`,
      res.status,
      errorData?.code || 'SERVER_ERROR',
      errorData
    );
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}


// اندپوینت‌های واقعی سامانه راه کنکور
export const api = {
  // احراز هویت
  auth: {
    login: (bodyOrMobile: { mobile: string; password: string } | string, maybePassword?: string) => {
      const mobile = typeof bodyOrMobile === 'string' ? bodyOrMobile : bodyOrMobile.mobile;
      const password = typeof bodyOrMobile === 'string' ? (maybePassword || '') : bodyOrMobile.password;
      return apiRequest<{ token: string; user: any; success?: boolean; message?: string }>('/rkspb/v1/login', {
        method: 'POST',
        body: { mobile: normalizeMobile(mobile), password },
      });
    },
    requestOtp: (mobile: string) =>
      apiRequest<{ success: boolean; message?: string }>('/rkspb/v1/otp/request', {
        method: 'POST',
        body: { mobile: normalizeMobile(mobile) },
      }),
    verifyOtp: (bodyOrMobile: { mobile: string; code?: string; otp?: string } | string, maybeCode?: string) => {
      const mobile = typeof bodyOrMobile === 'string' ? bodyOrMobile : bodyOrMobile.mobile;
      const code = typeof bodyOrMobile === 'string' ? (maybeCode || '') : (bodyOrMobile.code || bodyOrMobile.otp || '');
      return apiRequest<{ token: string; user: any; success?: boolean; message?: string }>('/rkspb/v1/otp/verify', {
        method: 'POST',
        body: { mobile: normalizeMobile(mobile), code: normalizeMobile(code) },
      });
    },
    register: (body: {
      name: string;
      mobile: string;
      password?: string;
      grade?: string;
      major?: string;
      field?: string;
      city?: string;
      mentor_id?: number | string;
    }) =>
      apiRequest<{ token: string; user: any; success?: boolean; message?: string; student_id?: number }>('/rkspb/v1/register', {
        method: 'POST',
        body: {
          ...body,
          mobile: normalizeMobile(body.mobile),
        },
      }),
    registerStudent: (body: any) => api.auth.register(body),
    me: () => apiRequest<{ user: any }>('/rkspb/v1/me'),
    logout: () =>
      apiRequest<{ success: boolean }>('/rkspb/v1/logout', {
        method: 'POST',
      }),
    ping: () => apiRequest<any>('/rkspb/v1/ping'),
  },

  // داده‌های اختصاصی دانش‌آموز (/rksp/v1)
  student: {
    dashboardSummary: () => apiRequest<any>('/rksp/v1/student/dashboard-summary'),
    progressChart: () => apiRequest<any>('/rksp/v1/student/progress-chart'),
    leaderboard: (params?: { period?: string }) =>
      apiRequest<any>('/rksp/v1/student/leaderboard', { params }),
    achievements: () => apiRequest<any[]>('/rksp/v1/student/achievements'),
    milestones: () => apiRequest<any[]>('/rksp/v1/student/milestones'),
    notes: () => apiRequest<any[]>('/rksp/v1/student/notes'),
    plan: () => apiRequest<any>('/rksp/v1/student/plan'),
    channels: () => apiRequest<any[]>('/rksp/v1/channels'),
    quickAccess: () => apiRequest<any>('/rksp/v1/student/quick-access'),
    createStudyLog: (body: {
      minutes: number;
      subject: string;
      topic?: string;
      tests?: number;
      mode?: string;
    }) =>
      apiRequest<any>('/rksp/v1/student/study-log', {
        method: 'POST',
        body,
      }),
    startStudyLog: (body: { subject: string; topic?: string; mode?: string }) =>
      apiRequest<{ session_id: string | number; success: boolean }>(
        '/rksp/v1/student/study-log/start',
        {
          method: 'POST',
          body,
        }
      ),
    heartbeatStudyLog: (body: { session_id: string | number; seconds: number }) =>
      apiRequest<any>('/rksp/v1/student/study-log/heartbeat', {
        method: 'POST',
        body,
      }),
    completeTask: (id: number | string) =>
      apiRequest<any>(`/rksp/v1/student/tasks/${id}/complete`, {
        method: 'POST',
      }),
  },

  // مشاور (/rksp/v1)
  mentor: {
    students: () => apiRequest<any[]>('/rksp/v1/mentor/students'),
    tasks: (body: {
      student_id: number;
      title: string;
      due_date?: string;
      description?: string;
    }) =>
      apiRequest<any>('/rksp/v1/mentor/tasks', {
        method: 'POST',
        body,
      }),
    createTask: (body: {
      student_id: number;
      title: string;
      due_date?: string;
      description?: string;
    }) =>
      apiRequest<any>('/rksp/v1/mentor/tasks', {
        method: 'POST',
        body,
      }),
    notes: (body: {
      student_id: number;
      note: string;
      category?: string;
      visibility?: string;
    }) =>
      apiRequest<any>('/rksp/v1/mentor/notes', {
        method: 'POST',
        body,
      }),
    createNote: (body: {
      student_id: number;
      note: string;
      category?: string;
      visibility?: string;
    }) =>
      apiRequest<any>('/rksp/v1/mentor/notes', {
        method: 'POST',
        body,
      }),
    login: (body: { mobile: string; password?: string }) =>
      apiRequest<any>('/rksp/v1/mentor/login', {
        method: 'POST',
        body: {
          ...body,
          mobile: normalizeMobile(body.mobile),
        },
      }),
  },

  // مدیریت (/rksp/v1)
  admin: {
    assign: (body: { student_id: number; mentor_id: number }) =>
      apiRequest<any>('/rksp/v1/admin/assign', {
        method: 'POST',
        body,
      }),
    assignMentor: (body: { student_id: number; mentor_id: number }) =>
      apiRequest<any>('/rksp/v1/admin/assign', {
        method: 'POST',
        body,
      }),
    registerStudent: (body: any) =>
      apiRequest<any>('/rksp/v1/admin/register-student', {
        method: 'POST',
        body,
      }),
    renewPlan: (body: any) =>
      apiRequest<any>('/rksp/v1/admin/plan/renew', {
        method: 'POST',
        body,
      }),
  },
};
