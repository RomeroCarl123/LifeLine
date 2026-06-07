import { useEffect, useRef, useState } from "react";
import L from "leaflet";

type Props = {
  location: string;
};

const defaultCenter: [number, number] = [20, 0];
const defaultZoom = 2;

const markerIcon = L.divIcon({
  className: "location-map-marker",
  html: '<span class="location-map-marker__dot"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -16],
});

export default function LocationMap({ location }: Props) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const geocodeRequestRef = useRef(0);
  const [status, setStatus] = useState("Search for a city or hospital area to place the map.");

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const trimmedLocation = location.trim();

    if (!map) return;

    if (!trimmedLocation) {
      geocodeRequestRef.current += 1;
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      map.setView(defaultCenter, defaultZoom);
      setStatus("Search for a city or hospital area to place the map.");
      return;
    }

    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;
    const controller = new AbortController();

    setStatus(`Locating ${trimmedLocation} on the map...`);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmedLocation)}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Location search failed.");
        }
        return response.json() as Promise<Array<{ lat: string; lon: string; display_name: string }>>;
      })
      .then((results) => {
        if (geocodeRequestRef.current !== requestId) return;

        const match = results[0];
        if (!match) {
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
            markerRef.current = null;
          }
          map.setView(defaultCenter, defaultZoom);
          setStatus(`No map result found for "${trimmedLocation}".`);
          return;
        }

        const lat = Number(match.lat);
        const lon = Number(match.lon);

        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        markerRef.current = L.marker([lat, lon], { icon: markerIcon })
          .addTo(map)
          .bindPopup(match.display_name);

        map.setView([lat, lon], 13);
        markerRef.current.openPopup();
        setStatus(match.display_name);
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        if (geocodeRequestRef.current !== requestId) return;

        if (markerRef.current) {
          map.removeLayer(markerRef.current);
          markerRef.current = null;
        }
        map.setView(defaultCenter, defaultZoom);
        setStatus(error.message || "Unable to load the map location.");
      });

    return () => controller.abort();
  }, [location]);

  return (
    <div className="location-map-shell relative h-full min-h-[440px] overflow-hidden">
      <div ref={mapElementRef} className="location-map-canvas h-full min-h-[440px] w-full" />
      <div className="location-map-overlay pointer-events-none absolute inset-0" />
      <div className="absolute left-4 top-4 z-[500] max-w-[calc(100%-2rem)] rounded-[1.4rem] border border-[#F1CAD5] bg-white/92 px-4 py-3 shadow-[0_16px_40px_-28px_rgba(138,36,75,0.24)] backdrop-blur-md">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#D02752]">
          Donor Radius
        </p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#8A244B]">
          {status}
        </p>
      </div>
      <div className="absolute bottom-4 right-4 z-[500] rounded-full border border-[#F1CAD5] bg-white/92 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8A244B] shadow-[0_16px_40px_-28px_rgba(138,36,75,0.24)] backdrop-blur-md">
        OpenStreetMap
      </div>
    </div>
  );
}
