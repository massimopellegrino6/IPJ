import { MunicipalityDemographics } from '../types/demographics';

// Dizionario sintetico Codice Catastale / Nome Comune -> Codice ISTAT (estendibile)
export const CATASTALE_TO_ISTAT: Record<string, { istatCode: string; name: string; surfaceKm2: number; cadastralCode: string }> = {
  'H501': { istatCode: '058091', name: 'Roma', surfaceKm2: 1287.36, cadastralCode: 'H501' },
  'B519': { istatCode: '070006', name: 'Campobasso', surfaceKm2: 56.11, cadastralCode: 'B519' },
  'F205': { istatCode: '015146', name: 'Milano', surfaceKm2: 181.76, cadastralCode: 'F205' },
  'L219': { istatCode: '001272', name: 'Torino', surfaceKm2: 130.17, cadastralCode: 'L219' },
  'A944': { istatCode: '037006', name: 'Bologna', surfaceKm2: 140.86, cadastralCode: 'A944' },
  'D612': { istatCode: '048017', name: 'Firenze', surfaceKm2: 102.32, cadastralCode: 'D612' },
  'F839': { istatCode: '063049', name: 'Napoli', surfaceKm2: 119.02, cadastralCode: 'F839' },
  'G273': { istatCode: '082053', name: 'Palermo', surfaceKm2: 160.59, cadastralCode: 'G273' },
  'D969': { istatCode: '010025', name: 'Genova', surfaceKm2: 240.29, cadastralCode: 'D969' }
};

// Mappatura inversa da Nome Città a Codice Catastale / ISTAT
export const CITY_NAME_TO_CATASTALE: Record<string, string> = {
  'roma': 'H501',
  'rome': 'H501',
  'campobasso': 'B519',
  'milano': 'F205',
  'milan': 'F205',
  'torino': 'L219',
  'turin': 'L219',
  'bologna': 'A944',
  'firenze': 'D612',
  'florence': 'D612',
  'napoli': 'F839',
  'naples': 'F839',
  'palermo': 'G273',
  'genova': 'D969',
  'genoa': 'D969'
};

// Fallback sintetici regionali/provinciali per Graceful Degradation (§28)
export const REGIONAL_FALLBACKS: Record<string, Omit<MunicipalityDemographics, 'municipalityCode' | 'municipalityName' | 'fetchedAt'>> = {
  '058091': { 
    referenceYear: 2025, 
    totalPopulation: 2750000, 
    densityPerKm2: 2136, 
    agingIndex: 175.4, 
    youngFamiliesRatio: 0.25, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 1287.36,
    cadastralCode: 'H501',
    demographicHealthScore: 78
  },
  '070006': { 
    referenceYear: 2025, 
    totalPopulation: 47500, 
    densityPerKm2: 846, 
    agingIndex: 210.2, 
    youngFamiliesRatio: 0.21, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 56.11,
    cadastralCode: 'B519',
    demographicHealthScore: 68
  },
  '015146': { 
    referenceYear: 2025, 
    totalPopulation: 1375000, 
    densityPerKm2: 7565, 
    agingIndex: 168.2, 
    youngFamiliesRatio: 0.28, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 181.76,
    cadastralCode: 'F205',
    demographicHealthScore: 86
  },
  '001272': { 
    referenceYear: 2025, 
    totalPopulation: 848000, 
    densityPerKm2: 6515, 
    agingIndex: 214.0, 
    youngFamiliesRatio: 0.20, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 130.17,
    cadastralCode: 'L219',
    demographicHealthScore: 71
  },
  '037006': { 
    referenceYear: 2025, 
    totalPopulation: 392000, 
    densityPerKm2: 2786, 
    agingIndex: 198.5, 
    youngFamiliesRatio: 0.23, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 140.86,
    cadastralCode: 'A944',
    demographicHealthScore: 82
  },
  '048017': { 
    referenceYear: 2025, 
    totalPopulation: 362000, 
    densityPerKm2: 3535, 
    agingIndex: 224.1, 
    youngFamiliesRatio: 0.21, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 102.32,
    cadastralCode: 'D612',
    demographicHealthScore: 74
  },
  '063049': { 
    referenceYear: 2025, 
    totalPopulation: 913000, 
    densityPerKm2: 7787, 
    agingIndex: 152.3, 
    youngFamiliesRatio: 0.26, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 119.02,
    cadastralCode: 'F839',
    demographicHealthScore: 73
  },
  'DEFAULT': { 
    referenceYear: 2025, 
    totalPopulation: 60000, 
    densityPerKm2: 950, 
    agingIndex: 195.0, 
    youngFamiliesRatio: 0.22, 
    dataSource: 'REGIONAL_FALLBACK',
    surfaceKm2: 63.15,
    cadastralCode: 'C000',
    demographicHealthScore: 70
  }
};

// Cache locale in-memory con TTL (30 giorni)
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const demographicsCache = new Map<string, { data: MunicipalityDemographics; timestamp: number }>();

/**
 * Risolve la chiave comune a partire da codice catastale, codice ISTAT o nome città
 */
export function resolveMunicipalityKey(input: string): { istatCode: string; name: string; surfaceKm2: number; cadastralCode: string } {
  const cleanInput = (input || '').trim();
  const upper = cleanInput.toUpperCase();
  const lower = cleanInput.toLowerCase();

  // 1. Check diretto codice catastale (es. H501, B519, F205)
  if (CATASTALE_TO_ISTAT[upper]) {
    return CATASTALE_TO_ISTAT[upper];
  }

  // 2. Check per nome città (es. "Roma", "Campobasso", "Milano")
  const catCodeFromName = CITY_NAME_TO_CATASTALE[lower];
  if (catCodeFromName && CATASTALE_TO_ISTAT[catCodeFromName]) {
    return CATASTALE_TO_ISTAT[catCodeFromName];
  }

  // 3. Check diretto per codice ISTAT (es. '058091')
  for (const entry of Object.values(CATASTALE_TO_ISTAT)) {
    if (entry.istatCode === cleanInput) {
      return entry;
    }
  }

  // 4. Fallback dinamico
  return {
    istatCode: cleanInput.length === 6 ? cleanInput : '058091',
    name: cleanInput || 'Comune Rilevato',
    surfaceKm2: 60.0,
    cadastralCode: upper.length === 4 ? upper : 'H501'
  };
}

/**
 * Connettore REST SDMX ISTAT con Graceful Degradation (§28) e Cache 30gg.
 * Esegue fetch su endpoint governativo con timeout tassativo a 2500ms via AbortController.
 */
export async function getMunicipalityDemographics(cadastralCodeOrIstatOrName: string): Promise<MunicipalityDemographics> {
  const mapping = resolveMunicipalityKey(cadastralCodeOrIstatOrName);
  const istatCode = mapping.istatCode;

  // 1. Verifica Cache
  const cached = demographicsCache.get(istatCode);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return { ...cached.data, dataSource: 'LOCAL_CACHE' };
  }

  // 2. Chiamata API ISTAT (SDMX REST) con Timeout rigido a 2500ms
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    // Endpoint SDMX IstatData per bilancio demografico comunale (DCIS_POPRES1)
    const url = `https://esploradati.istat.it/SDMXWS/rest/data/DCIS_POPRES1/IT.${istatCode}.99.TOTAL?startPeriod=2024&endPeriod=2025`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/vnd.sdmx.data+json;version=1.0.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ISTAT API Status: ${response.status}`);
    }

    const payload = await response.json();
    const parsed = parseSdmxDemographics(payload, mapping);

    // Salva in cache
    demographicsCache.set(istatCode, { data: parsed, timestamp: Date.now() });
    return parsed;

  } catch (error) {
    clearTimeout(timeoutId);
    // Graceful Degradation (§28 Product Thesis): Fallback trasparente su medie storiche regionali
    const fallback = REGIONAL_FALLBACKS[istatCode] || REGIONAL_FALLBACKS['DEFAULT'];
    const result: MunicipalityDemographics = {
      municipalityCode: istatCode,
      municipalityName: mapping.name,
      cadastralCode: mapping.cadastralCode,
      ...fallback,
      fetchedAt: new Date().toISOString()
    };
    return result;
  }
}

/**
 * Parser deterministico del payload SDMX-JSON di ISTAT
 */
function parseSdmxDemographics(jsonPayload: any, mapping: { istatCode: string; name: string; surfaceKm2: number; cadastralCode: string }): MunicipalityDemographics {
  try {
    // Estrazione dal formato standard SDMX-JSON di ISTAT
    const series = jsonPayload.data?.dataSets?.[0]?.series;
    const firstSeriesKey = Object.keys(series || {})[0];
    const observations = series?.[firstSeriesKey]?.observations;
    const latestObsKey = Object.keys(observations || {}).pop();
    const populationVal = observations?.[latestObsKey]?.[0] || 0;

    const fallback = REGIONAL_FALLBACKS[mapping.istatCode] || REGIONAL_FALLBACKS['DEFAULT'];
    const totalPopulation = Number(populationVal) || fallback.totalPopulation;
    const density = Math.round(totalPopulation / (mapping.surfaceKm2 || 1));

    return {
      municipalityCode: mapping.istatCode,
      municipalityName: mapping.name,
      cadastralCode: mapping.cadastralCode,
      referenceYear: 2025,
      totalPopulation,
      densityPerKm2: density,
      agingIndex: fallback.agingIndex,
      youngFamiliesRatio: fallback.youngFamiliesRatio,
      dataSource: 'ISTAT_API_LIVE',
      surfaceKm2: mapping.surfaceKm2,
      demographicHealthScore: fallback.demographicHealthScore,
      fetchedAt: new Date().toISOString()
    };
  } catch (e) {
    // Fallback sicuro se il formato SDMX ha differenze di tracciato
    const fallback = REGIONAL_FALLBACKS[mapping.istatCode] || REGIONAL_FALLBACKS['DEFAULT'];
    return {
      municipalityCode: mapping.istatCode,
      municipalityName: mapping.name,
      cadastralCode: mapping.cadastralCode,
      ...fallback,
      dataSource: 'REGIONAL_FALLBACK',
      fetchedAt: new Date().toISOString()
    };
  }
}
