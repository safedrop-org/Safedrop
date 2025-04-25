
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface Location {
  address: string;
  details?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationPickerModalProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  title: string;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  onClose,
  onLocationSelect,
  title,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!open || !mapRef.current) return;

    // Create Saudi Arabia bounds
    const saudiBounds = {
      north: 32.1543,
      south: 16.3797,
      west: 34.5725,
      east: 55.6666
    };

    // Create proper LatLngBounds object
    const bounds = new google.maps.LatLngBounds(
      { lat: saudiBounds.south, lng: saudiBounds.west },
      { lat: saudiBounds.north, lng: saudiBounds.east }
    );

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 24.7136, lng: 46.6753 }, // Riyadh coordinates
      zoom: 11,
      restriction: {
        latLngBounds: bounds,
        strictBounds: true
      }
    });

    geocoder.current = new google.maps.Geocoder();

    newMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      if (marker) {
        marker.setMap(null);
      }

      const newMarker = new google.maps.Marker({
        position: e.latLng,
        map: newMap,
        animation: google.maps.Animation.DROP
      });

      setMarker(newMarker);

      try {
        const result = await geocoder.current?.geocode({
          location: e.latLng,
          region: 'SA'
        });

        if (result && result.results[0]) {
          onLocationSelect({
            address: result.results[0].formatted_address,
            coordinates: {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            }
          });
          onClose();
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast.error('حدث خطأ أثناء تحديد الموقع');
      }
    });

    setMap(newMap);

    return () => {
      if (marker) {
        marker.setMap(null);
      }
      setMap(null);
    };
  }, [open, onClose, onLocationSelect]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 h-full min-h-[400px]" ref={mapRef} />
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerModal;
