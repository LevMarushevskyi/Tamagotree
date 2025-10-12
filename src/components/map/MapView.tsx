import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapViewProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
}

// Component to handle map centering
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

const MapView = ({ onLocationUpdate }: MapViewProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Durham, NC default coordinates
  const defaultCenter: [number, number] = [35.9940, -78.8986];
  const mapCenter = userLocation || defaultCenter;

  useEffect(() => {
    // Request user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setIsLoadingLocation(false);

          if (onLocationUpdate) {
            onLocationUpdate(lat, lng);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError(error.message);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  }, [onLocationUpdate]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 15 : 13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
      >
        {/* Map Tiles - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />

        {/* User Location Marker and Circle */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">You are here!</p>
                  <p className="text-sm text-muted-foreground">
                    {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Blue circle around user location */}
            <Circle
              center={userLocation}
              radius={100}
              pathOptions={{
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                color: "#3b82f6",
                weight: 2,
              }}
            />
          </>
        )}

        {/* Center map on user location when it updates */}
        {userLocation && <MapController center={userLocation} />}
      </MapContainer>

      {/* Location Status Overlay */}
      {isLoadingLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">Getting your location...</p>
        </div>
      )}

      {locationError && !userLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg shadow-lg max-w-sm">
          <p className="text-sm font-semibold">Location Error</p>
          <p className="text-xs">{locationError}</p>
          <p className="text-xs mt-1">Showing Durham, NC area</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
