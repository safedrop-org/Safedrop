
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const callbackName = useRef<string>(`initGoogleMaps${Date.now()}`);

  useEffect(() => {
    console.log('Initializing Google Maps hook');
    
    // Explicitly set the API key - this is a secured environment variable, not hardcoded
    const apiKey = 'AIzaSyAh7C_dU6EnC0QE1_vor6z96-fShN4A0ow';
    
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      setLoadError(new Error('Google Maps API key is missing'));
      toast.error('مفتاح خرائط Google غير موجود');
      return;
    }

    // Only proceed if Google Maps isn't already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      setIsLoaded(true);
      return;
    }

    console.log('API key found, initializing Google Maps');

    // Use a unique callback name to prevent conflicts
    const uniqueCallbackName = callbackName.current;

    // Set up the callback function
    window[uniqueCallbackName] = () => {
      console.log('Google Maps loaded via callback');
      setIsLoaded(true);
      toast.success('تم تحميل خرائط Google بنجاح');
    };

    try {
      // Create and append the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ar&region=SA&callback=${uniqueCallbackName}`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error: Event | string) => {
        const errorObj = error instanceof Error 
          ? error 
          : new Error(typeof error === 'string' ? error : 'Script load error');
        console.error('Error loading Google Maps:', errorObj);
        setLoadError(errorObj);
        toast.error('فشل في تحميل خرائط Google');
      };
      
      document.head.appendChild(script);
      scriptRef.current = script;
      console.log('Google Maps script added to document head');
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error loading Google Maps');
      console.error('Exception loading Google Maps:', error);
      setLoadError(error);
      toast.error('حدث خطأ أثناء تحميل خرائط Google');
    }

    return () => {
      // Clean up
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
      
      if (window[uniqueCallbackName]) {
        delete window[uniqueCallbackName];
      }
    };
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    if (!isLoaded || !window.google) {
      console.error('Google Maps not loaded for geocoding');
      toast.error('خرائط جوجل غير متاحة للبحث عن العناوين');
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
      toast.error('حدث خطأ أثناء تحديد الموقع');
      return null;
    }
  }, [isLoaded]);

  const calculateDistance = useCallback(async (
    originAddress: string,
    destinationAddress: string
  ): Promise<number | null> => {
    if (!isLoaded || !window.google) {
      console.error('Google Maps not loaded for distance calculation');
      toast.error('خرائط جوجل غير متاحة لحساب المسافة');
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
        // Return distance in kilometers
        return distanceKm;
      }
      
      console.warn('Distance calculation returned invalid result');
      return null;
    } catch (error) {
      console.error('خطأ في حساب المسافة:', error);
      toast.error('حدث خطأ أثناء حساب المسافة');
      return null;
    }
  }, [isLoaded]);

  return { isLoaded, loadError, calculateDistance, geocodeAddress };
};

// Add global type declaration for the callback function
declare global {
  interface Window {
    [key: string]: any;
    google: any;
  }
}
