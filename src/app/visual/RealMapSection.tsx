"use client";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import { conflictsData, resourcesData, dealsData, electionsData, intelligenceData, moneyMovesData } from "@/lib/mockData";
import { LayerKey, MarkerData } from "./WorldMapSection";
import { useCurrency } from "@/context/CurrencyContext";

interface Props {
  activeLayers: Set<LayerKey>;
  onMarkerClick: (m: MarkerData | null) => void;
  selectedId: string | null;
}

const INTENSITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff3366", HIGH: "#ff6600", MEDIUM: "#ffb300", LOW: "#00ff88",
};

const CONFLICT_COORDS: Record<string, [number, number]> = {
  c001: [49.5, 32.0],
  c002: [31.5, 34.5],
  c003: [15.5, 32.5],
  c004: [34.5, 78.0],
  c005: [17.0, 96.0],
  c006: [15.0, 2.5],
  c007: [23.5, 120.0],
  c008: [18.5, -72.5],
  c009: [9.0, 40.0],
  c010: [34.0, 74.5],
};

const RESOURCE_COORDS: Record<string, [number, number]> = {
  r001: [-22.0, -65.0],
  r002: [-10.0, -50.0],
  r003: [72.0, -40.0],
  r004: [17.0, 8.0],
  r005: [0.0, 37.0],
  r006: [75.0, 25.0],
  r007: [60.0, -95.0],
  r008: [25.0, 45.0],
  r009: [-25.0, 130.0],
  r010: [26.0, 50.5],
};

const ELECTION_COORDS: Record<string, [number, number]> = {
  e001: [35.7, 51.4],
  e002: [52.5, 13.4],
  e003: [37.5, 127.0],
  e004: [9.1, 7.4],
  e005: [-6.2, 106.8],
  e006: [10.5, -66.9],
  e007: [39.9, 32.9],
  e008: [-15.8, -47.9],
  e009: [33.7, 73.1],
  e010: [-25.7, 28.2],
};

const INTEL_COORDS: Record<string, [number, number]> = {
  i001: [55.75, 37.6],
  i002: [37.3, -121.9],
  i003: [24.7, 46.7],
  i004: [40.7, -74.0],
  i005: [28.6, 77.2],
  i006: [50.4, 30.5],
  i007: [39.9, 116.4],
  i008: [31.8, 35.2],
  i009: [48.9, 2.3],
  i010: [40.7, -74.0],
  i011: [25.2, 55.3],
  i012: [26.0, 50.5],
  i013: [-15.8, -47.9],
  i014: [19.1, 72.9],
  i015: [1.3, 103.8],
};

const FIN_COORDS: Record<string, [number, number]> = {
  NY:  [40.7, -74.0],
  LDN: [51.5, -0.1],
  DXB: [25.2, 55.3],
  SIN: [1.3, 103.8],
  TKY: [35.7, 139.7],
  FRA: [50.1, 8.7],
  HKG: [22.3, 114.2],
  BOM: [19.1, 72.9],
};

const MONEY_ROUTES: [number, number][][] = [
  [FIN_COORDS.NY,  FIN_COORDS.LDN],
  [FIN_COORDS.LDN, FIN_COORDS.DXB],
  [FIN_COORDS.DXB, FIN_COORDS.SIN],
  [FIN_COORDS.SIN, FIN_COORDS.TKY],
  [FIN_COORDS.NY,  FIN_COORDS.FRA],
  [FIN_COORDS.FRA, FIN_COORDS.LDN],
  [FIN_COORDS.DXB, FIN_COORDS.BOM],
  [FIN_COORDS.HKG, FIN_COORDS.SIN],
  [FIN_COORDS.LDN, FIN_COORDS.HKG],
];

const DEAL_ROUTES: [number, number][][] = [
  [[40.7,-74.0], [24.7,46.7]],
  [[51.5,-0.1],  [24.7,46.7]],
  [[39.9,116.4], [25.2,55.3]],
  [[50.1,8.7],   [28.6,77.2]],
  [[40.7,-74.0], [35.7,139.7]],
  [[9.1,7.4],    [24.7,46.7]],
  [[51.5,-0.1],  [9.1,7.4]],
];

// Smooth scroll to fit whole world on mount
function FitWorld() {
  const map = useMap();
  useEffect(() => {
    map.setView([20, 10], 2, { animate: false });
  }, [map]);
  return null;
}

export default function RealMapSection({ activeLayers, onMarkerClick, selectedId }: Props) {
  const { fmt } = useCurrency();

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={1}
      maxZoom={18}
      zoomControl={true}
      worldCopyJump={true}
      style={{ height: "100%", width: "100%", background: "#0a1628" }}
    >
      <FitWorld />

      {/* ESRI World Imagery — real satellite tiles, free, no API key */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        maxZoom={19}
        maxNativeZoom={17}
      />

      {/* ESRI World Labels overlay — city/country names like Google Earth hybrid */}
      <TileLayer
        url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution=""
        maxZoom={19}
        maxNativeZoom={17}
        opacity={0.8}
      />

      {/* ── MONEY FLOW ROUTES ── */}
      {activeLayers.has("money") && <>
        {MONEY_ROUTES.map((route, i) => (
          <Polyline key={i} positions={route as any}
            pathOptions={{ color: "#00ff88", weight: 2, opacity: 0.7, dashArray: "6,10" }} />
        ))}
        {Object.entries(FIN_COORDS).map(([k, pos]) => (
          <CircleMarker key={k} center={pos as any} radius={5}
            pathOptions={{ color: "#ffffff", fillColor: "#00ff88", fillOpacity: 1, weight: 1.5 }}>
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: "bold" }}>{k}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </>}

      {/* ── DEAL ARC LINES ── */}
      {activeLayers.has("deals") && DEAL_ROUTES.map((route, i) => (
        <Polyline key={i} positions={route as any}
          pathOptions={{ color: "#00aaff", weight: 1.5, opacity: 0.65, dashArray: "5,8" }} />
      ))}

      {/* ── RESOURCE MARKERS ── */}
      {activeLayers.has("resources") && resourcesData.map(r => {
        const pos = RESOURCE_COORDS[r.id]; if (!pos) return null;
        const sel = selectedId === r.id;
        return (
          <CircleMarker key={r.id} center={pos as any} radius={sel ? 16 : 10}
            pathOptions={{ color: "#ffffff", fillColor: "#ffb300", fillOpacity: 0.92, weight: 2 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "resource", data: r }) }}>
            <Tooltip direction="top" offset={[0, -12]} opacity={1}>
              <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: "bold" }}>
                ⛏ {r.resource} · {r.country}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* ── ELECTION MARKERS ── */}
      {activeLayers.has("elections") && electionsData.map(e => {
        const pos = ELECTION_COORDS[e.id]; if (!pos) return null;
        const sel = selectedId === e.id;
        return (
          <CircleMarker key={e.id} center={pos as any} radius={sel ? 14 : 9}
            pathOptions={{ color: "#ffffff", fillColor: "#00aaff", fillOpacity: 0.9, weight: 2 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "election", data: e }) }}>
            <Tooltip direction="top" offset={[0, -12]} opacity={1}>
              <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: "bold" }}>
                🗳 {e.country} · {e.type}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* ── INTEL MARKERS ── */}
      {activeLayers.has("intel") && intelligenceData.slice(0, 12).map(item => {
        const pos = INTEL_COORDS[item.id]; if (!pos) return null;
        const sel = selectedId === item.id;
        const isCrit = item.significance === "CRITICAL";
        return (
          <CircleMarker key={item.id} center={pos as any} radius={sel ? 13 : 8}
            pathOptions={{ color: "#ffffff", fillColor: "#bb77ff", fillOpacity: isCrit ? 1 : 0.8, weight: 2 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "intel", data: item }) }}>
            <Tooltip direction="top" offset={[0, -12]} opacity={1}>
              <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: "bold" }}>
                👁 {item.person} · {item.significance}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}

      {/* ── CONFLICT MARKERS ── */}
      {activeLayers.has("conflicts") && conflictsData.map(c => {
        const pos = CONFLICT_COORDS[c.id]; if (!pos) return null;
        const color = INTENSITY_COLOR[c.intensity];
        const sel = selectedId === c.id;
        return (
          <CircleMarker key={`${c.id}-outer`} center={pos as any} radius={sel ? 26 : 19}
            pathOptions={{ color, fill: false, weight: 1.5, opacity: 0.5 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "conflict", data: c }) }}>
            <CircleMarker center={pos as any} radius={sel ? 15 : 11}
              pathOptions={{ color, fill: false, weight: sel ? 2 : 1.2, opacity: 0.85 }}
              eventHandlers={{ click: () => onMarkerClick({ type: "conflict", data: c }) }}>
              <CircleMarker center={pos as any} radius={sel ? 8 : 5.5}
                pathOptions={{ color: "#ffffff", fillColor: color, fillOpacity: 1, weight: 1.5 }}
                eventHandlers={{ click: () => onMarkerClick({ type: "conflict", data: c }) }}>
                <Tooltip direction="top" offset={[0, -14]} opacity={1} permanent={c.intensity === "CRITICAL"}>
                  <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: "bold", color }}>
                    ⚠ {c.country.split("/")[0].trim()} · {c.intensity}
                  </span>
                </Tooltip>
              </CircleMarker>
            </CircleMarker>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
