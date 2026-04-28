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
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function redirectHomeForTokenIssue() {
      await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
      router.replace('/');
    }

    async function fetchDashboard() {
      try {
        const token = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
        if (!token) {
          await redirectHomeForTokenIssue();
          return;
        }
        const res = await fetch(`${API_BASE}/api/auth/business/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);

        const message = String(data?.error ?? data?.detail ?? '').toLowerCase();
        const isTokenIssue =
          res.status === 401 ||
          res.status === 403 ||
          message.includes('token') ||
          message.includes('expired') ||
          message.includes('unauthorized') ||
          message.includes('not authenticated');

        if (isTokenIssue) {
          await redirectHomeForTokenIssue();
          return;
        }

        if (!res.ok) {
          if (active) setError('Failed to load dashboard');
          return;
        }
        const json: DashboardData = data as DashboardData;
        if (active) setData(json);
      } catch {
        if (active) setError('Network error');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { active = false; };
  }, []);

  return { data, loading, error };
}
