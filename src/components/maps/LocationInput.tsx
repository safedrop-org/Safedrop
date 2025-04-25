
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  address: string;
  details?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationInputProps {
  label: string;
  placeholder: string;
  detailsPlaceholder: string;
  value: Location;
  onChange: (location: Location) => void;
  className?: string;
  isLoaded: boolean;
  geocodeAddress: (address: string) => Promise<google.maps.LatLngLiteral | null>;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  detailsPlaceholder,
  value,
  onChange,
  className,
  isLoaded,
  geocodeAddress
}) => {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        console.log('Google Maps loaded, initializing services');
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        // Create a dummy div for PlacesService (required)
        if (divRef.current) {
          placesService.current = new window.google.maps.places.PlacesService(divRef.current);
        }
      } catch (error) {
        console.error('Error initializing Google Maps services:', error);
        toast.error('فشل في تحميل خدمات خرائط جوجل');
      }
    } else if (isLoaded) {
      console.warn('Google Maps loaded but places library is not available');
    }
  }, [isLoaded]);

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange({ ...value, address: input });

    if (!autocompleteService.current || input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      console.log('Fetching address predictions for:', input);
      const request = {
        input,
        sessionToken: autocompleteSessionToken.current,
        componentRestrictions: { country: 'SA' }, // Restrict to Saudi Arabia
        types: ['address', 'establishment', 'geocode']
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          console.log('Autocomplete status:', status);
          console.log('Predictions:', predictions);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
            if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.warn('Autocomplete failed with status:', status);
            }
          }
        }
      );
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) {
      if (divRef.current && isLoaded && window.google) {
        placesService.current = new window.google.maps.places.PlacesService(divRef.current);
      } else {
        toast.error('خدمة الأماكن غير متاحة');
        return;
      }
    }

    try {
      placesService.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['geometry', 'formatted_address', 'name'],
          sessionToken: autocompleteSessionToken.current
        },
        (place, status) => {
          console.log('Place details status:', status);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry) {
            onChange({
              address: place.formatted_address || suggestion.description,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            });
            
            // Get a new session token after selection
            autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            setSuggestions([]);
          } else {
            console.error('Error getting place details:', status);
            toast.error('تعذر الحصول على تفاصيل المكان');
          }
        }
      );
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      toast.error('حدث خطأ أثناء اختيار العنوان');
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, details: e.target.value });
  };

  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={value.address}
            onChange={handleAddressChange}
            className="w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-40 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <li 
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
          {/* Hidden div for PlacesService */}
          <div ref={divRef} style={{ display: 'none' }}></div>
        </div>

        <Input
          placeholder={detailsPlaceholder}
          value={value.details || ''}
          onChange={handleDetailsChange}
        />
      </div>
    </div>
  );
};

export default LocationInput;
