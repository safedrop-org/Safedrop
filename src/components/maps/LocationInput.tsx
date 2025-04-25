
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';

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
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        console.log('Initializing Places services');
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        
        if (divRef.current) {
          placesService.current = new window.google.maps.places.PlacesService(divRef.current);
          console.log('Places service initialized');
        }
      } catch (error) {
        console.error('Error initializing Places services:', error);
        toast.error('فشل في تحميل خدمات خرائط جوجل');
      }
    }
  }, [isLoaded]);

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange({ ...value, address: input });

    if (!isLoaded || !autocompleteService.current || input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      console.log('Fetching address predictions for:', input);
      
      const request = {
        input,
        sessionToken: autocompleteSessionToken.current,
        componentRestrictions: { country: 'SA' },
        types: ['geocode', 'establishment'],
        language: 'ar'
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log('Received predictions:', predictions.length);
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            console.log('No predictions found or error:', status);
            setSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current && divRef.current && isLoaded && window.google) {
      placesService.current = new window.google.maps.places.PlacesService(divRef.current);
    }

    if (!placesService.current) {
      toast.error('خدمة الأماكن غير متاحة');
      return;
    }

    try {
      console.log('Getting details for place:', suggestion.place_id);
      placesService.current.getDetails(
        {
          placeId: suggestion.place_id,
          fields: ['geometry', 'formatted_address', 'name'],
          sessionToken: autocompleteSessionToken.current,
          language: 'ar'
        },
        (place, status) => {
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
            setShowSuggestions(false);
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            onFocus={() => {
              setIsFocused(true);
              if (value.address.length >= 2) {
                setShowSuggestions(true);
              }
            }}
            className="w-full"
          />
          
          {suggestions.length > 0 && showSuggestions && (
            <ul className="absolute z-40 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <li 
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-none"
                >
                  <MapPin className="h-4 w-4 ml-2 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{suggestion.description}</span>
                </li>
              ))}
            </ul>
          )}
          
          <div ref={divRef} style={{ display: 'none' }}></div>
        </div>

        {value.address && (
          <Input
            placeholder={detailsPlaceholder}
            value={value.details || ''}
            onChange={(e) => onChange({ ...value, details: e.target.value })}
          />
        )}
      </div>
    </div>
  );
};

export default LocationInput;
