
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add Google Maps type definitions
declare namespace google.maps {
  export class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  export interface LatLngBounds {
    north: number;
    south: number;
    east: number;
    west: number;
  }

  export interface MapRestriction {
    latLngBounds: LatLngBounds;
    strictBounds?: boolean;
  }

  export interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    restriction?: MapRestriction;
  }

  export class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    addListener(eventName: string, handler: Function): google.maps.MapsEventListener;
  }

  export class Marker {
    constructor(opts: MarkerOptions);
    setMap(map: Map | null): void;
  }

  export interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map: Map;
    animation?: any;
  }

  export class Geocoder {
    geocode(request: GeocoderRequest): Promise<GeocoderResponse>;
  }

  export interface GeocoderRequest {
    location?: LatLng | LatLngLiteral;
    region?: string;
  }

  export interface GeocoderResponse {
    results: GeocoderResult[];
    status: GeocoderStatus;
  }

  export interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
  }

  export enum GeocoderStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    ERROR = 'ERROR',
  }

  export interface MapsEventListener {
    remove(): void;
  }

  export namespace Animation {
    export const DROP: number;
  }
}
