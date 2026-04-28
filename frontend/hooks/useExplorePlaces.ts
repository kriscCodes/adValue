import { useEffect, useMemo, useState } from 'react';

import { BUSINESSES, mergePlaces, type Business } from '@/app/(tabs)/explore-shared';
import { API_BASE } from '@/lib/auth-config';

type PlaceApiRow = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  type: string;
  img: string;
  address?: string;
};

/**
 * Static explore list merged with `/api/explore/places/` (DB-backed test venues).
 */
export function useExplorePlaces(): Business[] {
  const [apiPlaces, setApiPlaces] = useState<Business[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/explore/places/`);
        const data = await res.json();
        if (cancelled || !res.ok) return;
        const list = (data.places ?? []) as PlaceApiRow[];
        setApiPlaces(
          list.map((p) => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lng: p.lng,
            rating: p.rating,
            type: p.type,
            img: p.img,
            ...(p.address ? { address: p.address } : {}),
          }))
        );
      } catch {
        // Offline / API down: fallback to BUSINESSES only via mergePlaces
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => mergePlaces(BUSINESSES, apiPlaces), [apiPlaces]);
}
