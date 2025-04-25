
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        console.log('Google Maps loaded in LocationInput, initializing services');
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        // Create a dummy div for PlacesService (required)
        if (divRef.current) {
          placesService.current = new window.google.maps.places.PlacesService(divRef.current);
          console.log('Places service initialized');
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

    if (!isLoaded || !autocompleteService.current || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      console.log('Fetching address predictions for:', input);
      setShowSuggestions(true);
      
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
          console.log('Predictions count:', predictions?.length || 0);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
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
      console.log('Getting details for place ID:', suggestion.place_id);
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
            
            console.log('Selected place coordinates:', place.geometry.location.lat(), place.geometry.location.lng());
            
            // Get a new session token after selection
            autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            setSuggestions([]);
            setShowSuggestions(false);
            toast.success('تم اختيار الموقع بنجاح');
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="flex flex-col space-y-4">
        <div className="relative" ref={inputRef}>
          <Input
            placeholder={placeholder}
            value={value.address}
            onChange={handleAddressChange}
            className="w-full"
            onClick={() => {
              if (value.address.length >= 3 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          {suggestions.length > 0 && showSuggestions && (
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
