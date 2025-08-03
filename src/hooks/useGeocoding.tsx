import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
}

// Saudi cities coordinates cache
const SAUDI_CITIES_CACHE: Record<string, Coordinates> = {
  'رياض': { lat: 24.7136, lng: 46.6753 },
  'الرياض': { lat: 24.7136, lng: 46.6753 },
  'riyadh': { lat: 24.7136, lng: 46.6753 },
  'جدة': { lat: 21.4858, lng: 39.1925 },
  'jeddah': { lat: 21.4858, lng: 39.1925 },
  'مكة': { lat: 21.3891, lng: 39.8579 },
  'مكة المكرمة': { lat: 21.3891, lng: 39.8579 },
  'mecca': { lat: 21.3891, lng: 39.8579 },
  'makkah': { lat: 21.3891, lng: 39.8579 },
  'المدينة': { lat: 24.5247, lng: 39.5692 },
  'المدينة المنورة': { lat: 24.5247, lng: 39.5692 },
  'medina': { lat: 24.5247, lng: 39.5692 },
  'الدمام': { lat: 26.4207, lng: 50.0888 },
  'dammam': { lat: 26.4207, lng: 50.0888 },
  'الخبر': { lat: 26.2172, lng: 50.1971 },
  'khobar': { lat: 26.2172, lng: 50.1971 },
  'تبوك': { lat: 28.3998, lng: 36.5700 },
  'tabuk': { lat: 28.3998, lng: 36.5700 },
  'الطائف': { lat: 21.2854, lng: 40.4183 },
  'taif': { lat: 21.2854, lng: 40.4183 },
  'حائل': { lat: 27.5114, lng: 41.6900 },
  'hail': { lat: 27.5114, lng: 41.6900 },
  'خميس مشيط': { lat: 18.3063, lng: 42.7281 },
  'khamis mushait': { lat: 18.3063, lng: 42.7281 },
  'بريدة': { lat: 26.3260, lng: 43.9750 },
  'buraidah': { lat: 26.3260, lng: 43.9750 },
  'الأحساء': { lat: 25.4295, lng: 49.6153 },
  'al-ahsa': { lat: 25.4295, lng: 49.6153 },
  'جازان': { lat: 16.8892, lng: 42.5601 },
  'jazan': { lat: 16.8892, lng: 42.5601 },
  'نجران': { lat: 17.4924, lng: 44.1277 },
  'najran': { lat: 17.4924, lng: 44.1277 },
  'ينبع': { lat: 24.0896, lng: 38.0618 },
  'yanbu': { lat: 24.0896, lng: 38.0618 },
};

export const useGeocoding = (address: string): GeocodeResult => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || address.trim().length === 0) {
      setCoordinates(null);
      setError(null);
      return;
    }

    const geocodeAddress = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to find in cache
        const cleanAddress = address.toLowerCase().trim();
        for (const [cityName, coords] of Object.entries(SAUDI_CITIES_CACHE)) {
          if (cleanAddress.includes(cityName)) {
            setCoordinates(coords);
            setLoading(false);
            return;
          }
        }

        // If not in cache, try Google Geocoding API
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              address + ', Saudi Arabia'
            )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
              const location = data.results[0].geometry.location;
              setCoordinates({ lat: location.lat, lng: location.lng });
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.warn('Google Geocoding API failed:', apiError);
        }

        // Fallback: Use Riyadh coordinates
        console.warn(`Could not geocode address: ${address}, using Riyadh as fallback`);
        setCoordinates({ lat: 24.7136, lng: 46.6753 });
        
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Failed to geocode address');
        // Fallback to Riyadh
        setCoordinates({ lat: 24.7136, lng: 46.6753 });
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  return { coordinates, loading, error };
};

// Helper function to geocode multiple addresses
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!address || address.trim().length === 0) return null;

  // Check cache first
  const cleanAddress = address.toLowerCase().trim();
  for (const [cityName, coords] of Object.entries(SAUDI_CITIES_CACHE)) {
    if (cleanAddress.includes(cityName)) {
      return coords;
    }
  }

  // Try Google Geocoding API
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address + ', Saudi Arabia'
      )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
    }
  } catch (error) {
    console.warn('Google Geocoding API failed:', error);
  }

  return null;
};
