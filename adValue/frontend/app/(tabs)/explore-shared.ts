export type Business = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  type: string;
  img: string;
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
];
