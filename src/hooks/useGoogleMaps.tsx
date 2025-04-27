
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
    // Check if the script is already loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
    if (existingScript) {
      console.log('Google Maps script already exists');
      // If the script exists but window.google is undefined, wait for it to load
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps already loaded with Places library');
        setIsLoaded(true);
      } else {
        console.log('Waiting for existing Google Maps script to load');
        const checkGoogleExists = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps loaded from existing script');
            clearInterval(checkGoogleExists);
            setIsLoaded(true);
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkGoogleExists);
          if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error('Timeout waiting for Google Maps to load');
            setLoadError(new Error('Timeout loading Google Maps API'));
          }
        }, 10000);
      }
      return;
    }

    // Load the script if it doesn't exist
    console.log('Loading Google Maps script');
    const script = document.createElement('script');
    const apiKey = 'AIzaSyAh7C_dU6EnC0QE1_vor6z96-fShN4A0ow'; // Using the provided API key
    
    // Set script attributes properly
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Define the callback globally
    window.initGoogleMaps = () => {
      console.log('Google Maps loaded via callback');
      setIsLoaded(true);
    };
    
    script.onerror = (error: Event | string) => {
      const errorObj = error instanceof Error 
        ? error 
        : new Error(typeof error === 'string' ? error : 'Script load error');
      console.error('Error loading Google Maps:', errorObj);
      setLoadError(errorObj);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup callback
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    if (!isLoaded || !window.google) {
      console.error('Google Maps not loaded for geocoding');
      return null;
    }

    try {
      console.log('Geocoding address:', address);
      const geocoder = new window.google.maps.Geocoder();
      
      const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve, reject) => {
        geocoder.geocode({ address, region: 'SA' }, (results, status) => {
          console.log('Geocode status:', status);
          if (status === window.google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results);
          } else {
            reject(new Error(`فشل تحويل العنوان: ${status}`));
          }
        });
      });

      if (result && result[0] && result[0].geometry && result[0].geometry.location) {
        console.log('Geocoded coordinates:', {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng()
        });
        return {
          lat: result[0].geometry.location.lat(),
          lng: result[0].geometry.location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('خطأ في تحويل العنوان:', error);
      return null;
    }
  }, [isLoaded]);

  const calculateDistance = useCallback(async (
    originAddress: string,
    destinationAddress: string
  ): Promise<number | null> => {
    if (!isLoaded || !window.google) {
      console.error('Google Maps not loaded for distance calculation');
      return null;
    }

    try {
      console.log('Calculating distance between:', originAddress, 'and', destinationAddress);
      const distanceService = new window.google.maps.DistanceMatrixService();
      
      const response = await new Promise<google.maps.DistanceMatrixResponse>((resolve, reject) => {
        distanceService.getDistanceMatrix({
          origins: [originAddress],
          destinations: [destinationAddress],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          region: 'SA'
        }, (result, status) => {
          console.log('Distance Matrix status:', status);
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
        const distanceKm = response.rows[0].elements[0].distance.value / 1000;
        console.log('Calculated distance:', distanceKm, 'km');
        return distanceKm;
      }
      
      console.warn('Distance calculation returned invalid result');
      return null;
    } catch (error) {
      console.error('خطأ في حساب المسافة:', error);
      return null;
    }
  }, [isLoaded]);

  return { isLoaded, loadError, calculateDistance, geocodeAddress };
};

// Add global type declaration for the callback function
declare global {
  interface Window {
    initGoogleMaps: () => void;
    google: any;
  }
}
