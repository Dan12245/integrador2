import React, { useRef, useEffect, useMemo } from "react";
import { View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebViewFixed = WebView as any;
type Props = {
  lat: number | null;
  long: number | null;
  addressLabel?: string;
  onLocationSelect?: (lat: number, long: number) => void;
};

const DEFAULT_LAT = 28.6353;
const DEFAULT_LONG = -106.0889;
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 16;

function buildHtml(initialLat: number | null, initialLong: number | null) {
  const hasInitial = initialLat != null && initialLong != null;
  const startLat = hasInitial ? initialLat : DEFAULT_LAT;
  const startLong = hasInitial ? initialLong : DEFAULT_LONG;
  const startZoom = hasInitial ? SELECTED_ZOOM : DEFAULT_ZOOM;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { attributionControl: false }).setView([${startLat}, ${startLong}], ${startZoom});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var marker = null;
    ${hasInitial ? `marker = L.marker([${startLat}, ${startLong}]).addTo(map);` : ""}

    function postToRN(payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

   
    map.on('click', function (e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      postToRN({ type: 'locationSelected', lat: lat, long: lng });
    });

    
    window.setMarkerFromRN = function (lat, lng) {
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      map.flyTo([lat, lng], ${SELECTED_ZOOM}, { duration: 0.8 });
    };
  </script>
</body>
</html>
`;
}

export default function BuildingMap({ lat, long, addressLabel, onLocationSelect }: Props) {
  const webviewRef = useRef<WebView>(null);

  // El HTML solo se construye UNA vez (con las coordenadas iniciales que
  // hubiera en ese momento). Los cambios posteriores de lat/long se mandan
  // via injectJavaScript, no reconstruyendo el HTML -- asi evitamos
  // recargar el WebView completo cada vez que el usuario elige otra direccion.
  const html = useMemo(() => buildHtml(lat, long), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lat != null && long != null) {
      webviewRef.current?.injectJavaScript(
        `window.setMarkerFromRN(${lat}, ${long}); true;`
      );
    }
  }, [lat, long]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "locationSelected") {
        onLocationSelect?.(data.lat, data.long);
      }
    } catch (error) {
      console.log("Error parsing WebView message:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
     <WebViewFixed
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}