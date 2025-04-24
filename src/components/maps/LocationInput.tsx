
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
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
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (isLoaded && mapRef.current && value.coordinates) {
      // Initialize map if coordinates exist
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: value.coordinates,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });
      
      const newMarker = new window.google.maps.Marker({
        position: value.coordinates,
        map: newMap,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });
      
      // Update marker position when dragged
      window.google.maps.event.addListener(newMarker, 'dragend', function() {
        if (newMarker.getPosition()) {
          const position = newMarker.getPosition()!;
          onChange({
            ...value,
            coordinates: {
              lat: position.lat(),
              lng: position.lng(),
            }
          });
          
          // Reverse geocode to get address from coordinates
          reverseGeocode(position.lat(), position.lng());
        }
      });
      
      setMap(newMap);
      setMarker(newMarker);
    }
  }, [isLoaded, value.coordinates]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, address: e.target.value });
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, details: e.target.value });
  };

  const handleVerifyAddress = async () => {
    if (!value.address || value.address.trim() === '') {
      toast.error('يرجى إدخال العنوان أولاً');
      return;
    }

    setIsGeocodingAddress(true);
    try {
      const coordinates = await geocodeAddress(value.address);
      if (coordinates) {
        onChange({
          ...value,
          coordinates: coordinates
        });
        toast.success('تم تحديد الموقع بنجاح');
      } else {
        toast.error('لم نتمكن من العثور على العنوان');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast.error('حدث خطأ أثناء تحديد الموقع');
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!isLoaded || !window.google) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat, lng };
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          onChange({
            ...value,
            address: results[0].formatted_address,
            coordinates: { lat, lng }
          });
        }
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="flex flex-col space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={value.address}
            onChange={handleAddressChange}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleVerifyAddress}
            disabled={isGeocodingAddress || !value.address}
            className="whitespace-nowrap"
          >
            <MapPin className="h-4 w-4 ml-2" />
            تحديد الموقع
          </Button>
        </div>

        <Input
          placeholder={detailsPlaceholder}
          value={value.details || ''}
          onChange={handleDetailsChange}
        />

        {isLoaded && (
          <div
            ref={mapRef}
            className="w-full h-40 rounded-md mt-2 border border-gray-300"
            style={{ display: value.coordinates ? 'block' : 'none' }}
          />
        )}
      </div>
    </div>
  );
};

export default LocationInput;
