// ─── TRUCK STOPS & REST AREAS ────────────────────────────────────────────────
// Реальные Truck Stop'ы и Rest Area вдоль основных Interstate США
// Формат: [lng, lat]

export type StopType = 'truck_stop' | 'rest_area';

export interface TruckStop {
  id: string;
  name: string;
  type: StopType;
  position: [number, number]; // [lng, lat]
  highway: string; // I-40, I-80, etc.
  nearCity: string; // ближайший город
  amenities: string[]; // fuel, shower, food, parking
}

export const TRUCK_STOPS: TruckStop[] = [
  // ── I-40 (East-West corridor) ──
  { id: 'TS-001', name: 'Pilot Travel Center', type: 'truck_stop', position: [-117.0, 34.5], highway: 'I-40', nearCity: 'Barstow', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-002', name: 'Flying J', type: 'truck_stop', position: [-114.6, 35.2], highway: 'I-40', nearCity: 'Needles', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-003', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-112.5, 35.2], highway: 'I-40', nearCity: 'Kingman', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-004', name: 'TA Travel Center', type: 'truck_stop', position: [-110.0, 35.2], highway: 'I-40', nearCity: 'Winslow', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-005', name: 'Pilot Travel Center', type: 'truck_stop', position: [-107.8, 35.1], highway: 'I-40', nearCity: 'Gallup', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-006', name: 'Flying J', type: 'truck_stop', position: [-105.0, 35.1], highway: 'I-40', nearCity: 'Santa Rosa', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-007', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-100.4, 35.2], highway: 'I-40', nearCity: 'Shamrock', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-008', name: 'Pilot Travel Center', type: 'truck_stop', position: [-97.5, 35.5], highway: 'I-40', nearCity: 'Oklahoma City', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-009', name: 'TA Travel Center', type: 'truck_stop', position: [-94.8, 35.5], highway: 'I-40', nearCity: 'Fort Smith', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-010', name: 'Flying J', type: 'truck_stop', position: [-92.4, 35.2], highway: 'I-40', nearCity: 'Little Rock', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-011', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-89.8, 35.1], highway: 'I-40', nearCity: 'Memphis', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-012', name: 'Pilot Travel Center', type: 'truck_stop', position: [-87.3, 35.5], highway: 'I-40', nearCity: 'Nashville', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-013', name: 'TA Travel Center', type: 'truck_stop', position: [-84.5, 35.8], highway: 'I-40', nearCity: 'Cookeville', amenities: ['fuel','shower','food','parking'] },

  // ── I-80 (Northern East-West) ──
  { id: 'TS-020', name: 'Pilot Travel Center', type: 'truck_stop', position: [-121.0, 38.6], highway: 'I-80', nearCity: 'Sacramento', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-021', name: 'Flying J', type: 'truck_stop', position: [-119.8, 39.5], highway: 'I-80', nearCity: 'Reno', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-022', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-117.7, 40.6], highway: 'I-80', nearCity: 'Winnemucca', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-023', name: 'TA Travel Center', type: 'truck_stop', position: [-114.0, 40.7], highway: 'I-80', nearCity: 'Wendover', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-024', name: 'Pilot Travel Center', type: 'truck_stop', position: [-111.9, 40.8], highway: 'I-80', nearCity: 'Salt Lake City', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-025', name: 'Flying J', type: 'truck_stop', position: [-109.5, 41.6], highway: 'I-80', nearCity: 'Rock Springs', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-026', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-106.3, 41.1], highway: 'I-80', nearCity: 'Rawlins', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-027', name: 'Pilot Travel Center', type: 'truck_stop', position: [-104.8, 41.1], highway: 'I-80', nearCity: 'Cheyenne', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-028', name: 'TA Travel Center', type: 'truck_stop', position: [-102.0, 41.1], highway: 'I-80', nearCity: 'Sidney', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-029', name: 'Flying J', type: 'truck_stop', position: [-99.8, 41.1], highway: 'I-80', nearCity: 'North Platte', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-030', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-97.4, 41.3], highway: 'I-80', nearCity: 'Lincoln', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-031', name: 'Pilot Travel Center', type: 'truck_stop', position: [-95.9, 41.3], highway: 'I-80', nearCity: 'Omaha', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-032', name: 'TA Travel Center', type: 'truck_stop', position: [-93.6, 41.6], highway: 'I-80', nearCity: 'Des Moines', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-033', name: 'Flying J', type: 'truck_stop', position: [-91.5, 41.7], highway: 'I-80', nearCity: 'Iowa City', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-034', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-89.4, 41.5], highway: 'I-80', nearCity: 'Joliet', amenities: ['fuel','shower','food','parking'] },

  // ── I-10 (Southern East-West) ──
  { id: 'TS-040', name: 'Pilot Travel Center', type: 'truck_stop', position: [-118.2, 34.1], highway: 'I-10', nearCity: 'Los Angeles', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-041', name: 'Flying J', type: 'truck_stop', position: [-115.5, 33.0], highway: 'I-10', nearCity: 'Blythe', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-042', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-112.1, 33.4], highway: 'I-10', nearCity: 'Phoenix', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-043', name: 'TA Travel Center', type: 'truck_stop', position: [-109.9, 32.2], highway: 'I-10', nearCity: 'Tucson', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-044', name: 'Pilot Travel Center', type: 'truck_stop', position: [-106.5, 31.8], highway: 'I-10', nearCity: 'El Paso', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-045', name: 'Flying J', type: 'truck_stop', position: [-103.7, 30.9], highway: 'I-10', nearCity: 'Fort Stockton', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-046', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-100.5, 30.5], highway: 'I-10', nearCity: 'Junction', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-047', name: 'TA Travel Center', type: 'truck_stop', position: [-98.5, 29.4], highway: 'I-10', nearCity: 'San Antonio', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-048', name: 'Pilot Travel Center', type: 'truck_stop', position: [-96.3, 29.8], highway: 'I-10', nearCity: 'Houston', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-049', name: 'Flying J', type: 'truck_stop', position: [-93.9, 30.1], highway: 'I-10', nearCity: 'Beaumont', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-050', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-91.2, 30.5], highway: 'I-10', nearCity: 'Baton Rouge', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-051', name: 'TA Travel Center', type: 'truck_stop', position: [-89.1, 30.4], highway: 'I-10', nearCity: 'Biloxi', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-052', name: 'Pilot Travel Center', type: 'truck_stop', position: [-86.8, 30.7], highway: 'I-10', nearCity: 'Pensacola', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-053', name: 'Flying J', type: 'truck_stop', position: [-84.2, 30.4], highway: 'I-10', nearCity: 'Tallahassee', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-054', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-81.7, 30.3], highway: 'I-10', nearCity: 'Jacksonville', amenities: ['fuel','shower','food','parking'] },

  // ── I-95 (East Coast) ──
  { id: 'TS-060', name: 'Pilot Travel Center', type: 'truck_stop', position: [-80.2, 25.8], highway: 'I-95', nearCity: 'Miami', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-061', name: 'Flying J', type: 'truck_stop', position: [-80.4, 27.5], highway: 'I-95', nearCity: 'Fort Pierce', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-062', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-81.4, 29.2], highway: 'I-95', nearCity: 'Daytona', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-063', name: 'TA Travel Center', type: 'truck_stop', position: [-81.5, 30.8], highway: 'I-95', nearCity: 'Jacksonville', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-064', name: 'Pilot Travel Center', type: 'truck_stop', position: [-81.1, 32.1], highway: 'I-95', nearCity: 'Savannah', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-065', name: 'Flying J', type: 'truck_stop', position: [-80.7, 33.9], highway: 'I-95', nearCity: 'Florence', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-066', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-80.0, 35.7], highway: 'I-95', nearCity: 'Fayetteville', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-067', name: 'TA Travel Center', type: 'truck_stop', position: [-77.4, 37.5], highway: 'I-95', nearCity: 'Richmond', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-068', name: 'Pilot Travel Center', type: 'truck_stop', position: [-76.6, 39.3], highway: 'I-95', nearCity: 'Baltimore', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-069', name: 'Flying J', type: 'truck_stop', position: [-75.2, 39.9], highway: 'I-95', nearCity: 'Philadelphia', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-070', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-74.2, 40.5], highway: 'I-95', nearCity: 'Newark', amenities: ['fuel','shower','food','parking'] },

  // ── I-75 (Midwest to Florida) ──
  { id: 'TS-080', name: 'Pilot Travel Center', type: 'truck_stop', position: [-84.4, 33.8], highway: 'I-75', nearCity: 'Atlanta', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-081', name: 'Flying J', type: 'truck_stop', position: [-84.5, 35.0], highway: 'I-75', nearCity: 'Chattanooga', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-082', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-84.5, 36.6], highway: 'I-75', nearCity: 'Lexington', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-083', name: 'TA Travel Center', type: 'truck_stop', position: [-84.5, 39.1], highway: 'I-75', nearCity: 'Cincinnati', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-084', name: 'Pilot Travel Center', type: 'truck_stop', position: [-83.7, 40.8], highway: 'I-75', nearCity: 'Lima', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-085', name: 'Flying J', type: 'truck_stop', position: [-83.0, 42.3], highway: 'I-75', nearCity: 'Detroit', amenities: ['fuel','shower','food','parking'] },

  // ── I-90 (Northern) ──
  { id: 'TS-090', name: 'Pilot Travel Center', type: 'truck_stop', position: [-122.3, 47.6], highway: 'I-90', nearCity: 'Seattle', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-091', name: 'Flying J', type: 'truck_stop', position: [-120.5, 47.5], highway: 'I-90', nearCity: 'Ellensburg', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-092', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-117.4, 47.7], highway: 'I-90', nearCity: 'Spokane', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-093', name: 'TA Travel Center', type: 'truck_stop', position: [-114.0, 47.5], highway: 'I-90', nearCity: 'Missoula', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-094', name: 'Pilot Travel Center', type: 'truck_stop', position: [-108.5, 45.8], highway: 'I-90', nearCity: 'Billings', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-095', name: 'Flying J', type: 'truck_stop', position: [-104.0, 44.1], highway: 'I-90', nearCity: 'Rapid City', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-096', name: 'Love\'s Travel Stop', type: 'truck_stop', position: [-100.3, 44.4], highway: 'I-90', nearCity: 'Murdo', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-097', name: 'TA Travel Center', type: 'truck_stop', position: [-96.7, 43.5], highway: 'I-90', nearCity: 'Sioux Falls', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-098', name: 'Pilot Travel Center', type: 'truck_stop', position: [-93.1, 44.0], highway: 'I-90', nearCity: 'Albert Lea', amenities: ['fuel','shower','food','parking'] },
  { id: 'TS-099', name: 'Flying J', type: 'truck_stop', position: [-88.0, 42.0], highway: 'I-90', nearCity: 'Chicago', amenities: ['fuel','shower','food','parking'] },

  // ── Rest Areas (Interstate) ──
  { id: 'RA-001', name: 'I-70 Rest Area', type: 'rest_area', position: [-102.5, 38.8], highway: 'I-70', nearCity: 'Colby', amenities: ['parking','restrooms'] },
  { id: 'RA-002', name: 'I-70 Rest Area', type: 'rest_area', position: [-98.3, 38.9], highway: 'I-70', nearCity: 'Salina', amenities: ['parking','restrooms'] },
  { id: 'RA-003', name: 'I-70 Rest Area', type: 'rest_area', position: [-95.2, 39.1], highway: 'I-70', nearCity: 'Kansas City', amenities: ['parking','restrooms'] },
  { id: 'RA-004', name: 'I-70 Rest Area', type: 'rest_area', position: [-91.8, 38.8], highway: 'I-70', nearCity: 'St. Louis', amenities: ['parking','restrooms'] },
  { id: 'RA-005', name: 'I-70 Rest Area', type: 'rest_area', position: [-87.0, 39.8], highway: 'I-70', nearCity: 'Indianapolis', amenities: ['parking','restrooms'] },
  { id: 'RA-006', name: 'I-70 Rest Area', type: 'rest_area', position: [-83.5, 40.0], highway: 'I-70', nearCity: 'Columbus', amenities: ['parking','restrooms'] },
  { id: 'RA-007', name: 'I-81 Rest Area', type: 'rest_area', position: [-80.0, 37.3], highway: 'I-81', nearCity: 'Roanoke', amenities: ['parking','restrooms'] },
  { id: 'RA-008', name: 'I-81 Rest Area', type: 'rest_area', position: [-77.7, 40.2], highway: 'I-81', nearCity: 'Harrisburg', amenities: ['parking','restrooms'] },
  { id: 'RA-009', name: 'I-20 Rest Area', type: 'rest_area', position: [-88.5, 32.4], highway: 'I-20', nearCity: 'Meridian', amenities: ['parking','restrooms'] },
  { id: 'RA-010', name: 'I-20 Rest Area', type: 'rest_area', position: [-85.2, 33.6], highway: 'I-20', nearCity: 'Anniston', amenities: ['parking','restrooms'] },
];

// Найти ближайший Truck Stop к позиции [lng, lat]
export function findNearestTruckStop(
  lng: number,
  lat: number,
  preferType?: StopType
): TruckStop {
  let nearest = TRUCK_STOPS[0];
  let minDist = Infinity;

  for (const stop of TRUCK_STOPS) {
    // Предпочитаем truck_stop над rest_area если указан тип
    const typePenalty = preferType && stop.type !== preferType ? 0.3 : 0;
    const dx = stop.position[0] - lng;
    const dy = stop.position[1] - lat;
    const dist = Math.sqrt(dx * dx + dy * dy) + typePenalty;
    if (dist < minDist) {
      minDist = dist;
      nearest = stop;
    }
  }

  return nearest;
}

// Найти ближайший Truck Stop в радиусе (в градусах, ~1 градус = ~69 миль)
export function findTruckStopsNearby(
  lng: number,
  lat: number,
  radiusDeg: number = 2.0
): TruckStop[] {
  return TRUCK_STOPS.filter(stop => {
    const dx = stop.position[0] - lng;
    const dy = stop.position[1] - lat;
    return Math.sqrt(dx * dx + dy * dy) <= radiusDeg;
  });
}
