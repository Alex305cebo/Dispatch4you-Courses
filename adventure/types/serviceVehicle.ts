/**
 * Service Vehicle Types
 * 
 * Defines types for roadside assistance, tow trucks, and mobile mechanics
 * that respond to truck breakdowns in the game.
 */

export type ServiceVehicleType = 'roadside_assist' | 'tow_truck' | 'mobile_mechanic';

export type ServiceVehicleStatus = 
  | 'dispatched'   // Just created, preparing to move
  | 'en_route'     // Moving towards broken truck
  | 'arrived'      // Reached the truck location
  | 'repairing'    // Performing repair work
  | 'towing_back'  // Tow truck taking truck back to garage city
  | 'completed'    // Repair done, ready to be removed
  | 'cancelled';   // Service was cancelled

export interface ServiceVehicle {
  /** Unique identifier */
  id: string;
  
  /** Type of service vehicle */
  type: ServiceVehicleType;
  
  /** Current position [lat, lng] */
  position: [number, number];
  
  /** ID of the truck being serviced */
  targetTruckId: string;
  
  /** City where service originated */
  fromCity: string;
  
  /** Current status */
  status: ServiceVehicleStatus;
  
  /** Route from origin to truck (array of [lat, lng] points) */
  route: [number, number][];
  
  /** Progress along route (0-1) */
  progress: number;
  
  /** Estimated time of arrival (game minutes) */
  eta: number;
  
  /** Service cost in dollars */
  cost: number;
  
  /** Game minute when service was dispatched */
  dispatchedAt: number;
  
  /** Game minute when repair started (if status is 'repairing') */
  repairStartedAt?: number;
  
  /** Duration of repair in game minutes */
  repairDuration: number;

  /** If true — vehicle waits on map, doesn't move until dispatcher closes the modal */
  waitingForDispatch?: boolean;

  /** Route back to garage city (for tow trucks) */
  returnRoute?: [number, number][];
  /** Progress along return route (0-1) */
  returnProgress?: number;
  /** ETA for return trip */
  returnEta?: number;
}

export interface ServiceVehicleConfig {
  type: ServiceVehicleType;
  baseCost: number;
  baseSpeed: number; // mph
  repairDuration: number; // game minutes
  icon: string;
  label: string;
  description: string;
}

/**
 * Configuration for different service vehicle types
 */
export const SERVICE_VEHICLE_CONFIGS: Record<ServiceVehicleType, ServiceVehicleConfig> = {
  roadside_assist: {
    type: 'roadside_assist',
    baseCost: 350,
    baseSpeed: 60, // mph
    repairDuration: 5, // 5 game minutes
    icon: '🚗',
    label: 'Road Assist',
    description: 'Quick roadside repair service',
  },
  tow_truck: {
    type: 'tow_truck',
    baseCost: 800,
    baseSpeed: 45, // mph (slower due to towing)
    repairDuration: 10, // 10 game minutes (includes towing time)
    icon: '🚛',
    label: 'Tow Truck',
    description: 'Tow to nearest repair shop',
  },
  mobile_mechanic: {
    type: 'mobile_mechanic',
    baseCost: 500,
    baseSpeed: 55, // mph
    repairDuration: 3, // 3 game minutes (faster repair)
    icon: '🔧',
    label: 'Mobile Mechanic',
    description: 'Professional mobile repair',
  },
};
