// ═══════════════════════════════════════════════════════
//  cities.ts — крупные города США для грузоперевозок
// ═══════════════════════════════════════════════════════
import type { LatLng } from '@/types';

export interface City {
  name: string;
  state: string;
  location: LatLng;
  population: number; // миллионов
}

export const CITIES: City[] = [
  { name: 'Los Angeles', state: 'CA', location: { lat: 34.0522, lng: -118.2437 }, population: 4.0 },
  { name: 'Long Beach', state: 'CA', location: { lat: 33.7701, lng: -118.1937 }, population: 0.5 },
  { name: 'San Diego', state: 'CA', location: { lat: 32.7157, lng: -117.1611 }, population: 1.4 },
  { name: 'San Francisco', state: 'CA', location: { lat: 37.7749, lng: -122.4194 }, population: 0.9 },
  { name: 'Sacramento', state: 'CA', location: { lat: 38.5816, lng: -121.4944 }, population: 0.5 },
  { name: 'Phoenix', state: 'AZ', location: { lat: 33.4484, lng: -112.074 }, population: 1.6 },
  { name: 'Tucson', state: 'AZ', location: { lat: 32.2226, lng: -110.9747 }, population: 0.5 },
  { name: 'Las Vegas', state: 'NV', location: { lat: 36.1699, lng: -115.1398 }, population: 0.65 },
  { name: 'Denver', state: 'CO', location: { lat: 39.7392, lng: -104.9903 }, population: 0.7 },
  { name: 'Salt Lake City', state: 'UT', location: { lat: 40.7608, lng: -111.891 }, population: 0.2 },
  { name: 'Dallas', state: 'TX', location: { lat: 32.7767, lng: -96.797 }, population: 1.3 },
  { name: 'Fort Worth', state: 'TX', location: { lat: 32.7555, lng: -97.3308 }, population: 0.95 },
  { name: 'Houston', state: 'TX', location: { lat: 29.7604, lng: -95.3698 }, population: 2.3 },
  { name: 'Austin', state: 'TX', location: { lat: 30.2672, lng: -97.7431 }, population: 0.98 },
  { name: 'San Antonio', state: 'TX', location: { lat: 29.4241, lng: -98.4936 }, population: 1.55 },
  { name: 'El Paso', state: 'TX', location: { lat: 31.7619, lng: -106.485 }, population: 0.68 },
  { name: 'Oklahoma City', state: 'OK', location: { lat: 35.4676, lng: -97.5164 }, population: 0.65 },
  { name: 'Kansas City', state: 'MO', location: { lat: 39.0997, lng: -94.5786 }, population: 0.5 },
  { name: 'St. Louis', state: 'MO', location: { lat: 38.627, lng: -90.1994 }, population: 0.3 },
  { name: 'Memphis', state: 'TN', location: { lat: 35.1495, lng: -90.049 }, population: 0.63 },
  { name: 'Nashville', state: 'TN', location: { lat: 36.1627, lng: -86.7816 }, population: 0.69 },
  { name: 'Knoxville', state: 'TN', location: { lat: 35.9606, lng: -83.9207 }, population: 0.19 },
  { name: 'Chattanooga', state: 'TN', location: { lat: 35.0456, lng: -85.3097 }, population: 0.18 },
  { name: 'Atlanta', state: 'GA', location: { lat: 33.749, lng: -84.388 }, population: 0.5 },
  { name: 'Savannah', state: 'GA', location: { lat: 32.0809, lng: -81.0912 }, population: 0.14 },
  { name: 'Jacksonville', state: 'FL', location: { lat: 30.3322, lng: -81.6557 }, population: 0.95 },
  { name: 'Miami', state: 'FL', location: { lat: 25.7617, lng: -80.1918 }, population: 0.47 },
  { name: 'Orlando', state: 'FL', location: { lat: 28.5383, lng: -81.3792 }, population: 0.32 },
  { name: 'Tampa', state: 'FL', location: { lat: 27.9506, lng: -82.4572 }, population: 0.4 },
  { name: 'Charlotte', state: 'NC', location: { lat: 35.2271, lng: -80.8431 }, population: 0.9 },
  { name: 'Raleigh', state: 'NC', location: { lat: 35.7796, lng: -78.6382 }, population: 0.47 },
  { name: 'Washington', state: 'DC', location: { lat: 38.9072, lng: -77.0369 }, population: 0.7 },
  { name: 'Baltimore', state: 'MD', location: { lat: 39.2904, lng: -76.6122 }, population: 0.58 },
  { name: 'Philadelphia', state: 'PA', location: { lat: 39.9526, lng: -75.1652 }, population: 1.6 },
  { name: 'Pittsburgh', state: 'PA', location: { lat: 40.4406, lng: -79.9959 }, population: 0.3 },
  { name: 'New York', state: 'NY', location: { lat: 40.7128, lng: -74.006 }, population: 8.3 },
  { name: 'Newark', state: 'NJ', location: { lat: 40.7357, lng: -74.1724 }, population: 0.3 },
  { name: 'Buffalo', state: 'NY', location: { lat: 42.8864, lng: -78.8784 }, population: 0.26 },
  { name: 'Boston', state: 'MA', location: { lat: 42.3601, lng: -71.0589 }, population: 0.68 },
  { name: 'Cleveland', state: 'OH', location: { lat: 41.4993, lng: -81.6944 }, population: 0.37 },
  { name: 'Columbus', state: 'OH', location: { lat: 39.9612, lng: -82.9988 }, population: 0.9 },
  { name: 'Cincinnati', state: 'OH', location: { lat: 39.1031, lng: -84.512 }, population: 0.31 },
  { name: 'Detroit', state: 'MI', location: { lat: 42.3314, lng: -83.0458 }, population: 0.64 },
  { name: 'Chicago', state: 'IL', location: { lat: 41.8781, lng: -87.6298 }, population: 2.7 },
  { name: 'Indianapolis', state: 'IN', location: { lat: 39.7684, lng: -86.1581 }, population: 0.88 },
  { name: 'Milwaukee', state: 'WI', location: { lat: 43.0389, lng: -87.9065 }, population: 0.58 },
  { name: 'Minneapolis', state: 'MN', location: { lat: 44.9778, lng: -93.265 }, population: 0.43 },
  { name: 'Portland', state: 'OR', location: { lat: 45.5152, lng: -122.6784 }, population: 0.65 },
  { name: 'Seattle', state: 'WA', location: { lat: 47.6062, lng: -122.3321 }, population: 0.75 },
];

export function getCityByName(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}

export function randomCity(): City {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
}
