
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

  export class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    contains(latLng: LatLng | LatLngLiteral): boolean;
    equals(other: LatLngBounds | LatLngLiteralBounds): boolean;
    extend(latLng: LatLng | LatLngLiteral): this;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds | LatLngLiteralBounds): boolean;
    isEmpty(): boolean;
    toJSON(): LatLngLiteralBounds;
    toSpan(): LatLng;
    toString(): string;
    union(other: LatLngBounds | LatLngLiteralBounds): LatLngBounds;
  }

  export interface LatLngLiteralBounds {
    east: number;
    north: number;
    south: number;
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
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
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
    geocode(request: GeocoderRequest, callback?: (results: GeocoderResult[], status: GeocoderStatus) => void): Promise<GeocoderResponse>;
  }

  export interface GeocoderRequest {
    location?: LatLng | LatLngLiteral;
    region?: string;
    address?: string;
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

  export enum DistanceMatrixStatus {
    OK = 'OK',
    INVALID_REQUEST = 'INVALID_REQUEST',
    MAX_ELEMENTS_EXCEEDED = 'MAX_ELEMENTS_EXCEEDED',
    MAX_DIMENSIONS_EXCEEDED = 'MAX_DIMENSIONS_EXCEEDED',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }

  export enum TravelMode {
    DRIVING = 'DRIVING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT',
    WALKING = 'WALKING'
  }

  export enum UnitSystem {
    METRIC = 0,
    IMPERIAL = 1
  }

  export interface DistanceMatrixRequest {
    origins: (string | LatLng | LatLngLiteral)[];
    destinations: (string | LatLng | LatLngLiteral)[];
    travelMode: TravelMode;
    unitSystem?: UnitSystem;
    region?: string;
  }

  export interface DistanceMatrixResponseElement {
    distance: {
      text: string;
      value: number;
    };
    duration: {
      text: string;
      value: number;
    };
    status: string;
  }

  export interface DistanceMatrixResponseRow {
    elements: DistanceMatrixResponseElement[];
  }

  export interface DistanceMatrixResponse {
    originAddresses: string[];
    destinationAddresses: string[];
    rows: DistanceMatrixResponseRow[];
  }

  export class DistanceMatrixService {
    getDistanceMatrix(
      request: DistanceMatrixRequest,
      callback: (
        response: DistanceMatrixResponse,
        status: DistanceMatrixStatus
      ) => void
    ): void;
  }

  export namespace event {
    function addListener(instance: Object, eventName: string, handler: Function): MapsEventListener;
    function addDomListener(instance: Element, eventName: string, handler: Function, capture?: boolean): MapsEventListener;
    function clearInstanceListeners(instance: Object): void;
    function removeListener(listener: MapsEventListener): void;
    function trigger(instance: any, eventName: string, ...args: any[]): void;
  }
}
