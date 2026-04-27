export type Business = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  type: string;
  img: string;
  /** When provided (e.g. from API), shown in detail modal instead of placeholder. */
  address?: string;
};

/** Hunter College Manhattan — main campus (Park Ave / 68 St). Used as default map center for testing. */
export const HUNTER_COLLEGE_CENTER = {
  latitude: 40.768616,
  longitude: -73.964763,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

export const BUSINESSES: Business[] = [
  {
    id: 1,
    name: 'Italian Bistro',
    lat: 40.852,
    lng: -73.895,
    rating: 4.5,
    type: 'Restaurant',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  },
  {
    id: 2,
    name: "Bryan's Bakery",
    lat: 40.862,
    lng: -73.898,
    rating: 4.8,
    type: 'Bakery',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
  },
  {
    id: 3,
    name: 'Hunter college cafeteria',
    lat: 40.768616,
    lng: -73.964763,
    rating: 4.2,
    type: 'Cafeteria',
    img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
    address: '695 Park Ave at E 68 St, New York, NY 10065',
  },
];

/** Prefer API rows when IDs overlap with static fallback data. */
export function mergePlaces(staticList: Business[], apiList: Business[]): Business[] {
  const map = new Map<number, Business>();
  for (const b of staticList) {
    map.set(b.id, b);
  }
  for (const b of apiList) {
    map.set(b.id, b);
  }
  return [...map.values()].sort((a, b) => a.id - b.id);
}
