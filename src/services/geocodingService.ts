/**
 * Real-Time Geocoding Service for Italian Real Estate Assets
 * Integrates OpenStreetMap Nominatim with street-level accuracy,
 * caching, and intelligent fallback for Italian municipalities.
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  accuracy: 'HOUSE_NUMBER' | 'STREET' | 'MICROZONE' | 'CITY';
  postcode?: string;
  city?: string;
  province?: string;
  road?: string;
  houseNumber?: string;
  boundingBox?: [number, number, number, number]; // [south, north, west, east]
}

// Coordinate precise per capoluoghi e zone strategiche italiane (fallback ad alta precisione)
const REGIONAL_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  campobasso: { lat: 41.5603, lng: 14.6627 },
  roma: { lat: 41.9028, lng: 12.4964 },
  milano: { lat: 45.4642, lng: 9.1900 },
  napoli: { lat: 40.8518, lng: 14.2681 },
  torino: { lat: 45.0703, lng: 7.6869 },
  palermo: { lat: 38.1157, lng: 13.3615 },
  genova: { lat: 44.4056, lng: 8.9463 },
  bologna: { lat: 44.4949, lng: 11.3426 },
  firenze: { lat: 43.7696, lng: 11.2558 },
  bari: { lat: 41.1171, lng: 16.8719 },
  catania: { lat: 37.5079, lng: 15.0873 },
  verona: { lat: 45.4384, lng: 10.9916 },
  venezia: { lat: 45.4408, lng: 12.3155 },
  messina: { lat: 38.1938, lng: 15.5540 },
  padova: { lat: 45.4064, lng: 11.8768 },
  trieste: { lat: 45.6495, lng: 13.7768 },
  brescia: { lat: 45.5416, lng: 10.2118 },
  parma: { lat: 44.8015, lng: 10.3279 },
  taranto: { lat: 40.4644, lng: 17.2470 },
  modena: { lat: 44.6471, lng: 10.9252 },
  perugia: { lat: 43.1107, lng: 12.3908 },
  pescara: { lat: 42.4618, lng: 14.2160 },
  livorno: { lat: 43.5485, lng: 10.3106 },
  cagliari: { lat: 39.2238, lng: 9.1217 },
  foggia: { lat: 41.4622, lng: 15.5447 },
  rimini: { lat: 44.0678, lng: 12.5695 },
  salerno: { lat: 40.6824, lng: 14.7681 },
  ferrara: { lat: 44.8381, lng: 11.6198 },
  sassari: { lat: 40.7259, lng: 8.5556 },
  monza: { lat: 45.5845, lng: 9.2744 },
  bergamo: { lat: 45.6983, lng: 9.6773 },
  trento: { lat: 46.0748, lng: 11.1217 },
  bolzano: { lat: 46.4983, lng: 11.3548 },
  ancona: { lat: 43.6158, lng: 13.5189 },
  udine: { lat: 46.0637, lng: 13.2446 },
  isernia: { lat: 41.5956, lng: 14.2347 }
};

// In-memory cache to avoid redundant API calls
const geocodingCache = new Map<string, GeocodingResult>();

/**
 * Normalizes an Italian address string for optimal geocoder resolution.
 */
function cleanAddressForQuery(address: string, city: string, province?: string): string {
  let cleaned = address
    .replace(/\b(n\.|num\.|numero|piano|int\.|interno|scala|sc\.)\s*[0-9a-zA-Z\/\-]+/gi, ' ')
    .replace(/[,\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If there's an original house number, keep it at the end of the street
  const numberMatch = address.match(/\b(?:n\.|num\.|numero)?\s*([0-9]{1,4}(?:\/[a-zA-Z0-9]+)?)\b/i);
  if (numberMatch && !cleaned.includes(numberMatch[1])) {
    cleaned = `${cleaned} ${numberMatch[1]}`;
  }

  const queryParts = [cleaned, city];
  if (province && province.length === 2) {
    queryParts.push(province.toUpperCase());
  }
  queryParts.push('Italia');

  return queryParts.filter(Boolean).join(', ');
}

/**
 * Geocodes an address to exact latitude and longitude coordinates.
 * Tries street-level Nominatim search first, falls back gracefully.
 */
export async function geocodeAddress(
  address: string,
  city: string,
  province?: string
): Promise<GeocodingResult | null> {
  const cacheKey = `${address.trim().toLowerCase()}_${city.trim().toLowerCase()}_${(province || '').toLowerCase()}`;
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }

  const query = cleanAddressForQuery(address, city, province);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=it&addressdetails=1&limit=3`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RedipDecisionIntelligence/1.0 (RealEstateApp; contact@proptech-intelligence.it)'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          const addr = item.address || {};
          const isHouse = !!addr.house_number;
          const isRoad = !!addr.road || item.type === 'tertiary' || item.type === 'residential';

          const accuracy: GeocodingResult['accuracy'] = isHouse 
            ? 'HOUSE_NUMBER' 
            : isRoad 
            ? 'STREET' 
            : 'MICROZONE';

          const result: GeocodingResult = {
            lat,
            lng,
            displayName: item.display_name,
            accuracy,
            postcode: addr.postcode,
            city: addr.city || addr.town || addr.village || city,
            province: addr.county ? addr.county.slice(0, 2).toUpperCase() : province,
            road: addr.road,
            houseNumber: addr.house_number
          };

          geocodingCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn('[GeocodingService] Online geocoding warning, falling back to local dataset:', err);
  }

  // Fallback 1: Try searching with city only if street lookup failed
  const cityKey = city.toLowerCase().trim();
  const matchedCityKey = Object.keys(REGIONAL_CITY_COORDINATES).find(c => cityKey.includes(c));

  if (matchedCityKey) {
    const fallbackCoords = REGIONAL_CITY_COORDINATES[matchedCityKey];
    const fallbackResult: GeocodingResult = {
      lat: fallbackCoords.lat,
      lng: fallbackCoords.lng,
      displayName: `${address}, ${city} (${province || ''})`,
      accuracy: 'CITY',
      city
    };
    geocodingCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  return null;
}
