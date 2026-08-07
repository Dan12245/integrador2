//este archivo es para que no caiga pedo cuando expo ande armando el proyecto, todo por culpa del mapa q google no me pudpo soltar la api
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  lat: number | null;
  long: number | null;
  addressLabel?: string;
  onLocationSelect?: (lat: number, long: number) => void;
};

const DEFAULT_CENTER: [number, number] = [28.6353, -106.0889];
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 16;

function RecenterOnChange({ lat, long }: { lat: number | null; long: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && long != null) {
      map.flyTo([lat, long], SELECTED_ZOOM, { duration: 0.8 });
    }
  }, [lat, long, map]);
  return null;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, long: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function BuildingMap({ lat, long, addressLabel, onLocationSelect }: Props) {
  return (
    // Antes: width/height fijos en px. Ahora llena al 100% del padre.
    <div style={{ width: "100%", height: "100%" }}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <RecenterOnChange lat={lat} long={long} />
        <ClickHandler onLocationSelect={onLocationSelect} />
        {lat != null && long != null && (
          <Marker position={[lat, long]}>
            <Popup>{addressLabel}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}