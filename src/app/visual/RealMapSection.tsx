"use client";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip } from "react-leaflet";
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

// Real-world lat/lng for each data item
const CONFLICT_COORDS: Record<string, [number, number]> = {
  c001: [49.5, 32.0],   // Russia-Ukraine (eastern Ukraine)
  c002: [31.5, 34.5],   // Israel-Gaza
  c003: [15.5, 32.5],   // Sudan civil war
  c004: [34.5, 78.0],   // India-China border (Ladakh)
  c005: [17.0, 96.0],   // Myanmar
  c006: [15.0, 2.5],    // Sahel / Mali
  c007: [23.5, 120.0],  // Taiwan Strait
  c008: [18.5, -72.5],  // Haiti
  c009: [9.0, 40.0],    // Ethiopia (Tigray)
  c010: [34.0, 74.5],   // Kashmir
};

const RESOURCE_COORDS: Record<string, [number, number]> = {
  r001: [-22.0, -65.0],  // Bolivia lithium
  r002: [-10.0, -50.0],  // Brazil rare earth
  r003: [72.0, -40.0],   // Greenland rare earth
  r004: [17.0, 8.0],     // Niger uranium
  r005: [0.0, 37.0],     // Kenya/East Africa minerals
  r006: [75.0, 25.0],    // Arctic oil
  r007: [60.0, -95.0],   // Canada oil sands
  r008: [25.0, 45.0],    // Saudi Arabia
  r009: [-25.0, 130.0],  // Australia iron ore
  r010: [26.0, 50.5],    // Qatar gas
};

const ELECTION_COORDS: Record<string, [number, number]> = {
  e001: [35.7, 51.4],    // Iran
  e002: [52.5, 13.4],    // Germany
  e003: [37.5, 127.0],   // South Korea
  e004: [9.1, 7.4],      // Nigeria
  e005: [-6.2, 106.8],   // Indonesia
  e006: [10.5, -66.9],   // Venezuela
  e007: [39.9, 32.9],    // Turkey
  e008: [-15.8, -47.9],  // Brazil
  e009: [33.7, 73.1],    // Pakistan
  e010: [-25.7, 28.2],   // South Africa
};

const INTEL_COORDS: Record<string, [number, number]> = {
  i001: [55.75, 37.6],   // Putin – Moscow
  i002: [37.3, -121.9],  // Musk – California
  i003: [24.7, 46.7],    // MBS – Riyadh
  i004: [40.7, -74.0],   // Trump – New York
  i005: [28.6, 77.2],    // Modi – New Delhi
  i006: [50.4, 30.5],    // Zelensky – Kyiv
  i007: [39.9, 116.4],   // Xi Jinping – Beijing
  i008: [31.8, 35.2],    // Netanyahu – Jerusalem
  i009: [48.9, 2.3],     // Macron – Paris
  i010: [40.7, -74.0],   // Dimon – New York
  i011: [25.2, 55.3],    // UAE meeting
  i012: [26.0, 50.5],    // Bahrain meeting
  i013: [-15.8, -47.9],  // Lula – Brasília
  i014: [19.1, 72.9],    // Mumbai summit
  i015: [1.3, 103.8],    // Singapore intel
};

// Financial center coordinates for money flow routes
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

// Deal connection lines (from country → to country)
const DEAL_ROUTES: [number, number][][] = [
  [[40.7,-74.0], [24.7,46.7]],   // USA → Saudi
  [[51.5,-0.1],  [24.7,46.7]],   // UK → Saudi
  [[39.9,116.4], [25.2,55.3]],   // China → UAE
  [[50.1,8.7],   [28.6,77.2]],   // Germany → India
  [[40.7,-74.0], [35.7,139.7]],  // USA → Japan
  [[9.1,7.4],    [24.7,46.7]],   // Nigeria → Saudi
  [[51.5,-0.1],  [9.1,7.4]],     // UK → Nigeria
];

export default function RealMapSection({ activeLayers, onMarkerClick, selectedId }: Props) {
  const { fmt } = useCurrency();

  return (
    <MapContainer
      center={[20, 15]}
      zoom={2}
      minZoom={2}
      maxZoom={8}
      zoomControl={true}
      style={{ height: "100%", width: "100%", background: "#020c14" }}
    >
      {/* CartoDB Dark Matter tiles — dark theme matching terminal aesthetic */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />

      {/* ── MONEY FLOW ROUTES ── */}
      {activeLayers.has("money") && <>
        {MONEY_ROUTES.map((route, i) => (
          <Polyline key={i} positions={route as any}
            pathOptions={{ color: "#00ff88", weight: 1, opacity: 0.45, dashArray: "6,14" }} />
        ))}
        {/* Financial center dots */}
        {Object.entries(FIN_COORDS).map(([k, pos]) => (
          <CircleMarker key={k} center={pos as any} radius={3}
            pathOptions={{ color: "#00ff88", fillColor: "#00ff88", fillOpacity: 0.9, weight: 1 }}>
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>{k}</Tooltip>
          </CircleMarker>
        ))}
      </>}

      {/* ── DEAL ARC LINES ── */}
      {activeLayers.has("deals") && DEAL_ROUTES.map((route, i) => (
        <Polyline key={i} positions={route as any}
          pathOptions={{ color: "#00aaff", weight: 0.8, opacity: 0.4, dashArray: "4,10" }} />
      ))}

      {/* ── RESOURCE MARKERS ── */}
      {activeLayers.has("resources") && resourcesData.map(r => {
        const pos = RESOURCE_COORDS[r.id]; if (!pos) return null;
        const sel = selectedId === r.id;
        return (
          <CircleMarker key={r.id} center={pos as any} radius={sel ? 14 : 9}
            pathOptions={{ color: "#ffb300", fill: false, weight: sel ? 1.5 : 0.8, opacity: sel ? 0.8 : 0.45 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "resource", data: r }) }}>
            <CircleMarker center={pos as any} radius={sel ? 5 : 3.5}
              pathOptions={{ color: "#ffb300", fillColor: "#ffb300", fillOpacity: 0.9, weight: 0 }}
              eventHandlers={{ click: () => onMarkerClick({ type: "resource", data: r }) }}>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <span style={{ fontFamily: "monospace", fontSize: 9 }}>{r.resource} · {r.country}</span>
              </Tooltip>
            </CircleMarker>
          </CircleMarker>
        );
      })}

      {/* ── ELECTION MARKERS ── */}
      {activeLayers.has("elections") && electionsData.map(e => {
        const pos = ELECTION_COORDS[e.id]; if (!pos) return null;
        const sel = selectedId === e.id;
        return (
          <CircleMarker key={e.id} center={pos as any} radius={sel ? 13 : 8}
            pathOptions={{ color: "#00aaff", fill: false, weight: sel ? 1.5 : 0.8, opacity: sel ? 0.8 : 0.4 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "election", data: e }) }}>
            <CircleMarker center={pos as any} radius={sel ? 5 : 3.5}
              pathOptions={{ color: "#00aaff", fillColor: "#00aaff", fillOpacity: 0.85, weight: 0 }}
              eventHandlers={{ click: () => onMarkerClick({ type: "election", data: e }) }}>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <span style={{ fontFamily: "monospace", fontSize: 9 }}>{e.country} · {e.type}</span>
              </Tooltip>
            </CircleMarker>
          </CircleMarker>
        );
      })}

      {/* ── INTEL MARKERS ── */}
      {activeLayers.has("intel") && intelligenceData.slice(0, 12).map(item => {
        const pos = INTEL_COORDS[item.id]; if (!pos) return null;
        const sel = selectedId === item.id;
        const isCrit = item.significance === "CRITICAL";
        return (
          <CircleMarker key={item.id} center={pos as any} radius={sel ? 12 : 7}
            pathOptions={{ color: "#bb77ff", fill: false, weight: sel ? 1.5 : 0.8, opacity: isCrit ? 0.7 : 0.4 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "intel", data: item }) }}>
            <CircleMarker center={pos as any} radius={sel ? 4.5 : 3}
              pathOptions={{ color: "#bb77ff", fillColor: "#bb77ff", fillOpacity: isCrit ? 1 : 0.7, weight: 0 }}
              eventHandlers={{ click: () => onMarkerClick({ type: "intel", data: item }) }}>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <span style={{ fontFamily: "monospace", fontSize: 9 }}>{item.person} · {item.significance}</span>
              </Tooltip>
            </CircleMarker>
          </CircleMarker>
        );
      })}

      {/* ── CONFLICT MARKERS ── */}
      {activeLayers.has("conflicts") && conflictsData.map(c => {
        const pos = CONFLICT_COORDS[c.id]; if (!pos) return null;
        const color = INTENSITY_COLOR[c.intensity];
        const sel = selectedId === c.id;
        return (
          <CircleMarker key={`${c.id}-outer`} center={pos as any} radius={sel ? 22 : 16}
            pathOptions={{ color, fill: false, weight: 0.7, opacity: 0.25 }}
            eventHandlers={{ click: () => onMarkerClick({ type: "conflict", data: c }) }}>
            <CircleMarker center={pos as any} radius={sel ? 14 : 10}
              pathOptions={{ color, fill: false, weight: sel ? 1.5 : 0.9, opacity: sel ? 0.7 : 0.5 }}
              eventHandlers={{ click: () => onMarkerClick({ type: "conflict", data: c }) }}>
              <CircleMarker center={pos as any} radius={sel ? 7 : 5}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 0 }}
                eventHandlers={{ click: () => onMarkerClick({ type: "conflict", data: c }) }}>
                <Tooltip direction="top" offset={[0, -12]} opacity={0.95} permanent={c.intensity === "CRITICAL"}>
                  <span style={{ fontFamily: "monospace", fontSize: 9, color }}>{c.country.split("/")[0].trim()} · {c.intensity}</span>
                </Tooltip>
              </CircleMarker>
            </CircleMarker>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
