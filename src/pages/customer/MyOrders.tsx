
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Card } from '@/components/ui/card';
import { useOrders } from '@/hooks/useOrders';
import { MapPin, Package, Clock, Truck, Navigation, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrderMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const OrderMapDialog: React.FC<OrderMapDialogProps> = ({ isOpen, onClose, order }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  React.useEffect(() => {
    if (!isOpen || !order) return;

    // Load Google Maps script if it's not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeMap();
    }
  }, [isOpen, order]);

  const initializeMap = () => {
    if (!mapRef.current || !order) return;

    try {
      // Get coordinates from order
      const pickupCoords = order.pickup_location?.coordinates;
      const dropoffCoords = order.dropoff_location?.coordinates;
      const driverLocation = order.driver_location;

      if (!pickupCoords || !dropoffCoords) {
        toast.error('لا يمكن عرض الخريطة: إحداثيات غير متوفرة');
        return;
      }

      // Create map centered between pickup and dropoff
      const center = {
        lat: (pickupCoords.lat + dropoffCoords.lat) / 2,
        lng: (pickupCoords.lng + dropoffCoords.lng) / 2
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: center,
        mapTypeControl: false
      });

      // Create markers
      new window.google.maps.Marker({
        position: pickupCoords,
        map: mapInstance,
        title: 'نقطة الاستلام',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });

      new window.google.maps.Marker({
        position: dropoffCoords,
        map: mapInstance,
        title: 'نقطة التوصيل',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      // Add driver marker if available
      if (driverLocation) {
        new window.google.maps.Marker({
          position: driverLocation,
          map: mapInstance,
          title: 'موقع السائق',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }
        });
      }

      // Set up directions service
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true
      });

      directionsService.route({
        origin: pickupCoords,
        destination: dropoffCoords,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRendererInstance.setDirections(result);
        }
      });

      setMap(mapInstance);
      setDirectionsRenderer(directionsRendererInstance);
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('حدث خطأ أثناء تهيئة الخريطة');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>تفاصيل المسار</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full">
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm font-semibold block mb-1">نقطة الاستلام:</span>
              <span className="text-sm text-gray-600">{order?.pickup_location?.address}</span>
            </div>
            <div>
              <span className="text-sm font-semibold block mb-1">نقطة التوصيل:</span>
              <span className="text-sm text-gray-600">{order?.dropoff_location?.address}</span>
            </div>
          </div>
          {/* Map container */}
          <div ref={mapRef} className="flex-1 rounded-md border" />
          <div className="mt-4 text-sm">
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span>نقطة الاستلام</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span>نقطة التوصيل</span>
              </div>
              {order?.driver_location && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span>موقع السائق</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  React.useEffect(() => {
    if (error) {
      console.error("Error fetching orders:", error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">طلباتي</h1>
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p>حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى لاحقاً.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2"
              variant="outline"
            >
              إعادة المحاولة
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleViewMap = (order: any) => {
    setSelectedOrder(order);
    setMapDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'approaching': return 'bg-indigo-100 text-indigo-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'accepted': return 'تم القبول';
      case 'approved': return 'تم الموافقة';
      case 'approaching': return 'السائق في الطريق';
      case 'in_transit': return 'جاري التوصيل';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">طلباتي</h1>
        
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id} className="p-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-semibold">طلب #{order.id.substring(0, 8)}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 ml-1 text-safedrop-gold" />
                          <span className="font-semibold ml-1">نقطة الاستلام:</span>
                        </p>
                        <p className="text-sm pl-6">{order.pickup_location.address}</p>
                      </div>
                      
                      <div>
                        <p className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 ml-1 text-safedrop-gold" />
                          <span className="font-semibold ml-1">نقطة التوصيل:</span>
                        </p>
                        <p className="text-sm pl-6">{order.dropoff_location.address}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="h-4 w-4 ml-1 text-safedrop-gold" />
                          <span className="font-semibold">تاريخ الإنشاء:</span>
                        </p>
                        <p className="text-sm">{formatDate(order.created_at)}</p>
                      </div>
                      
                      {order.estimated_distance && (
                        <div>
                          <p className="flex items-center text-sm text-gray-600 mb-1">
                            <Navigation className="h-4 w-4 ml-1 text-safedrop-gold" />
                            <span className="font-semibold">المسافة:</span>
                          </p>
                          <p className="text-sm">{order.estimated_distance.toFixed(2)} كم</p>
                        </div>
                      )}
                      
                      {order.price && (
                        <div>
                          <p className="flex items-center text-sm text-gray-600 mb-1">
                            <DollarSign className="h-4 w-4 ml-1 text-safedrop-gold" />
                            <span className="font-semibold">السعر:</span>
                          </p>
                          <p className="text-sm">{order.price} ريال</p>
                        </div>
                      )}
                    </div>
                    
                    {order.driver && (
                      <div className="mb-4">
                        <p className="flex items-center text-sm text-gray-600 mb-1">
                          <Truck className="h-4 w-4 ml-1 text-safedrop-gold" />
                          <span className="font-semibold">السائق:</span>
                        </p>
                        <p className="text-sm">
                          {order.driver.first_name} {order.driver.last_name}
                        </p>
                      </div>
                    )}

                    {/* Package details */}
                    <div className="mb-4">
                      <p className="flex items-center text-sm text-gray-600 mb-1">
                        <Package className="h-4 w-4 ml-1 text-safedrop-gold" />
                        <span className="font-semibold">تفاصيل الشحنة:</span>
                      </p>
                      <p className="text-sm">{order.package_details || 'لا توجد تفاصيل'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:mr-4 flex md:flex-col md:justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMap(order)}
                      disabled={!order.pickup_location?.coordinates || !order.dropoff_location?.coordinates}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 ml-1" />
                      عرض المسار
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">لا توجد طلبات</h3>
            <p className="text-gray-500 mt-2">لم تقم بإنشاء أي طلبات حتى الآن</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/customer/create-order')}
            >
              إنشاء طلب جديد
            </Button>
          </div>
        )}

        {selectedOrder && (
          <OrderMapDialog 
            isOpen={mapDialogOpen} 
            onClose={() => setMapDialogOpen(false)} 
            order={selectedOrder} 
          />
        )}
      </main>
    </div>
  );
};

export default MyOrders;
