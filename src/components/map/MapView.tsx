import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import { supabase } from "@/integrations/supabase/client";
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

// Custom tree icon
const treeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 13v8"/>
      <path d="M12 3v3"/>
      <path d="m9 18 3 3 3-3"/>
      <path d="M8 10a4 4 0 0 1 8 0c0 2.21-1.79 4-4 4s-4-1.79-4-4z"/>
      <path d="M6 6a6 6 0 0 1 12 0c0 3.31-2.69 6-6 6s-6-2.69-6-6z"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Tree {
  id: string;
  name: string;
  species: string | null;
  latitude: number;
  longitude: number;
  health_status: string;
  photo_url: string | null;
  xp_earned: number;
  age_days: number;
  created_at: string;
}

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
  const [trees, setTrees] = useState<Tree[]>([]);

  // Durham, NC default coordinates
  const defaultCenter: [number, number] = [35.9940, -78.8986];
  const mapCenter = userLocation || defaultCenter;

  // Fetch all trees from database
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const { data, error } = await supabase
          .from("trees")
          .select("id, name, species, latitude, longitude, health_status, photo_url, xp_earned, age_days, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTrees(data || []);
      } catch (error) {
        console.error("Error fetching trees:", error);
      }
    };

    fetchTrees();
  }, []);

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

        {/* Tree Markers */}
        {trees.map((tree) => (
          <Marker
            key={tree.id}
            position={[Number(tree.latitude), Number(tree.longitude)]}
            icon={treeIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{tree.name}</h3>
                {tree.species && (
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-semibold">Species:</span> {tree.species}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-semibold">Health:</span>{" "}
                  <span className={tree.health_status === "healthy" ? "text-green-600" : "text-yellow-600"}>
                    {tree.health_status}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-semibold">Age:</span> {tree.age_days} days
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">XP:</span> {tree.xp_earned}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

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
