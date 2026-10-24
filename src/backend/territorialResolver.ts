/**
 * REDIP - Unified Territorial & Cadastral Scoping Engine
 * Conforme alla Product Thesis (§28 Graceful Degradation, §29 Zero Mock Policy).
 * Risolve qualsiasi asset inserito garantendo l'isolamento del contesto geografico-statistico
 * senza memory leak o fallback indebiti su Roma/RM_B1.
 */

export interface ResolvedTerritory {
  belfioreCode: string;          // es. "B519", "H501", "F205"
  istatCode: string;             // es. "070006", "058091"
  municipalityName: string;      // es. "Campobasso", "Roma", "Milano"
  provinceCode: string;          // es. "CB", "RM", "MI"
  zoneCategory: 'CAPOLUOGO' | 'INTERMEDIO' | 'RURALE';
  regionName?: string;
  isUncensored?: boolean;
  lat?: number;
  lon?: number;
}

interface MunicipalityCatalogItem {
  belfioreCode: string;
  istatCode: string;
  municipalityName: string;
  provinceCode: string;
  regionName: string;
  zoneCategory: 'CAPOLUOGO' | 'INTERMEDIO' | 'RURALE';
  lat: number;
  lon: number;
  aliases?: string[];
}

/**
 * Tabella Anagrafica Istituzionale dei Comuni Italiani (Belfiore Catastale <-> ISTAT <-> Coordinate)
 */
const MUNICIPALITIES_CATALOG: MunicipalityCatalogItem[] = [
  // 1. Molise (Focus Asset Campobasso)
  {
    belfioreCode: 'B519',
    istatCode: '070006',
    municipalityName: 'Campobasso',
    provinceCode: 'CB',
    regionName: 'Molise',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.5603,
    lon: 14.6627,
    aliases: ['campobasso', 'cb']
  },
  {
    belfioreCode: 'E372',
    istatCode: '094023',
    municipalityName: 'Isernia',
    provinceCode: 'IS',
    regionName: 'Molise',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.5962,
    lon: 14.2340,
    aliases: ['isernia']
  },
  {
    belfioreCode: 'L113',
    istatCode: '070078',
    municipalityName: 'Termoli',
    provinceCode: 'CB',
    regionName: 'Molise',
    zoneCategory: 'INTERMEDIO',
    lat: 42.0033,
    lon: 14.9961,
    aliases: ['termoli']
  },
  {
    belfioreCode: 'L725',
    istatCode: '094052',
    municipalityName: 'Venafro',
    provinceCode: 'IS',
    regionName: 'Molise',
    zoneCategory: 'INTERMEDIO',
    lat: 41.4853,
    lon: 14.0430,
    aliases: ['venafro']
  },

  // 2. Roma & Lazio
  {
    belfioreCode: 'H501',
    istatCode: '058091',
    municipalityName: 'Roma',
    provinceCode: 'RM',
    regionName: 'Lazio',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.9028,
    lon: 12.4964,
    aliases: ['roma', 'rome', 'capitale']
  },
  {
    belfioreCode: 'E472',
    istatCode: '059011',
    municipalityName: 'Latina',
    provinceCode: 'LT',
    regionName: 'Lazio',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.4676,
    lon: 12.9037,
    aliases: ['latina']
  },
  {
    belfioreCode: 'D810',
    istatCode: '060038',
    municipalityName: 'Frosinone',
    provinceCode: 'FR',
    regionName: 'Lazio',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.6433,
    lon: 13.3444,
    aliases: ['frosinone']
  },
  {
    belfioreCode: 'M082',
    istatCode: '056059',
    municipalityName: 'Viterbo',
    provinceCode: 'VT',
    regionName: 'Lazio',
    zoneCategory: 'CAPOLUOGO',
    lat: 42.4174,
    lon: 12.1047,
    aliases: ['viterbo']
  },
  {
    belfioreCode: 'H282',
    istatCode: '057059',
    municipalityName: 'Rieti',
    provinceCode: 'RI',
    regionName: 'Lazio',
    zoneCategory: 'CAPOLUOGO',
    lat: 42.4042,
    lon: 12.8631,
    aliases: ['rieti']
  },

  // 3. Milano & Lombardia
  {
    belfioreCode: 'F205',
    istatCode: '015146',
    municipalityName: 'Milano',
    provinceCode: 'MI',
    regionName: 'Lombardia',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.4642,
    lon: 9.1900,
    aliases: ['milano', 'milan']
  },
  {
    belfioreCode: 'F704',
    istatCode: '108033',
    municipalityName: 'Monza',
    provinceCode: 'MB',
    regionName: 'Lombardia',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.5845,
    lon: 9.2744,
    aliases: ['monza']
  },
  {
    belfioreCode: 'A794',
    istatCode: '016024',
    municipalityName: 'Bergamo',
    provinceCode: 'BG',
    regionName: 'Lombardia',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.6983,
    lon: 9.6773,
    aliases: ['bergamo']
  },
  {
    belfioreCode: 'B157',
    istatCode: '017029',
    municipalityName: 'Brescia',
    provinceCode: 'BS',
    regionName: 'Lombardia',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.5416,
    lon: 10.2118,
    aliases: ['brescia']
  },

  // 4. Torino & Piemonte
  {
    belfioreCode: 'L219',
    istatCode: '001272',
    municipalityName: 'Torino',
    provinceCode: 'TO',
    regionName: 'Piemonte',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.0703,
    lon: 7.6869,
    aliases: ['torino', 'turin']
  },
  {
    belfioreCode: 'F952',
    istatCode: '003106',
    municipalityName: 'Novara',
    provinceCode: 'NO',
    regionName: 'Piemonte',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.4469,
    lon: 8.6212,
    aliases: ['novara']
  },

  // 5. Bologna & Emilia-Romagna
  {
    belfioreCode: 'A944',
    istatCode: '037006',
    municipalityName: 'Bologna',
    provinceCode: 'BO',
    regionName: 'Emilia-Romagna',
    zoneCategory: 'CAPOLUOGO',
    lat: 44.4949,
    lon: 11.3426,
    aliases: ['bologna']
  },
  {
    belfioreCode: 'F257',
    istatCode: '036022',
    municipalityName: 'Modena',
    provinceCode: 'MO',
    regionName: 'Emilia-Romagna',
    zoneCategory: 'CAPOLUOGO',
    lat: 44.6471,
    lon: 10.9252,
    aliases: ['modena']
  },
  {
    belfioreCode: 'G337',
    istatCode: '034027',
    municipalityName: 'Parma',
    provinceCode: 'PR',
    regionName: 'Emilia-Romagna',
    zoneCategory: 'CAPOLUOGO',
    lat: 44.8015,
    lon: 10.3279,
    aliases: ['parma']
  },

  // 6. Firenze & Toscana
  {
    belfioreCode: 'D612',
    istatCode: '048017',
    municipalityName: 'Firenze',
    provinceCode: 'FI',
    regionName: 'Toscana',
    zoneCategory: 'CAPOLUOGO',
    lat: 43.7696,
    lon: 11.2558,
    aliases: ['firenze', 'florence']
  },
  {
    belfioreCode: 'G702',
    istatCode: '050026',
    municipalityName: 'Pisa',
    provinceCode: 'PI',
    regionName: 'Toscana',
    zoneCategory: 'CAPOLUOGO',
    lat: 43.7228,
    lon: 10.4017,
    aliases: ['pisa']
  },

  // 7. Napoli & Campania
  {
    belfioreCode: 'F839',
    istatCode: '063049',
    municipalityName: 'Napoli',
    provinceCode: 'NA',
    regionName: 'Campania',
    zoneCategory: 'CAPOLUOGO',
    lat: 40.8518,
    lon: 14.2681,
    aliases: ['napoli', 'naples']
  },
  {
    belfioreCode: 'H703',
    istatCode: '065116',
    municipalityName: 'Salerno',
    provinceCode: 'SA',
    regionName: 'Campania',
    zoneCategory: 'CAPOLUOGO',
    lat: 40.6824,
    lon: 14.7681,
    aliases: ['salerno']
  },
  {
    belfioreCode: 'B963',
    istatCode: '061022',
    municipalityName: 'Caserta',
    provinceCode: 'CE',
    regionName: 'Campania',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.0726,
    lon: 14.3323,
    aliases: ['caserta']
  },

  // 8. Altre Città Cardine
  {
    belfioreCode: 'D969',
    istatCode: '010025',
    municipalityName: 'Genova',
    provinceCode: 'GE',
    regionName: 'Liguria',
    zoneCategory: 'CAPOLUOGO',
    lat: 44.4056,
    lon: 8.9463,
    aliases: ['genova', 'genoa']
  },
  {
    belfioreCode: 'G273',
    istatCode: '082053',
    municipalityName: 'Palermo',
    provinceCode: 'PA',
    regionName: 'Sicilia',
    zoneCategory: 'CAPOLUOGO',
    lat: 38.1157,
    lon: 13.3615,
    aliases: ['palermo']
  },
  {
    belfioreCode: 'A662',
    istatCode: '072006',
    municipalityName: 'Bari',
    provinceCode: 'BA',
    regionName: 'Puglia',
    zoneCategory: 'CAPOLUOGO',
    lat: 41.1171,
    lon: 16.8719,
    aliases: ['bari']
  },
  {
    belfioreCode: 'B354',
    istatCode: '092009',
    municipalityName: 'Cagliari',
    provinceCode: 'CA',
    regionName: 'Sardegna',
    zoneCategory: 'CAPOLUOGO',
    lat: 39.2238,
    lon: 9.1217,
    aliases: ['cagliari']
  },
  {
    belfioreCode: 'G478',
    istatCode: '054039',
    municipalityName: 'Perugia',
    provinceCode: 'PG',
    regionName: 'Umbria',
    zoneCategory: 'CAPOLUOGO',
    lat: 43.1107,
    lon: 12.3908,
    aliases: ['perugia']
  },
  {
    belfioreCode: 'G482',
    istatCode: '068028',
    municipalityName: 'Pescara',
    provinceCode: 'PE',
    regionName: 'Abruzzo',
    zoneCategory: 'CAPOLUOGO',
    lat: 42.4618,
    lon: 14.2161,
    aliases: ['pescara']
  },
  {
    belfioreCode: 'A345',
    istatCode: '066049',
    municipalityName: 'L\'Aquila',
    provinceCode: 'AQ',
    regionName: 'Abruzzo',
    zoneCategory: 'CAPOLUOGO',
    lat: 42.3498,
    lon: 13.3995,
    aliases: ['l\'aquila', 'aquila']
  },
  {
    belfioreCode: 'L736',
    istatCode: '027042',
    municipalityName: 'Venezia',
    provinceCode: 'VE',
    regionName: 'Veneto',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.4408,
    lon: 12.3155,
    aliases: ['venezia', 'venice']
  },
  {
    belfioreCode: 'L781',
    istatCode: '023091',
    municipalityName: 'Verona',
    provinceCode: 'VR',
    regionName: 'Veneto',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.4384,
    lon: 10.9916,
    aliases: ['verona']
  },
  {
    belfioreCode: 'G224',
    istatCode: '028060',
    municipalityName: 'Padova',
    provinceCode: 'PD',
    regionName: 'Veneto',
    zoneCategory: 'CAPOLUOGO',
    lat: 45.4064,
    lon: 11.8768,
    aliases: ['padova', 'padua']
  },
  {
    belfioreCode: 'A326',
    istatCode: '042002',
    municipalityName: 'Ancona',
    provinceCode: 'AN',
    regionName: 'Marche',
    zoneCategory: 'CAPOLUOGO',
    lat: 43.6158,
    lon: 13.5189,
    aliases: ['ancona']
  },
  {
    belfioreCode: 'G942',
    istatCode: '076063',
    municipalityName: 'Potenza',
    provinceCode: 'PZ',
    regionName: 'Basilicata',
    zoneCategory: 'CAPOLUOGO',
    lat: 40.6404,
    lon: 15.8056,
    aliases: ['potenza']
  }
];

// Mappe di ricerca in-memory statiche per O(1) performance
const BY_BELFIORE = new Map<string, MunicipalityCatalogItem>();
const BY_NAME = new Map<string, MunicipalityCatalogItem>();

for (const item of MUNICIPALITIES_CATALOG) {
  BY_BELFIORE.set(item.belfioreCode.toUpperCase(), item);
  BY_NAME.set(item.municipalityName.toLowerCase(), item);
  if (item.aliases) {
    for (const alias of item.aliases) {
      BY_NAME.set(alias.toLowerCase(), item);
    }
  }
}

/**
 * Calcola la distanza approssimata in KM tra due punti geografici
 */
function getApproxDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * 111.2;
  const dLon = (lon2 - lon1) * 111.2 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Risolve il contesto territoriale in modo isolato e puramente deterministico.
 * Non conserva stato e non applica mai il fallback su Roma per asset non romani.
 */
export function resolveTerritory(params: {
  belfioreCode?: string;
  municipalityName?: string;
  lat?: number;
  lon?: number;
}): ResolvedTerritory {
  // 1. Risoluzione da Codice Catastale Belfiore (chiave primaria asseverata dalla visura)
  if (params.belfioreCode) {
    const cleanBelfiore = params.belfioreCode.trim().toUpperCase();
    const found = BY_BELFIORE.get(cleanBelfiore);
    if (found) {
      return {
        belfioreCode: found.belfioreCode,
        istatCode: found.istatCode,
        municipalityName: found.municipalityName,
        provinceCode: found.provinceCode,
        regionName: found.regionName,
        zoneCategory: found.zoneCategory,
        isUncensored: false,
        lat: found.lat,
        lon: found.lon
      };
    }
  }

  // 2. Risoluzione da Nome Comune (con pulizia e normalizzazione)
  if (params.municipalityName) {
    const raw = params.municipalityName.trim().toLowerCase();
    
    // Check esatto
    let found = BY_NAME.get(raw);
    
    // Check parziale se non trovato
    if (!found) {
      for (const item of MUNICIPALITIES_CATALOG) {
        const itemLower = item.municipalityName.toLowerCase();
        if (raw.includes(itemLower) || itemLower.includes(raw)) {
          found = item;
          break;
        }
      }
    }

    if (found) {
      return {
        belfioreCode: found.belfioreCode,
        istatCode: found.istatCode,
        municipalityName: found.municipalityName,
        provinceCode: found.provinceCode,
        regionName: found.regionName,
        zoneCategory: found.zoneCategory,
        isUncensored: false,
        lat: found.lat,
        lon: found.lon
      };
    }
  }

  // 3. Risoluzione da Coordinate Geografiche (prossimità al centro urbano < 25 km)
  if (params.lat !== undefined && params.lon !== undefined && params.lat > 0 && params.lon > 0) {
    let nearest: MunicipalityCatalogItem | null = null;
    let minDistance = Infinity;

    for (const item of MUNICIPALITIES_CATALOG) {
      const dist = getApproxDistanceKm(params.lat, params.lon, item.lat, item.lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = item;
      }
    }

    if (nearest && minDistance <= 25) {
      return {
        belfioreCode: nearest.belfioreCode,
        istatCode: nearest.istatCode,
        municipalityName: nearest.municipalityName,
        provinceCode: nearest.provinceCode,
        regionName: nearest.regionName,
        zoneCategory: nearest.zoneCategory,
        isUncensored: false,
        lat: nearest.lat,
        lon: nearest.lon
      };
    }
  }

  // 4. Graceful Degradation (§28 Product Thesis):
  // Comune ignoto o non censito. Assegna un profilo generico esplicito e MAI valori metropolitani di Roma.
  const fallbackName = params.municipalityName ? params.municipalityName.trim() : 'COMUNE_NON_CENSITO';
  return {
    belfioreCode: 'Z000',
    istatCode: '000000',
    municipalityName: fallbackName,
    provinceCode: 'ND',
    zoneCategory: 'INTERMEDIO',
    regionName: 'Italia',
    isUncensored: true
  };
}
