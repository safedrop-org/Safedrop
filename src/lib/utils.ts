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
  let cost = 10;

  if (distance <= 2000) return cost;

  // The cost increases by 0.0015 for each meter over 2000
  cost += (distance - 2000) * 0.0015;

  return Math.floor(cost * 100) / 100;
}
