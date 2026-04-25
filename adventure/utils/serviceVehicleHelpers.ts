/**
 * Service Vehicle Helper Functions
 * 
 * Utilities for finding nearest cities, calculating routes, ETAs, and costs
 * for roadside assistance services.
 */

import { CITIES } from '../constants/config';
import { ServiceVehicleType, SERVICE_VEHICLE_CONFIGS } from '../types/serviceVehicle';

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest city to a given position
 * @param position [lat, lng]
 * @returns City name
 */
export function findNearestCity(position: [number, number]): string {
  const [lat, lng] = position;
  let nearestCity = 'Knoxville'; // Default fallback
  let minDistance = Infinity;
  
  Object.entries(CITIES).forEach(([cityName, cityPos]) => {
    const distance = calculateDistance(lat, lng, cityPos[0], cityPos[1]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = cityName;
    }
  });
  
  return nearestCity;
}

/**
 * Calculate ETA for service vehicle
 * @param distance Distance in miles
 * @param vehicleType Type of service vehicle
 * @returns ETA in game minutes
 */
export function calculateServiceETA(
  distance: number,
  vehicleType: ServiceVehicleType
): number {
  const config = SERVICE_VEHICLE_CONFIGS[vehicleType];
  const hoursReal = distance / config.baseSpeed;
  
  // Convert real hours to game minutes
  // Game runs at 1 real second = 1 game minute (at 1x speed)
  // So 1 real hour = 60 game minutes
  const gameMinutes = Math.ceil(hoursReal * 60);
  
  return gameMinutes;
}

/**
 * Calculate service cost based on distance and vehicle type
 * @param distance Distance in miles
 * @param vehicleType Type of service vehicle
 * @param timeOfDay Game hour (0-23)
 * @returns Total cost in dollars
 */
export function calculateServiceCost(
  distance: number,
  vehicleType: ServiceVehicleType,
  timeOfDay: number
): number {
  const config = SERVICE_VEHICLE_CONFIGS[vehicleType];
  let cost = config.baseCost;
  
  // Distance surcharge: $1 per mile over 50 miles
  if (distance > 50) {
    cost += (distance - 50) * 1;
  }
  
  // Night surcharge (10pm - 6am): +50%
  if (timeOfDay >= 22 || timeOfDay < 6) {
    cost *= 1.5;
  }
  
  return Math.round(cost);
}

/**
 * Build a simple straight-line route between two points
 * In production, this would call OSRM API for real routing
 * @param from Starting position [lat, lng]
 * @param to Ending position [lat, lng]
 * @returns Array of route points
 */
export function buildSimpleRoute(
  from: [number, number],
  to: [number, number]
): [number, number][] {
  // For now, create a simple interpolated route with 20 points
  // TODO: Replace with actual OSRM API call for real road routing
  const points: [number, number][] = [];
  const steps = 20;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = from[0] + (to[0] - from[0]) * t;
    const lng = from[1] + (to[1] - from[1]) * t;
    points.push([lat, lng]);
  }
  
  return points;
}

/**
 * Get position along route based on progress
 * @param route Array of route points
 * @param progress Progress value (0-1)
 * @returns Current position [lat, lng]
 */
export function getPositionOnRoute(
  route: [number, number][],
  progress: number
): [number, number] {
  if (route.length === 0) return [0, 0];
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];
  
  const index = progress * (route.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  
  if (lowerIndex === upperIndex) {
    return route[lowerIndex];
  }
  
  // Interpolate between two points
  const t = index - lowerIndex;
  const [lat1, lng1] = route[lowerIndex];
  const [lat2, lng2] = route[upperIndex];
  
  return [
    lat1 + (lat2 - lat1) * t,
    lng1 + (lng2 - lng1) * t,
  ];
}

/**
 * Format ETA for display
 * @param minutes ETA in game minutes
 * @returns Formatted string (e.g., "45 min" or "1h 15min")
 */
export function formatETA(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}min`;
}
