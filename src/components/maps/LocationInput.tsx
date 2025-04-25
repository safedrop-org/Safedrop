
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import LocationPickerModal from './LocationPickerModal';

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
  // Add the missing props
  isLoaded?: boolean;
  geocodeAddress?: (address: string) => Promise<google.maps.LatLngLiteral | null>;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  detailsPlaceholder,
  value,
  onChange,
  className,
  // Add default values for the new props
  isLoaded = true,
  geocodeAddress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLocationSelect = (location: Location) => {
    onChange({ ...location, details: value.details });
  };

  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="flex flex-col space-y-4">
        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full flex justify-start text-right"
          variant={value.address ? "outline" : "default"}
        >
          <MapPin className="h-4 w-4 ml-2 flex-shrink-0" />
          {value.address || placeholder}
        </Button>

        {value.address && (
          <Input
            placeholder={detailsPlaceholder}
            value={value.details || ''}
            onChange={(e) => onChange({ ...value, details: e.target.value })}
          />
        )}

        <LocationPickerModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLocationSelect={handleLocationSelect}
          title={`اختر ${label}`}
        />
      </div>
    </div>
  );
};

export default LocationInput;
