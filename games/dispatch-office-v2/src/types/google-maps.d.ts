// Google Maps JS API - минимальные типы для нашего использования
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }

  namespace google.maps {
    class Map {
      constructor(el: HTMLElement, options: MapOptions);
      setCenter(latLng: LatLngLiteral): void;
      setZoom(zoom: number): void;
      panTo(latLng: LatLngLiteral): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(latLng: LatLngLiteral): void;
      setMap(map: Map | null): void;
      setIcon(icon: any): void;
      setZIndex(zIndex: number): void;
      addListener(event: string, handler: () => void): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
      setPath(path: LatLngLiteral[]): void;
    }

    class DirectionsService {
      route(
        request: DirectionsRequest,
        callback: (result: DirectionsResult | null, status: string) => void
      ): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center: LatLngLiteral;
      zoom: number;
      styles?: any[];
      mapTypeId?: string;
      tilt?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      gestureHandling?: string;
      backgroundColor?: string;
      mapId?: string;
    }

    interface MarkerOptions {
      position: LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: any;
      label?: any;
      zIndex?: number;
      optimized?: boolean;
    }

    interface PolylineOptions {
      path: LatLngLiteral[];
      map?: Map;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      icons?: any[];
      geodesic?: boolean;
    }

    interface DirectionsRequest {
      origin: LatLngLiteral | string;
      destination: LatLngLiteral | string;
      travelMode: string;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      overview_path: LatLng[];
      legs: Array<{
        distance: { value: number; text: string };
        duration: { value: number; text: string };
      }>;
    }
  }
}

export {};
