import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE, BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY } from '@/lib/auth-config';

export interface DashboardCreator {
  content_id: number;
  name: string;
  platform: string;
  views: number;
  content_url: string;
  status: string;
  submitted_at: string;
}

export interface DashboardData {
  business_name: string;
  platforms: string[];
  total_views: Record<string, number>;
  views_over_time: { date: string; views: number }[];
  creators: DashboardCreator[];
  active_filters: {
    platform: string | null;
    status: string | null;
    days: number;
  };
}

export interface DashboardFilters {
  platform: string | null;
  status: string | null;
  days: number;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  platform: null,
  status: null,
  days: 30,
};

export function useDashboard(filters: DashboardFilters = DEFAULT_FILTERS) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function fetchDashboard() {
      try {
        const token = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
        if (!token) {
          await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
          router.replace('/');
          return;
        }

        const params = new URLSearchParams();
        if (filters.platform) params.set('platform', filters.platform);
        if (filters.status) params.set('status', filters.status);
        params.set('days', String(filters.days));

        const res = await fetch(
          `${API_BASE}/api/auth/business/dashboard/?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await res.json().catch(() => null);

        const message = String(json?.error ?? json?.detail ?? '').toLowerCase();
        const isTokenIssue =
          res.status === 401 ||
          res.status === 403 ||
          message.includes('token') ||
          message.includes('expired') ||
          message.includes('unauthorized');

        if (isTokenIssue) {
          await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
          router.replace('/');
          return;
        }

        if (!res.ok) {
          if (active) setError('Failed to load dashboard');
          return;
        }
        if (active) setData(json as DashboardData);
      } catch {
        if (active) setError('Network error');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { active = false; };
  }, [filters.platform, filters.status, filters.days]);

  return { data, loading, error };
}
