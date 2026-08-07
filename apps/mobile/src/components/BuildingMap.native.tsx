import React, { useRef, useEffect } from "react";
import MapView, { Marker, Region } from "react-native-maps";

type Props = {
  lat: number | null;
  long: number | null;
  addressLabel?: string;
  onLocationSelect?: (lat: number, long: number) => void;
};

const DEFAULT_REGION: Region = {
  latitude: 28.6353,
  longitude: -106.0889,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

export default function BuildingMap({ lat, long, addressLabel, onLocationSelect }: Props) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (lat != null && long != null && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: lat, longitude: long, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        800
      );
    }
  }, [lat, long]);

  const handlePress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onLocationSelect?.(latitude, longitude);
  };

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={DEFAULT_REGION}
      onPress={handlePress}
    >
      {lat != null && long != null && (
        <Marker
          coordinate={{ latitude: lat, longitude: long }}
          title="Ubicación del edificio"
          description={addressLabel}
        />
      )}
    </MapView>
  );
}