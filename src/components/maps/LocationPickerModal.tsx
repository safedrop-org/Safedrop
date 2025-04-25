
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
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
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapInitializationTimerRef = useRef<number | null>(null);

  // Clean up function to properly dispose Google Maps resources
  const cleanupMap = () => {
    // Clear any pending timers
    if (mapInitializationTimerRef.current) {
      window.clearTimeout(mapInitializationTimerRef.current);
      mapInitializationTimerRef.current = null;
    }

    // Remove marker from map
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // Reset map state without disposing the map object
    // This prevents the DOM removal error
    setMap(null);
    setMapInitialized(false);
  };

  useEffect(() => {
    // Only initialize the map when modal is open and the DOM element is ready
    if (!open || !mapRef.current || !window.google || !window.google.maps) {
      return cleanupMap();
    }

    console.log('Initializing map in modal');
    
    try {
      // Initialize geocoder if not already done
      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }
      
      // Create Saudi Arabia bounds
      const saudiBounds = new google.maps.LatLngBounds(
        { lat: 16.3797, lng: 34.5725 }, // Southwest
        { lat: 32.1543, lng: 55.6666 }  // Northeast
      );

      // Create the map with a short delay to ensure the container is fully rendered
      mapInitializationTimerRef.current = window.setTimeout(() => {
        if (!mapRef.current || !open) return;
        
        console.log('Creating map with dimensions:', mapRef.current.offsetWidth, mapRef.current.offsetHeight);
        
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 24.7136, lng: 46.6753 }, // Riyadh coordinates
          zoom: 11,
          restriction: {
            latLngBounds: saudiBounds,
            strictBounds: true
          },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        });

        // Add click event listener to the map
        const clickListener = newMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
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
            if (geocoderRef.current) {
              const result = await geocoderRef.current.geocode({
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
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('حدث خطأ أثناء تحديد الموقع');
          }
        });

        console.log('Map created successfully');
        setMap(newMap);
        setMapInitialized(true);
        
        // Return a cleanup function for this specific effect
        return () => {
          google.maps.event.removeListener(clickListener);
        };
      }, 300);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('حدث خطأ في تحميل الخريطة');
    }

    // Cleanup when the component unmounts or modal closes
    return cleanupMap;
  }, [open, onClose, onLocationSelect]);

  // Handle resize events when the modal is open
  useEffect(() => {
    const handleResize = () => {
      if (map && mapRef.current && open) {
        google.maps.event.trigger(map, 'resize');
      }
    };

    if (open) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            انقر على الخريطة لتحديد الموقع
          </DialogDescription>
        </DialogHeader>
        
        <div 
          className="flex-1 h-[60vh] min-h-[400px] w-full border border-gray-200 rounded-md shadow-inner relative" 
          ref={mapRef}
          style={{ background: '#f0f0f0' }}
        >
          {!mapInitialized && open && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safedrop-primary"></div>
                <p>جاري تحميل الخريطة...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          انقر على الموقع المطلوب على الخريطة
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerModal;
