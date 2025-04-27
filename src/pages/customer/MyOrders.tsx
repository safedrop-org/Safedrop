import React, { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Card } from '@/components/ui/card';
import { LoaderIcon } from 'lucide-react';
import { useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { Badge } from '@/components/ui/badge';

const MyOrders = () => {
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-full">
            <LoaderIcon className="animate-spin" />
            <span className="mr-2">جاري تحميل الخريطة...</span>
          </div>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    let badgeColor = "secondary";
    let statusText = status;

    switch (status) {
      case "available":
        badgeColor = "default";
        statusText = "متاح";
        break;
      case "picked_up":
        badgeColor = "blue";
        statusText = "تم الالتقاط";
        break;
      case "in_transit":
        badgeColor = "violet";
        statusText = "في الطريق";
        break;
      case "approaching":
        badgeColor = "orange";
        statusText = "قريب";
        break;
      case "completed":
        badgeColor = "green";
        statusText = "مكتمل";
        break;
      case "cancelled":
        badgeColor = "destructive";
        statusText = "ملغي";
        break;
      default:
        break;
    }

    return (
      <Badge variant={badgeColor}>
        {statusText}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">طلباتي</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-4">
                <div className="flex justify-center items-center">
                  <LoaderIcon className="animate-spin" />
                  <span className="mr-2">جاري تحميل الطلبات...</span>
                </div>
              </Card>
            ) : orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <Card
                  key={order.id}
                  className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">الطلب #{order.id.substring(0, 8)}</h2>
                      <p className="text-gray-500">تاريخ الطلب: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm mt-2 text-gray-600">
                    من: {order.pickup_location?.address} <br />
                    إلى: {order.dropoff_location?.address}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="p-4">
                <p className="text-center text-gray-500">لا توجد طلبات حالية</p>
              </Card>
            )}
          </div>

          {/* Map Display */}
          <div className="h-[600px] relative">
            <Card className="h-full">
              <GoogleMap
                zoom={13}
                center={selectedOrder?.pickup_location || { lat: 24.7136, lng: 46.6753 }}
                mapContainerClassName="w-full h-full rounded-lg"
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {selectedOrder && (
                  <>
                    {selectedOrder.pickup_location && (
                      <MarkerF
                        position={selectedOrder.pickup_location}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        }}
                      />
                    )}
                    {selectedOrder.dropoff_location && (
                      <MarkerF
                        position={selectedOrder.dropoff_location}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        }}
                      />
                    )}
                  </>
                )}
              </GoogleMap>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyOrders;
