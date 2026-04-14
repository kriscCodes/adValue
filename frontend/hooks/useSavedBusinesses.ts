import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BUSINESSES, type Business } from '@/app/(tabs)/explore-shared';
import { API_BASE, AUTH_ACCESS_KEY } from '@/lib/auth-config';

type SavedBusinessResponse = {
  business_external_id: number;
};

export function useSavedBusinesses() {
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function loadSaved() {
      try {
        const accessToken = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
        if (!active) return;
        setToken(accessToken || '');
        if (!accessToken) {
          setSavedIds([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/auth/saved-businesses/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setSavedIds([]);
          return;
        }
        const ids = Array.isArray(data.saved_businesses)
          ? (data.saved_businesses as SavedBusinessResponse[])
              .map((item) => item.business_external_id)
              .filter((id) => typeof id === 'number')
          : [];
        setSavedIds(ids);
      } catch {
        if (active) {
          setSavedIds([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSaved();
    return () => {
      active = false;
    };
  }, []);

  const toggleSaved = useCallback(
    async (businessId: number) => {
      if (!token) return;

      const business = BUSINESSES.find((item) => item.id === businessId);
      if (!business) return;

      const currentlySaved = savedIds.includes(businessId);

      setSavedIds((prev) =>
        currentlySaved ? prev.filter((id) => id !== businessId) : [...prev, businessId]
      );

      try {
        if (currentlySaved) {
          const res = await fetch(`${API_BASE}/api/auth/saved-businesses/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ business_external_id: businessId }),
          });
          if (!res.ok) {
            setSavedIds((prev) => (prev.includes(businessId) ? prev : [...prev, businessId]));
          }
        } else {
          const res = await fetch(`${API_BASE}/api/auth/saved-businesses/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              business_external_id: business.id,
              name: business.name,
              type: business.type,
              img: business.img,
              rating: business.rating,
              lat: business.lat,
              lng: business.lng,
            }),
          });
          if (!res.ok) {
            setSavedIds((prev) => prev.filter((id) => id !== businessId));
          }
        }
      } catch {
        setSavedIds((prev) =>
          currentlySaved ? (prev.includes(businessId) ? prev : [...prev, businessId]) : prev.filter((id) => id !== businessId)
        );
      }
    },
    [savedIds, token]
  );

  const isSaved = useCallback((businessId: number) => savedIds.includes(businessId), [savedIds]);

  const savedBusinesses: Business[] = useMemo(
    () => BUSINESSES.filter((business) => savedIds.includes(business.id)),
    [savedIds]
  );

  return {
    loading,
    savedIds,
    savedBusinesses,
    isSaved,
    toggleSaved,
  };
}
