
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteSessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  console.log('LocationInput rendered, isLoaded:', isLoaded);

  // Initialize Google Maps services when API is loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        console.log('Google Maps loaded, initializing autocomplete services');
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
      toast.error('خدمة البحث عن الأماكن غير متاحة');
    }
  }, [isLoaded]);

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    onChange({ ...value, address: input });
    
    console.log('Input value changed:', input);

    if (!isLoaded) {
      console.warn('Google Maps not loaded yet');
      return;
    }
    
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places API not available');
      toast.error('خدمة البحث عن الأماكن غير متاحة');
      return;
    }

    if (!autocompleteService.current) {
      console.warn('Autocomplete service not initialized, trying to initialize now');
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      } catch (error) {
        console.error('Failed to initialize autocomplete service:', error);
        return;
      }
    }

    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
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
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
            console.log('Predictions received:', predictions);
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            console.warn('No predictions received or status not OK:', status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      toast.error('حدث خطأ في البحث عن العناوين');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    console.log('Input focused, current value:', value.address);
    
    // If we have text but no suggestions, try to fetch them again
    if (value.address.length >= 2 && isLoaded) {
      handleAddressChange({ target: { value: value.address } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!document.activeElement || !inputRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    console.log('Selected suggestion:', suggestion);
    
    if (!window.google || !window.google.maps) {
      toast.error('خرائط جوجل غير متاحة');
      return;
    }

    if (!placesService.current) {
      if (divRef.current && isLoaded) {
        try {
          placesService.current = new window.google.maps.places.PlacesService(divRef.current);
        } catch (error) {
          console.error('Error creating PlacesService:', error);
          toast.error('خدمة الأماكن غير متاحة');
          return;
        }
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
            console.log('Place details received:', place);
            onChange({
              address: place.formatted_address || suggestion.description,
              details: value.details,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            });
            
            // Get a new session token after selection
            if (window.google && window.google.maps && window.google.maps.places) {
              autocompleteSessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            }
            
            toast.success('تم اختيار الموقع بنجاح');
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

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, details: e.target.value });
  };

  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={value.address}
            onChange={handleAddressChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={`w-full ${isInputFocused ? 'border-safedrop-gold' : ''}`}
            autoComplete="off"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <li 
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-safedrop-gold" />
                    {suggestion.description}
                  </div>
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
