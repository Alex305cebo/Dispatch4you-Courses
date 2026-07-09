// ═══════════════════════════════════════════════════════
//  routes.ts — популярные маршруты грузоперевозок США
//  Используется для генерации грузов на Load Board
// ═══════════════════════════════════════════════════════

export interface RouteTemplate {
  from: string;
  to: string;
  miles: number;
  baseRate: number; // базовая ставка $
  equipment: 'Dry Van' | 'Reefer' | 'Flatbed';
}

// Реальные популярные маршруты с реалистичными ставками
export const ROUTE_TEMPLATES: RouteTemplate[] = [
  // Southeast
  { from: 'Atlanta', to: 'Charlotte', miles: 244, baseRate: 680, equipment: 'Dry Van' },
  { from: 'Atlanta', to: 'Jacksonville', miles: 346, baseRate: 900, equipment: 'Dry Van' },
  { from: 'Atlanta', to: 'Nashville', miles: 249, baseRate: 700, equipment: 'Dry Van' },
  { from: 'Atlanta', to: 'Miami', miles: 662, baseRate: 1750, equipment: 'Reefer' },
  { from: 'Knoxville', to: 'Atlanta', miles: 180, baseRate: 520, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Nashville', miles: 180, baseRate: 500, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Charlotte', miles: 260, baseRate: 720, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Chattanooga', miles: 112, baseRate: 380, equipment: 'Flatbed' },
  { from: 'Knoxville', to: 'Louisville', miles: 290, baseRate: 780, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Cincinnati', miles: 275, baseRate: 750, equipment: 'Reefer' },
  { from: 'Knoxville', to: 'Chicago', miles: 530, baseRate: 1450, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Dallas', miles: 750, baseRate: 2100, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Miami', miles: 680, baseRate: 1900, equipment: 'Reefer' },
  { from: 'Knoxville', to: 'New York', miles: 690, baseRate: 1850, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Houston', miles: 850, baseRate: 2350, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Los Angeles', miles: 2100, baseRate: 5500, equipment: 'Dry Van' },
  { from: 'Knoxville', to: 'Denver', miles: 1200, baseRate: 3200, equipment: 'Flatbed' },
  { from: 'Knoxville', to: 'Philadelphia', miles: 600, baseRate: 1650, equipment: 'Dry Van' },
  { from: 'Charlotte', to: 'Raleigh', miles: 167, baseRate: 480, equipment: 'Dry Van' },
  { from: 'Nashville', to: 'Memphis', miles: 212, baseRate: 600, equipment: 'Dry Van' },
  { from: 'Jacksonville', to: 'Miami', miles: 347, baseRate: 950, equipment: 'Reefer' },
  { from: 'Savannah', to: 'Atlanta', miles: 248, baseRate: 680, equipment: 'Flatbed' },

  // Texas triangle
  { from: 'Dallas', to: 'Houston', miles: 239, baseRate: 650, equipment: 'Dry Van' },
  { from: 'Dallas', to: 'San Antonio', miles: 274, baseRate: 720, equipment: 'Dry Van' },
  { from: 'Houston', to: 'San Antonio', miles: 197, baseRate: 550, equipment: 'Reefer' },
  { from: 'Dallas', to: 'Austin', miles: 195, baseRate: 560, equipment: 'Dry Van' },
  { from: 'Houston', to: 'New Orleans', miles: 348, baseRate: 920, equipment: 'Dry Van' },
  { from: 'El Paso', to: 'Dallas', miles: 636, baseRate: 1650, equipment: 'Dry Van' },
  { from: 'Dallas', to: 'Oklahoma City', miles: 206, baseRate: 580, equipment: 'Flatbed' },

  // Midwest
  { from: 'Chicago', to: 'Indianapolis', miles: 181, baseRate: 520, equipment: 'Dry Van' },
  { from: 'Chicago', to: 'St. Louis', miles: 297, baseRate: 800, equipment: 'Dry Van' },
  { from: 'Chicago', to: 'Detroit', miles: 282, baseRate: 760, equipment: 'Dry Van' },
  { from: 'Chicago', to: 'Milwaukee', miles: 92, baseRate: 350, equipment: 'Reefer' },
  { from: 'Chicago', to: 'Minneapolis', miles: 408, baseRate: 1100, equipment: 'Dry Van' },
  { from: 'Indianapolis', to: 'Columbus', miles: 175, baseRate: 500, equipment: 'Dry Van' },
  { from: 'St. Louis', to: 'Kansas City', miles: 248, baseRate: 680, equipment: 'Dry Van' },
  { from: 'Columbus', to: 'Cleveland', miles: 143, baseRate: 420, equipment: 'Dry Van' },
  { from: 'Detroit', to: 'Cleveland', miles: 170, baseRate: 490, equipment: 'Flatbed' },

  // Northeast
  { from: 'New York', to: 'Philadelphia', miles: 95, baseRate: 380, equipment: 'Dry Van' },
  { from: 'New York', to: 'Boston', miles: 215, baseRate: 620, equipment: 'Reefer' },
  { from: 'Philadelphia', to: 'Baltimore', miles: 101, baseRate: 380, equipment: 'Dry Van' },
  { from: 'Baltimore', to: 'Washington', miles: 39, baseRate: 250, equipment: 'Dry Van' },
  { from: 'New York', to: 'Newark', miles: 10, baseRate: 200, equipment: 'Dry Van' },
  { from: 'Pittsburgh', to: 'Philadelphia', miles: 305, baseRate: 820, equipment: 'Dry Van' },
  { from: 'Buffalo', to: 'New York', miles: 373, baseRate: 1000, equipment: 'Dry Van' },

  // West Coast
  { from: 'Los Angeles', to: 'San Diego', miles: 120, baseRate: 420, equipment: 'Dry Van' },
  { from: 'Los Angeles', to: 'San Francisco', miles: 382, baseRate: 1050, equipment: 'Reefer' },
  { from: 'Los Angeles', to: 'Phoenix', miles: 373, baseRate: 980, equipment: 'Dry Van' },
  { from: 'Los Angeles', to: 'Las Vegas', miles: 270, baseRate: 750, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Los Angeles', miles: 270, baseRate: 780, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Phoenix', miles: 300, baseRate: 850, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Salt Lake City', miles: 420, baseRate: 1150, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Denver', miles: 750, baseRate: 2050, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Dallas', miles: 1230, baseRate: 3300, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Chicago', miles: 1750, baseRate: 4600, equipment: 'Reefer' },
  { from: 'Las Vegas', to: 'Seattle', miles: 1100, baseRate: 2900, equipment: 'Dry Van' },
  { from: 'Las Vegas', to: 'Portland', miles: 1000, baseRate: 2700, equipment: 'Flatbed' },
  { from: 'San Francisco', to: 'Sacramento', miles: 88, baseRate: 340, equipment: 'Reefer' },
  { from: 'San Francisco', to: 'Portland', miles: 636, baseRate: 1700, equipment: 'Dry Van' },
  { from: 'Portland', to: 'Seattle', miles: 174, baseRate: 500, equipment: 'Dry Van' },
  { from: 'Phoenix', to: 'Tucson', miles: 114, baseRate: 380, equipment: 'Flatbed' },

  // Cross-country (high-value)
  { from: 'Los Angeles', to: 'Dallas', miles: 1435, baseRate: 3800, equipment: 'Dry Van' },
  { from: 'Los Angeles', to: 'Chicago', miles: 2015, baseRate: 5200, equipment: 'Reefer' },
  { from: 'Chicago', to: 'New York', miles: 790, baseRate: 2100, equipment: 'Dry Van' },
  { from: 'Atlanta', to: 'Chicago', miles: 716, baseRate: 1900, equipment: 'Dry Van' },
  { from: 'Dallas', to: 'Atlanta', miles: 781, baseRate: 2050, equipment: 'Dry Van' },
  { from: 'Houston', to: 'Miami', miles: 1187, baseRate: 3100, equipment: 'Reefer' },
  { from: 'Denver', to: 'Chicago', miles: 1003, baseRate: 2650, equipment: 'Dry Van' },
  { from: 'Seattle', to: 'Los Angeles', miles: 1135, baseRate: 3000, equipment: 'Dry Van' },
  { from: 'Phoenix', to: 'Denver', miles: 602, baseRate: 1600, equipment: 'Flatbed' },
  { from: 'Minneapolis', to: 'Denver', miles: 920, baseRate: 2400, equipment: 'Dry Van' },
];

// Товары по типу оборудования
export const COMMODITIES: Record<string, string[]> = {
  'Dry Van': [
    'Electronics', 'Furniture', 'Clothing', 'Auto Parts', 'Paper Products',
    'Household Goods', 'Beverages', 'Canned Food', 'Building Materials',
    'Retail Goods', 'Toys', 'Appliances', 'Packaging', 'Textiles',
  ],
  'Reefer': [
    'Frozen Food', 'Fresh Produce', 'Dairy Products', 'Meat', 'Seafood',
    'Pharmaceuticals', 'Flowers', 'Ice Cream', 'Frozen Vegetables',
  ],
  'Flatbed': [
    'Steel Beams', 'Lumber', 'Machinery', 'Construction Equipment',
    'Pipes', 'Wind Turbine Blades', 'Concrete Blocks', 'Heavy Equipment',
  ],
};

// Additional long routes from major cities (ensures loads everywhere)
export const EXTRA_ROUTES: RouteTemplate[] = [
  { from: 'Phoenix', to: 'Dallas', miles: 1065, baseRate: 2850, equipment: 'Dry Van' },
  { from: 'Phoenix', to: 'Los Angeles', miles: 373, baseRate: 1050, equipment: 'Dry Van' },
  { from: 'Phoenix', to: 'Houston', miles: 1180, baseRate: 3100, equipment: 'Reefer' },
  { from: 'Salt Lake City', to: 'Denver', miles: 525, baseRate: 1450, equipment: 'Dry Van' },
  { from: 'Salt Lake City', to: 'Los Angeles', miles: 690, baseRate: 1850, equipment: 'Dry Van' },
  { from: 'Salt Lake City', to: 'Portland', miles: 770, baseRate: 2100, equipment: 'Flatbed' },
  { from: 'Denver', to: 'Dallas', miles: 780, baseRate: 2100, equipment: 'Dry Van' },
  { from: 'Denver', to: 'Kansas City', miles: 600, baseRate: 1650, equipment: 'Dry Van' },
  { from: 'Denver', to: 'Los Angeles', miles: 1020, baseRate: 2750, equipment: 'Reefer' },
  { from: 'Jacksonville', to: 'Dallas', miles: 970, baseRate: 2600, equipment: 'Dry Van' },
  { from: 'Jacksonville', to: 'Chicago', miles: 880, baseRate: 2400, equipment: 'Dry Van' },
  { from: 'Nashville', to: 'Dallas', miles: 660, baseRate: 1800, equipment: 'Dry Van' },
  { from: 'Nashville', to: 'Chicago', miles: 470, baseRate: 1300, equipment: 'Dry Van' },
  { from: 'Nashville', to: 'Miami', miles: 700, baseRate: 1950, equipment: 'Reefer' },
  { from: 'Charlotte', to: 'New York', miles: 635, baseRate: 1700, equipment: 'Dry Van' },
  { from: 'Charlotte', to: 'Chicago', miles: 760, baseRate: 2050, equipment: 'Dry Van' },
  { from: 'Memphis', to: 'Dallas', miles: 450, baseRate: 1250, equipment: 'Dry Van' },
  { from: 'Memphis', to: 'Chicago', miles: 530, baseRate: 1450, equipment: 'Dry Van' },
  { from: 'Memphis', to: 'Atlanta', miles: 390, baseRate: 1100, equipment: 'Dry Van' },
  { from: 'Columbus', to: 'New York', miles: 540, baseRate: 1500, equipment: 'Dry Van' },
  { from: 'Columbus', to: 'Chicago', miles: 360, baseRate: 1000, equipment: 'Dry Van' },
  { from: 'Indianapolis', to: 'Dallas', miles: 870, baseRate: 2350, equipment: 'Dry Van' },
  { from: 'Indianapolis', to: 'New York', miles: 710, baseRate: 1900, equipment: 'Dry Van' },
  { from: 'Seattle', to: 'Los Angeles', miles: 1135, baseRate: 3000, equipment: 'Dry Van' },
  { from: 'Seattle', to: 'Denver', miles: 1320, baseRate: 3500, equipment: 'Reefer' },
  { from: 'Portland', to: 'Los Angeles', miles: 960, baseRate: 2600, equipment: 'Dry Van' },
  { from: 'Portland', to: 'Salt Lake City', miles: 770, baseRate: 2100, equipment: 'Dry Van' },
];

// Merge all routes
ROUTE_TEMPLATES.push(...EXTRA_ROUTES);
