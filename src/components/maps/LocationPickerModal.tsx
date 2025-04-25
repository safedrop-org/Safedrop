
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
  const mapInitializationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const isMountedRef = useRef(true);
  
  // Complete cleanup function that safely disposes all Google Maps resources
  const cleanupMapResources = () => {
    console.log('Cleaning up map resources');
    
    // First, remove all event listeners
    if (clickListenerRef.current && window.google && window.google.maps) {
      try {
        google.maps.event.removeListener(clickListenerRef.current);
      } catch (e) {
        console.error('Error removing click listener:', e);
      }
      clickListenerRef.current = null;
    }

    // Clear any pending initialization timers
    if (mapInitializationTimerRef.current !== null) {
      clearTimeout(mapInitializationTimerRef.current);
      mapInitializationTimerRef.current = null;
    }

    // Remove marker from map - this is a Google Maps operation, not DOM
    if (marker) {
      try {
        marker.setMap(null);
      } catch (e) {
        console.error('Error removing marker:', e);
      }
      setMarker(null);
    }

    // Clear map state
    setMap(null);
    setMapInitialized(false);
  };

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupMapResources();
    };
  }, []);

  // Only initialize the map when modal is fully mounted in DOM and Google Maps is loaded
  useEffect(() => {
    // Don't do anything if modal is closed or Google Maps is not loaded
    if (!open || !window.google || !window.google.maps) {
      return;
    }

    // Safety check - clean up existing resources first
    if (map) {
      cleanupMapResources();
    }

    const initializeMap = () => {
      if (!isMountedRef.current) return;

      try {
        // Safety check - if the map div isn't properly in the DOM yet, don't proceed
        if (!mapRef.current || !mapRef.current.offsetWidth) {
          console.log('Map container not ready, delaying initialization');
          return;
        }
        
        console.log('Initializing map in modal');
        
        // Initialize geocoder if needed
        if (!geocoderRef.current && window.google && window.google.maps) {
          try {
            geocoderRef.current = new google.maps.Geocoder();
          } catch (e) {
            console.error('Error creating geocoder:', e);
            return;
          }
        }
        
        // Create Saudi Arabia bounds
        const saudiBounds = {
          north: 32.1543,
          south: 16.3797,
          west: 34.5725,
          east: 55.6666
        };

        let bounds: google.maps.LatLngBounds;
        try {
          bounds = new google.maps.LatLngBounds(
            { lat: saudiBounds.south, lng: saudiBounds.west },
            { lat: saudiBounds.north, lng: saudiBounds.east }
          );
        } catch (e) {
          console.error('Error creating bounds:', e);
          return;
        }

        // Null check again, component might have unmounted
        if (!mapRef.current || !isMountedRef.current) {
          console.error('Map container disappeared before initialization');
          return;
        }

        console.log('Creating map with dimensions:', mapRef.current.offsetWidth, mapRef.current.offsetHeight);
        
        // Create a new map instance
        let newMap: google.maps.Map;
        try {
          newMap = new google.maps.Map(mapRef.current, {
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
        } catch (e) {
          console.error('Error creating map:', e);
          return;
        }

        // Component might have unmounted during async operations
        if (!isMountedRef.current) {
          return;
        }

        try {
          // Add click event listener to the map
          const clickListener = newMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
            if (!e.latLng || !isMountedRef.current) return;

            // Remove existing marker if any
            if (marker) {
              marker.setMap(null);
            }

            let newMarker: google.maps.Marker;
            try {
              // Create new marker
              newMarker = new google.maps.Marker({
                position: e.latLng,
                map: newMap,
                animation: google.maps.Animation.DROP
              });

              // Only update state if component is still mounted
              if (isMountedRef.current) {
                setMarker(newMarker);
              } else {
                // Clean up if unmounted
                newMarker.setMap(null);
                return;
              }
            } catch (markerError) {
              console.error('Error creating marker:', markerError);
              return;
            }

            try {
              if (geocoderRef.current && e.latLng && isMountedRef.current) {
                geocoderRef.current.geocode({
                  location: e.latLng,
                  region: 'SA'
                }).then(result => {
                  if (result && result.results[0] && isMountedRef.current) {
                    onLocationSelect({
                      address: result.results[0].formatted_address,
                      coordinates: {
                        lat: e.latLng!.lat(),
                        lng: e.latLng!.lng()
                      }
                    });
                  }
                }).catch(error => {
                  console.error('Geocoding error:', error);
                  if (isMountedRef.current) {
                    toast.error('حدث خطأ أثناء تحديد الموقع');
                  }
                });
              }
            } catch (error) {
              console.error('Geocoding error:', error);
              if (isMountedRef.current) {
                toast.error('حدث خطأ أثناء تحديد الموقع');
              }
            }
          });

          clickListenerRef.current = clickListener;
        } catch (listenerError) {
          console.error('Error adding click listener:', listenerError);
        }

        console.log('Map created successfully');
        if (isMountedRef.current) {
          setMap(newMap);
          setMapInitialized(true);
        } else {
          // Clean up if component unmounted during async operations
          try {
            if (clickListenerRef.current) {
              google.maps.event.removeListener(clickListenerRef.current);
              clickListenerRef.current = null;
            }
          } catch (e) {
            console.error('Error cleaning up during unmounted state:', e);
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMountedRef.current) {
          toast.error('حدث خطأ في تحميل الخريطة');
        }
      }
    };

    // Delay map initialization to ensure the modal DOM is ready
    const timer = setTimeout(() => {
      if (isMountedRef.current && mapRef.current) {
        initializeMap();
      }
    }, 500);
    
    mapInitializationTimerRef.current = timer;

    // Clean up on unmount or when open state changes
    return () => {
      cleanupMapResources();
    };
  }, [open, onLocationSelect]);

  // Handle resize events
  useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      if (map && mapRef.current && open && isMountedRef.current) {
        try {
          google.maps.event.trigger(map, 'resize');
        } catch (e) {
          console.error('Error triggering resize:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map, open]);

  // Handle Dialog's onOpenChange
  const handleCloseModal = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
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
