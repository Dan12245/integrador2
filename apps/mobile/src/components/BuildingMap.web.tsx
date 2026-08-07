import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

type Props = {
  lat: number | null;
  long: number | null;
  addressLabel?: string;
  onLocationSelect?: (lat: number, long: number) => void;
};

export default function BuildingMap(props: Props) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    import("./LeafletMapInner").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

  return <MapComponent {...props} />;
}