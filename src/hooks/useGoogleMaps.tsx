
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
  calculateDistance: (originAddress: string, destinationAddress: string) => Promise<number | null>;
  geocodeAddress: (address: string) => Promise<google.maps.LatLngLiteral | null>;
}

export const useGoogleMaps = (): UseGoogleMapsResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = (error: Event | string) => {
      // Convert the error to an Error object if it's not already one
      const errorObj = error instanceof Error 
        ? error 
        : new Error(typeof error === 'string' ? error : 'Script load error');
      setLoadError(errorObj);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    if (!isLoaded || !window.google) {
      toast.error('خرائط جوجل غير متاحة');
      return null;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`فشل تحويل العنوان: ${status}`));
          }
        });
      });

      if (result && result[0] && result[0].geometry && result[0].geometry.location) {
        return {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('خطأ في تحويل العنوان:', error);
      toast.error('حدث خطأ أثناء تحديد الموقع');
      return null;
    }
  }, [isLoaded]);

  const calculateDistance = useCallback(async (
    originAddress: string,
    destinationAddress: string
  ): Promise<number | null> => {
    if (!isLoaded || !window.google) {
      toast.error('خرائط جوجل غير متاحة');
      return null;
    }

    try {
      const distanceService = new window.google.maps.DistanceMatrixService();
      
      const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        distanceService.getDistanceMatrix({
          origins: [originAddress],
          destinations: [destinationAddress],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC
        }, (result, status) => {
          if (status === window.google.maps.DistanceMatrixStatus.OK) {
            resolve(result);
          } else {
            reject(new Error(`فشل حساب المسافة: ${status}`));
          }
        });
      });

      if (
        response.rows && 
        response.rows[0] && 
        response.rows[0].elements && 
        response.rows[0].elements[0] && 
        response.rows[0].elements[0].distance
      ) {
        // Return distance in kilometers
        return response.rows[0].elements[0].distance.value / 1000;
      }
      return null;
    } catch (error) {
      console.error('خطأ في حساب المسافة:', error);
      toast.error('حدث خطأ أثناء حساب المسافة');
      return null;
    }
  }, [isLoaded]);

  return { isLoaded, loadError, calculateDistance, geocodeAddress };
};
