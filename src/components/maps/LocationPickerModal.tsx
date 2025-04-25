
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
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

  // Complete cleanup function that safely disposes all Google Maps resources
  const cleanupMapResources = () => {
    console.log('Cleaning up map resources');
    
    // First, remove all event listeners
    if (clickListenerRef.current && window.google) {
      google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    // Clear any pending initialization timers
    if (mapInitializationTimerRef.current !== null) {
      window.clearTimeout(mapInitializationTimerRef.current);
      mapInitializationTimerRef.current = null;
    }

    // Remove marker from map - this is a Google Maps operation, not DOM
    if (marker) {
      marker.setMap(null);
      setMarker(null);
    }

    // Clear map state
    setMap(null);
    setMapInitialized(false);
  };

  // Only set up the map when the modal is truly open and visible in the DOM
  useEffect(() => {
    if (!open || !window.google || !window.google.maps) {
      return;
    }

    // Wait until the modal is fully mounted in the DOM
    const initializeMap = () => {
      try {
        // Safety check - if the map div isn't in the DOM yet, don't proceed
        if (!mapRef.current || !mapRef.current.offsetWidth) {
          console.log('Map container not ready, skipping initialization');
          return;
        }
        
        console.log('Initializing map in modal');
        
        // Initialize geocoder if needed
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
        const clickListener = newMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
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
              }
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('حدث خطأ أثناء تحديد الموقع');
          }
        });

        clickListenerRef.current = clickListener;
        console.log('Map created successfully');
        setMap(newMap);
        setMapInitialized(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('حدث خطأ في تحميل الخريطة');
      }
    };

    // Delay map initialization to ensure the modal DOM is ready
    const timer: number = window.setTimeout(() => {
      if (mapRef.current) {
        initializeMap();
      }
    }, 500);
    
    mapInitializationTimerRef.current = timer;

    // Clean up on unmount or when open changes
    return cleanupMapResources;
  }, [open, onLocationSelect, marker]);

  // Handle resize events
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

  // Handle closing via Dialog's onOpenChange
  const handleCloseModal = () => {
    cleanupMapResources();
    onClose();
  };

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
