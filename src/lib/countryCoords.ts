// Country name → [lat, lng] centroid mapping
export const COUNTRY_COORDS: Record<string, [number, number]> = {
  "afghanistan": [33.9, 67.7], "albania": [41.2, 20.2], "algeria": [28.0, 1.7],
  "angola": [-11.2, 17.9], "argentina": [-38.4, -63.6], "armenia": [40.1, 45.0],
  "australia": [-25.3, 133.8], "austria": [47.5, 14.6], "azerbaijan": [40.1, 47.6],
  "bahrain": [26.0, 50.6], "bangladesh": [23.7, 90.4], "belarus": [53.7, 28.0],
  "belgium": [50.5, 4.5], "bolivia": [-16.3, -63.6], "bosnia": [44.2, 17.2],
  "brazil": [-14.2, -51.9], "bulgaria": [42.7, 25.5], "burkina faso": [12.4, -1.6],
  "burma": [21.9, 95.9], "myanmar": [21.9, 95.9], "cambodia": [12.6, 104.9],
  "cameroon": [3.8, 11.5], "canada": [56.1, -106.3], "chad": [15.5, 18.7],
  "chile": [-35.7, -71.5], "china": [35.9, 104.2], "colombia": [4.6, -74.3],
  "congo": [-4.0, 21.8], "croatia": [45.1, 15.2], "cuba": [21.5, -79.5],
  "czech republic": [49.8, 15.5], "denmark": [56.3, 9.5], "drc": [-4.0, 21.8],
  "ecuador": [-1.8, -78.2], "egypt": [26.8, 30.8], "eritrea": [15.2, 39.8],
  "ethiopia": [9.1, 40.5], "finland": [61.9, 25.7], "france": [46.2, 2.2],
  "georgia": [42.3, 43.4], "germany": [51.2, 10.5], "ghana": [7.9, -1.0],
  "greece": [39.1, 21.8], "guatemala": [15.8, -90.2], "guinea": [11.0, -10.9],
  "haiti": [18.9, -72.3], "honduras": [15.2, -86.2], "hungary": [47.2, 19.5],
  "india": [20.6, 78.9], "indonesia": [-0.8, 113.9], "iran": [32.4, 53.7],
  "iraq": [33.2, 43.7], "ireland": [53.4, -8.2], "israel": [31.1, 34.9],
  "italy": [41.9, 12.6], "ivory coast": [7.5, -5.5], "japan": [36.2, 138.3],
  "jordan": [30.6, 36.2], "kazakhstan": [48.0, 66.9], "kenya": [-0.0, 37.9],
  "north korea": [40.3, 127.5], "south korea": [35.9, 127.8], "kosovo": [42.6, 20.9],
  "kurdistan": [36.0, 44.0], "kuwait": [29.3, 47.5], "kyrgyzstan": [41.2, 74.8],
  "laos": [19.9, 102.5], "lebanon": [33.9, 35.5], "libya": [26.3, 17.2],
  "mali": [17.6, -2.0], "mexico": [23.6, -102.6], "moldova": [47.4, 28.4],
  "mongolia": [46.9, 103.8], "morocco": [31.8, -7.1], "mozambique": [-18.7, 35.5],
  "namibia": [-22.0, 17.1], "nepal": [28.4, 84.1], "netherlands": [52.1, 5.3],
  "nicaragua": [12.9, -85.2], "niger": [17.6, 8.1], "nigeria": [9.1, 8.7],
  "norway": [60.5, 8.5], "oman": [21.5, 55.9], "pakistan": [30.4, 69.3],
  "palestine": [31.9, 35.2], "gaza": [31.4, 34.3], "panama": [8.5, -80.8],
  "peru": [-9.2, -75.0], "philippines": [12.9, 121.8], "poland": [51.9, 19.1],
  "portugal": [39.4, -8.2], "qatar": [25.4, 51.2], "romania": [45.9, 24.9],
  "russia": [61.5, 105.3], "rwanda": [-1.9, 29.9], "saudi arabia": [23.9, 45.1],
  "senegal": [14.5, -14.5], "serbia": [44.0, 21.0], "sierra leone": [8.5, -11.8],
  "somalia": [5.2, 46.2], "south africa": [-30.6, 22.9], "south sudan": [6.9, 31.3],
  "spain": [40.5, -3.7], "sri lanka": [7.9, 80.8], "sudan": [12.9, 30.2],
  "sweden": [60.1, 18.6], "switzerland": [46.8, 8.2], "syria": [34.8, 38.9],
  "taiwan": [23.7, 121.0], "tajikistan": [38.9, 71.3], "tanzania": [-6.4, 34.9],
  "thailand": [15.9, 100.9], "tigray": [14.0, 38.5], "togo": [8.6, 0.8],
  "tunisia": [33.9, 9.5], "turkey": [38.9, 35.2], "turkmenistan": [38.9, 59.6],
  "uganda": [1.4, 32.3], "ukraine": [48.4, 31.2], "united arab emirates": [23.4, 53.8],
  "uae": [23.4, 53.8], "united kingdom": [55.4, -3.4], "uk": [55.4, -3.4],
  "united states": [37.1, -95.7], "usa": [37.1, -95.7], "us": [37.1, -95.7],
  "uruguay": [-32.5, -55.8], "uzbekistan": [41.4, 64.6], "venezuela": [6.4, -66.6],
  "vietnam": [14.1, 108.3], "west bank": [31.9, 35.2], "yemen": [15.6, 48.5],
  "zambia": [-13.1, 27.8], "zimbabwe": [-20.0, 30.0],
};

export function extractCoords(text: string): [number, number] | null {
  const lower = text.toLowerCase();
  // Longest match first so "south korea" beats "korea"
  const sorted = Object.keys(COUNTRY_COORDS).sort((a, b) => b.length - a.length);
  for (const country of sorted) {
    if (lower.includes(country)) return COUNTRY_COORDS[country];
  }
  return null;
}

export function extractCountry(text: string): string | null {
  const lower = text.toLowerCase();
  const sorted = Object.keys(COUNTRY_COORDS).sort((a, b) => b.length - a.length);
  for (const country of sorted) {
    if (lower.includes(country)) return country.replace(/\b\w/g, c => c.toUpperCase());
  }
  return null;
}
