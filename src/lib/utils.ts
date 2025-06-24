import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * @param distance Distance in meters
 * @description This function calculates the minimum acceptable cost for a given distance.
 * @returns
 */
export function calculateCost(distance: number) {
  // Convert meters to kilometers
  const distanceInKm = distance / 1000;

  // 1.5 SAR per kilometer + 10 SAR base cost
  const cost = distanceInKm * 1.5 + 10;

  return Math.floor(cost * 100) / 100;
}
