export interface Location {
  lat: number;
  lng: number;
}

export interface Destination {
  name: string;
  address?: string;
  mapUri?: string;
  description?: string;
}

export enum RideType {
  ECONOMY = 'ECONOMY',
  PREMIUM = 'PREMIUM',
  XL = 'XL',
}

export interface RideOption {
  id: RideType;
  name: string;
  price: number;
  eta: number; // minutes
  icon: string;
  carModel: string;
  imageUrl: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOCATING = 'LOCATING',
  SEARCHING = 'SEARCHING',
  SELECTING_RIDE = 'SELECTING_RIDE',
  PAYMENT = 'PAYMENT', // New status
  REQUESTING = 'REQUESTING',
  ON_RIDE = 'ON_RIDE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  mimeType: string | null;
}

export interface GenerationResult {
  imageUrl?: string;
  textResponse?: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  country?: string;
}