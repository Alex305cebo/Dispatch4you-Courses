import { RouteStop } from '../store/gameStore';
import { EVENTS } from './events';

// Chicago → Houston маршрут
export const ROUTE_CHI_HOU: RouteStop[] = [
  { city: 'Chicago', state: 'IL', x: 58, y: 28, event: EVENTS.pickup_chicago },
  { city: 'St. Louis', state: 'MO', x: 55, y: 38, event: EVENTS.hos_stlouis },
  { city: 'Memphis', state: 'TN', x: 57, y: 48, event: EVENTS.breakdown_memphis },
  { city: 'Dallas', state: 'TX', x: 45, y: 62, event: EVENTS.cargo_theft_dallas },
  { city: 'San Antonio', state: 'TX', x: 42, y: 70, event: EVENTS.detention_sanantonio },
  { city: 'Houston', state: 'TX', x: 48, y: 72, event: EVENTS.pod_houston },
];

// LA → Dallas маршрут
export const ROUTE_LA_DAL: RouteStop[] = [
  { city: 'Los Angeles', state: 'CA', x: 8, y: 52, event: EVENTS.pickup_la },
  { city: 'Phoenix', state: 'AZ', x: 18, y: 58, event: EVENTS.tonu_phoenix },
  { city: 'El Paso', state: 'TX', x: 30, y: 65, event: EVENTS.hos_elpaso },
  { city: 'Dallas', state: 'TX', x: 45, y: 62, event: EVENTS.delivery_dallas },
];

// Atlanta → New York маршрут
export const ROUTE_ATL_NY: RouteStop[] = [
  { city: 'Atlanta', state: 'GA', x: 65, y: 58, event: EVENTS.pickup_atlanta },
  { city: 'Charlotte', state: 'NC', x: 68, y: 50, event: EVENTS.broker_dispute },
  { city: 'Washington', state: 'DC', x: 72, y: 40, event: EVENTS.document_check },
  { city: 'New York', state: 'NY', x: 78, y: 30, event: EVENTS.delivery_ny },
];

export const ROUTES: Record<string, RouteStop[]> = {
  'L001': ROUTE_CHI_HOU,
  'L002': ROUTE_LA_DAL,
  'L003': ROUTE_ATL_NY,
};
