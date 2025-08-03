import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { LoaderIcon } from "lucide-react";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import { Badge } from "@/components/ui/badge";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Order } from "@/types/order";

// Extended types for this component
interface LocationWithCoords {
  address?: string;
  formatted_address?: string;
  name?: string;
  description?: string;
  lat?: number;
  lng?: number;
}

interface OrderWithCoords extends Omit<Order, 'pickup_location' | 'dropoff_location'> {
  pickup_location: LocationWithCoords;
  dropoff_location: LocationWithCoords;
  order_id?: string;
  order_number?: string;
}

// Constants
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];
const DEFAULT_MAP_CENTER = { lat: 24.7136, lng: 46.6753 }; // Riyadh coordinates
const MAP_HEIGHT = "600px";
const MAP_ZOOM = 13;

// Map marker icons
const MARKER_ICONS = {
  pickup: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  dropoff: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
} as const;

// Status badge configuration
const STATUS_CONFIG = {
  available: { variant: "default" as const, key: "available" },
  picked_up: { variant: "secondary" as const, key: "pickedUp" },
  in_transit: { variant: "default" as const, key: "inTransit" },
  approaching: { variant: "default" as const, key: "approaching" },
  completed: { variant: "default" as const, key: "completed" },
  cancelled: { variant: "destructive" as const, key: "cancelled" },
} as const;

//Helper Components
const LoadingSpinner = ({ t }: { t: (key: string) => string }) => (
  <div className="flex justify-center items-center">
    <LoaderIcon className="animate-spin" />
    <span className="ml-2">{t("loading")}</span>
  </div>
);

const LoadingLayout = ({ t }: { t: (key: string) => string }) => (
  <div className="flex h-screen bg-gray-50">
    <CustomerSidebar />
    <main className="flex-1 p-6">
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner t={t} />
      </div>
    </main>
  </div>
);

const EmptyOrdersCard = ({ t }: { t: (key: string) => string }) => (
  <Card className="p-4">
    <p className="text-center text-gray-500">{t("noCurrentOrders")}</p>
  </Card>
);

const OrderCard = ({
  order,
  onSelect,
  t,
  formatDate,
  getStatusBadge,
}: {
  order: OrderWithCoords;
  onSelect: (order: OrderWithCoords) => void;
  t: (key: string) => string;
  formatDate: (date: string) => string;
  getStatusBadge: (status: Order["status"]) => JSX.Element;
}) => (
  <Card
    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
    onClick={() => onSelect(order)}
  >
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">
          {t("order")} {order.order_number || order.id}
        </h2>
        <p className="text-gray-500">
          {t("orderDate")}: {formatDate(order.created_at)}
        </p>
      </div>
      {getStatusBadge(order.status)}
    </div>
    <p className="text-sm mt-2 text-gray-600">
      {t("from")}: {order.pickup_location?.address} <br />
      {t("to")}: {order.dropoff_location?.address}
    </p>
  </Card>
);

const OrdersList = ({
  orders,
  isLoading,
  onOrderSelect,
  t,
  formatDate,
  getStatusBadge,
}: {
  orders: OrderWithCoords[] | undefined;
  isLoading: boolean;
  onOrderSelect: (order: OrderWithCoords) => void;
  t: (key: string) => string;
  formatDate: (date: string) => string;
  getStatusBadge: (status: Order["status"]) => JSX.Element;
}) => (
  <div className="space-y-4">
    {isLoading ? (
      <Card className="p-4">
        <LoadingSpinner t={t} />
      </Card>
    ) : orders && orders.length > 0 ? (
      orders.map((order) => (
        <OrderCard
          key={order.order_id || order.id}
          order={order}
          onSelect={onOrderSelect}
          t={t}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      ))
    ) : (
      <EmptyOrdersCard t={t} />
    )}
  </div>
);

const getMapCenter = (selectedOrder: OrderWithCoords | null) => {
  if (selectedOrder?.pickup_location?.lat && selectedOrder?.pickup_location?.lng) {
    return {
      lat: selectedOrder.pickup_location.lat,
      lng: selectedOrder.pickup_location.lng,
    };
  }
  return DEFAULT_MAP_CENTER;
};

const MapDisplay = ({ selectedOrder }: { selectedOrder: OrderWithCoords | null }) => (
  <div className={`h-[${MAP_HEIGHT}] relative`}>
    <Card className="h-full">
      <GoogleMap
        zoom={MAP_ZOOM}
        center={getMapCenter(selectedOrder)}
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
            {selectedOrder.pickup_location?.lat && selectedOrder.pickup_location?.lng && (
              <MarkerF
                position={{
                  lat: selectedOrder.pickup_location.lat,
                  lng: selectedOrder.pickup_location.lng,
                }}
                icon={{ url: MARKER_ICONS.pickup }}
              />
            )}
            {selectedOrder.dropoff_location?.lat && selectedOrder.dropoff_location?.lng && (
              <MarkerF
                position={{
                  lat: selectedOrder.dropoff_location.lat,
                  lng: selectedOrder.dropoff_location.lng,
                }}
                icon={{ url: MARKER_ICONS.dropoff }}
              />
            )}
          </>
        )}
      </GoogleMap>
    </Card>
  </div>
);

const MyOrdersContent = () => {
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCoords | null>(null);
  const { t, language } = useLanguage();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Utility Functions
  const getStatusBadge = (status: Order["status"]) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;
    
    return (
      <Badge variant={config.variant}>
        {t(config.key)}
      </Badge>
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    
    return new Date(dateString).toLocaleDateString(
      language === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const handleOrderSelect = (order: OrderWithCoords) => {
    setSelectedOrder(order);
  };

  // Type guard to ensure we have the right data structure
  const transformOrders = (data: unknown[]): OrderWithCoords[] => {
    return (data as OrderWithCoords[]) || [];
  };

  if (!isLoaded) {
    return <LoadingLayout t={t} />;
  }

  const transformedOrders = transformOrders(orders);

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("orders")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersList
            orders={transformedOrders}
            isLoading={isLoading}
            onOrderSelect={handleOrderSelect}
            t={t}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
          <MapDisplay selectedOrder={selectedOrder} />
        </div>
      </main>
    </div>
  );
};

const MyOrders = () => {
  return (
    <LanguageProvider>
      <MyOrdersContent />
    </LanguageProvider>
  );
};

export default MyOrders;
