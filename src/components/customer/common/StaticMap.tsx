import React, { useState, useEffect } from "react";

interface StaticMapProps {
  pickup_location: string;
  dropoff_location: string;
  driver_location?: {
    lat: number;
    lng: number;
  };
}

const StaticMap: React.FC<StaticMapProps> = ({
  pickup_location,
  dropoff_location,
  driver_location,
}) => {
  const [mapUrl, setMapUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!pickup_location || !dropoff_location) return;

    const marker = driver_location
      ? `color:red|label:D|${driver_location.lat},${driver_location.lng}`
      : "";

    // Create static map URL
    const staticMapUrl =
      `https://maps.googleapis.com/maps/api/staticmap?` +
      `size=624x351` +
      `&markers=color:green|label:A|${encodeURIComponent(pickup_location)}` +
      `&markers=color:red|label:B|${encodeURIComponent(dropoff_location)}` +
      (marker ? `&markers=${encodeURIComponent(marker)}` : "") +
      `&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

    setMapUrl(staticMapUrl);
  }, [pickup_location, dropoff_location, driver_location]);

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">Failed to load map</div>
    );
  }

  return mapUrl ? (
    <img
      className="mx-auto max-w-full h-auto rounded-lg shadow-md"
      src={mapUrl}
      alt="Route map"
      onError={() => {
        console.error("Failed to load map image");
        setError(true);
      }}
    />
  ) : null;
};

export default StaticMap;
