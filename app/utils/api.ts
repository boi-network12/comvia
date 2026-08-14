

import { BACKEND_URI } from '@/config/api';
import * as SecureStore from 'expo-secure-store';

interface ApiFetchOptions extends RequestInit {
    body?: any;
    signal?: AbortSignal;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache for storing API responses
export async function fetchWithCache<T>(
  key: string,
  url: string,
  opts?: RequestInit
): Promise<T> {
    const cached = await SecureStore.getItemAsync(url);
    if (cached) {
        const { data, ts } = JSON.parse(cached) as { data: T; ts: number };
        if (Date.now() - ts < CACHE_TTL) return data;
    }

    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = (await res.json()) as T;

    await SecureStore.setItemAsync(
        key,
        JSON.stringify({ data: json, ts: Date.now() })
    );
    return json;
}

// Token Refresh Queue to prevent multiple refreshes at the same time
interface QueueItem {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}

let isRefreshing = false;
let fallQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null) => {
    fallQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    fallQueue = [];
};

// central fetch with auth & error
// utils/api.ts - Fixed version
export async function apiFetch<T = any>(
    endpoint: string,
    opts: ApiFetchOptions = {}
): Promise<T> {
    // Fix: Remove leading slash from endpoint and ensure single slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${BACKEND_URI}/api/${cleanEndpoint}`;
    
    console.log('🌐 API Request URL:', url); // Debug log
    
    const headers = new Headers(opts.headers ?? {});

    // set content type if body is present and not already set
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof Array)) {
        headers.set('Content-Type', 'application/json');
        if (typeof opts.body === 'object') {
            opts.body = JSON.stringify(opts.body);
        }
    }

    // Add auth header if token is present
    let accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    let res = await fetch(url, {
        ...opts,
        headers,
        signal: opts.signal,
    });

    // handle 401 - token refresh
    if (
        res.status === 401 &&
        !endpoint.includes('auth/refresh') &&
        !endpoint.includes('auth/login') &&
        !endpoint.includes('auth/register')
    ){
        if (isRefreshing) {
            return new Promise<T>((resolve, reject) => {
                fallQueue.push({
                    resolve: (token: string) => {
                        headers.set('Authorization', `Bearer ${token}`);
                        fetch(url, { ...opts, headers })
                            .then((r) => r.json())
                            .then(resolve)
                            .catch(reject);
                    },
                    reject
                });
            });
        }

        isRefreshing = true;
        try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) throw new Error('No refresh token available');

            const refreshRes = await fetch(`${BACKEND_URI}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // No body needed - cookie is sent automatically
                credentials: 'include', // Important for cookies
            });
            if (!refreshRes.ok) {
                const errBody = await refreshRes.json().catch(() => ({})) as any;
                throw new Error(errBody.message || 'Failed to refresh token');
            }

            const { accessToken: newAccessToken } = (await refreshRes.json()) as {
                accessToken: string;
            };

            if (!newAccessToken || typeof newAccessToken !== 'string') {
                throw new Error("Invalid access token received from refresh endpoint")
            }

            await SecureStore.setItemAsync('accessToken', newAccessToken);
            headers.set('Authorization', `Bearer ${newAccessToken}`);

            processQueue(null, newAccessToken);

            // retry the original request with the new token
            res = await fetch(url, { ...opts, headers });
        } catch (err: any) {
            processQueue(err, null);
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            throw err;
        } finally {
           isRefreshing = false;
        }
    }

    // handle All errors including login
    if (!res.ok) {
        let body: any = null;
        try {
            body = await res.json();
        } catch (error) {
            // ignore JSON parse errors
        }

        const serverMessage = body?.message || body?.error || res.statusText || 'Unknown error';
        const fallbackMessage = `HTTP ${res.status}${res.status === 401 ? ' Unauthorized' : ''}`;
        const message = serverMessage || fallbackMessage;

        const error: any = new Error(message);
        error.status = res.status;
        error.body = body;
        throw error;
    }

    const data = await res.json();
    return data as T;
}

// Human readable error message for API errors
export const handleApiError = (error: any): string => {
  if (error?.body?.message) return error.body.message;
  if (error?.message?.includes('Invalid credentials')) return 'Invalid email or password';
  if (error?.message?.includes('No refresh token')) return 'Session expired. Please log in again.';
  if (error?.message?.includes('Network')) return 'No internet connection';
  if (error?.status === 401) return 'Unauthorized. Please log in.';
  if (error?.status >= 500) return 'Server error. Try again later.';
  return error?.message || 'Something went wrong';
};