
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
  isLoaded = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLocationSelect = (location: Location) => {
    onChange({ ...location, details: value.details });
    setIsModalOpen(false);
  };
  
  // Safe close handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={className}>
      <label className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="flex flex-col space-y-4">
        <Button
          type="button"
          onClick={() => isLoaded && setIsModalOpen(true)}
          className="w-full flex justify-start items-center"
          variant={value.address ? "outline" : "default"}
          disabled={!isLoaded}
        >
          <MapPin className="h-4 w-4 ml-2 flex-shrink-0" />
          <span className="truncate">
            {value.address || placeholder}
          </span>
        </Button>

        {value.address && (
          <Input
            placeholder={detailsPlaceholder}
            value={value.details || ''}
            onChange={(e) => onChange({ ...value, details: e.target.value })}
          />
        )}

        {/* Only render the modal when needed and loaded */}
        {isLoaded && isModalOpen && (
          <LocationPickerModal
            open={isModalOpen}
            onClose={handleCloseModal}
            onLocationSelect={handleLocationSelect}
            title={`اختر ${label}`}
          />
        )}
      </div>
    </div>
  );
};

export default LocationInput;
