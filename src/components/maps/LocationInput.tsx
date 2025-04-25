
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
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
      const request = {
        input: input,
        componentRestrictions: { country: 'SA' }, // Restrict to Saudi Arabia
        types: ['address']
      };

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(predictions || []);
        } else {
          setSuggestions([]);
        }
      });
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current && isLoaded) {
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }

    placesService.current?.getDetails(
      { placeId: suggestion.place_id },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry) {
          onChange({
            address: suggestion.description,
            coordinates: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
          setSuggestions([]);
        }
      }
    );
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
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
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
