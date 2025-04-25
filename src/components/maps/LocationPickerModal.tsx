
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
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Clean up function to properly dispose Google Maps resources
  const cleanupMap = () => {
    // Remove event listeners first
    if (clickListenerRef.current) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    // Clear any pending timers
    if (mapInitializationTimerRef.current) {
      window.clearTimeout(mapInitializationTimerRef.current);
      mapInitializationTimerRef.current = null;
    }

    // Remove marker from map without touching DOM
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // Reset map state without disposing the map object immediately
    // (This prevents direct DOM manipulation that could conflict with React)
    if (map) {
      setMap(null); // Just remove our reference
    }
    
    setMapInitialized(false);
  };

  // This effect initializes the map when the modal opens and the DOM is ready
  useEffect(() => {
    // Only initialize the map when modal is open and Google Maps is loaded
    if (!open || !mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    // We need this small delay to ensure the modal is fully rendered
    // before initializing the map
    const initializeTimeout = setTimeout(() => {
      try {
        console.log('Initializing map in modal');
        
        // Initialize geocoder if not already done
        if (!geocoderRef.current && window.google && window.google.maps) {
          geocoderRef.current = new google.maps.Geocoder();
        }
        
        // Create Saudi Arabia bounds
        const saudiBounds = {
          north: 32.1543,
          south: 16.3797,
          west: 34.5725,
          east: 55.6666
        };

        const bounds = new google.maps.LatLngBounds(
          { lat: saudiBounds.south, lng: saudiBounds.west },
          { lat: saudiBounds.north, lng: saudiBounds.east }
        );

        if (!mapRef.current) return;
        
        console.log('Creating map with dimensions:', mapRef.current.offsetWidth, mapRef.current.offsetHeight);
        
        // Create a new map instance
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: 24.7136, lng: 46.6753 }, // Riyadh coordinates
          zoom: 11,
          restriction: {
            latLngBounds: bounds,
            strictBounds: true
          },
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        });

        // Add click event listener to the map
        clickListenerRef.current = newMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;

          // Remove existing marker if any
          if (marker) {
            marker.setMap(null);
          }

          // Create new marker
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
      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('حدث خطأ في تحميل الخريطة');
      }
    }, 300);

    mapInitializationTimerRef.current = initializeTimeout;

    // Cleanup when the effect is re-run or component unmounts
    return cleanupMap;
  }, [open, onClose, onLocationSelect, marker]);

  // Clean up completely when the component unmounts
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  // Handle modal close event to ensure clean map disposal
  const handleCloseModal = () => {
    // Ensure we cleanup the map before closing the modal
    cleanupMap();
    onClose();
  };

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
    <Dialog open={open} onOpenChange={handleCloseModal}>
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
