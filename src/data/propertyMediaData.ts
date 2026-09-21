import { PropertyItem, PropertyImage } from '../types/intelligence';

export interface NearbyPoi {
  id: string;
  name: string;
  category: 'transit' | 'education' | 'green' | 'retail' | 'health';
  distanceMeters: number;
  walkingMinutes: number;
  lineOrDetail?: string;
}

// Curated high-resolution architectural & real estate photos (Unsplash verified direct images)
const PHOTO_SETS = {
  Apartment_Rome: [
    {
      id: 'img_rm_1',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Zona living spaziosa con parquet in rovere e ampie finestre',
      tag: 'Living' as const,
      isHero: true
    },
    {
      id: 'img_rm_2',
      url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
      caption: 'Cucina a vista con isola centrale in marmo e piano a induzione',
      tag: 'Cucina' as const
    },
    {
      id: 'img_rm_3',
      url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
      caption: 'Camera da letto padronale con cabina armadio integrata',
      tag: 'Camera' as const
    },
    {
      id: 'img_rm_4',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      caption: 'Bagno en-suite in gres porcellanato effetto resina con doccia walk-in',
      tag: 'Bagno' as const
    },
    {
      id: 'img_rm_5',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Balcone vivibile con affaccio silenzioso sulla corte interna d\'epoca',
      tag: 'Vista' as const
    },
    {
      id: 'img_rm_6',
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      caption: 'Facciata esterna del palazzo nobiliare dei primi del \'900 ristrutturata',
      tag: 'Esterno' as const
    }
  ],
  Penthouse: [
    {
      id: 'img_pnt_1',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      caption: 'Terrazzo panoramico a livello di oltre 45 mq con vista aperta sulla città',
      tag: 'Vista' as const,
      isHero: true
    },
    {
      id: 'img_pnt_2',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Salone triplo di alta rappresentanza con camino e vetrate continue',
      tag: 'Living' as const
    },
    {
      id: 'img_pnt_3',
      url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      caption: 'Cucina abitabile con penisola di design ed elettrodomestici d\'alta gamma',
      tag: 'Cucina' as const
    },
    {
      id: 'img_pnt_4',
      url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      caption: 'Master suite con accesso diretto alla terrazza solarium',
      tag: 'Camera' as const
    },
    {
      id: 'img_pnt_5',
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
      caption: 'Sala da bagno padronale con vasca freestanding panoramica',
      tag: 'Bagno' as const
    }
  ],
  Villa: [
    {
      id: 'img_vil_1',
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      caption: 'Villa unifamiliare indipendente con giardino privato curato a prato inglese',
      tag: 'Esterno' as const,
      isHero: true
    },
    {
      id: 'img_vil_2',
      url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      caption: 'Portico esterno attrezzato per cene e zona lounge estiva',
      tag: 'Vista' as const
    },
    {
      id: 'img_vil_3',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      caption: 'Zona living doppia al piano terra con finiture in pietra e legno',
      tag: 'Living' as const
    },
    {
      id: 'img_vil_4',
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      caption: 'Cucina conviviale con isola in quarzo e vista sul giardino',
      tag: 'Cucina' as const
    }
  ],
  Loft: [
    {
      id: 'img_lft_1',
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      caption: 'Spazio loft open-space con soffitti alti 4,5 metri e travi originali a vista',
      tag: 'Living' as const,
      isHero: true
    },
    {
      id: 'img_lft_2',
      url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80',
      caption: 'Soppalco d\'arredo con zona notte e studio dedicato',
      tag: 'Camera' as const
    },
    {
      id: 'img_lft_3',
      url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
      caption: 'Angolo cucina lineare minimalista in metallo satinato',
      tag: 'Cucina' as const
    }
  ],
  Studio_Townhouse: [
    {
      id: 'img_std_1',
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      caption: 'Monolocale/Bilocale moderno ottimizzato al millimetro con arredi su misura',
      tag: 'Living' as const,
      isHero: true
    },
    {
      id: 'img_std_2',
      url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      caption: 'Zona notte raccolta con illuminazione LED a scomparsa',
      tag: 'Camera' as const
    },
    {
      id: 'img_std_3',
      url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80',
      caption: 'Bagno moderno con termoarredo e sanitari sospesi',
      tag: 'Bagno' as const
    }
  ]
};

// Generates nearby realistic Points of Interest based on city and microzone
export function getNearbyPois(property: PropertyItem): NearbyPoi[] {
  const isRome = property.city === 'Roma';
  const isMilan = property.city === 'Milano';
  const isTurin = property.city === 'Torino';
  const isBologna = property.city === 'Bologna';

  if (isRome) {
    return [
      {
        id: 'poi_1',
        name: property.microZone.includes('Appio') ? 'Metro A — Fermata Re di Roma / Furio Camillo' : 'Metro A — Fermata Ottaviano / Lepanto',
        category: 'transit',
        distanceMeters: 220,
        walkingMinutes: 3,
        lineOrDetail: 'Linea A (Battistini - Anagnina)'
      },
      {
        id: 'poi_2',
        name: property.microZone.includes('Appio') ? 'Parco della Caffarella / Appia Antica' : 'Piazza Cavour & Giardini Castel Sant\'Angelo',
        category: 'green',
        distanceMeters: 450,
        walkingMinutes: 6,
        lineOrDetail: 'Area verde protetta con percorsi ciclopedonali'
      },
      {
        id: 'poi_3',
        name: 'Supermercato Conad City / Carrefour Express',
        category: 'retail',
        distanceMeters: 140,
        walkingMinutes: 2,
        lineOrDetail: 'Aperto 7 giorni su 7 fino alle 21:00'
      },
      {
        id: 'poi_4',
        name: 'Istituto Comprensivo Statale & Liceo Scientifico',
        category: 'education',
        distanceMeters: 380,
        walkingMinutes: 5,
        lineOrDetail: 'Primaria, Secondaria I grado e Liceo'
      },
      {
        id: 'poi_5',
        name: 'Farmacia H24 San Giovanni / Prati',
        category: 'health',
        distanceMeters: 160,
        walkingMinutes: 2,
        lineOrDetail: 'Presidio notturno continuativo'
      }
    ];
  }

  if (isMilan) {
    return [
      {
        id: 'poi_1',
        name: 'Metro M1 / M5 — Fermata Lotto o CityLife Tre Torri',
        category: 'transit',
        distanceMeters: 190,
        walkingMinutes: 3,
        lineOrDetail: 'Linee Rossa (M1) e Lilla (M5)'
      },
      {
        id: 'poi_2',
        name: 'CityLife Shopping District & Parco CityLife',
        category: 'green',
        distanceMeters: 320,
        walkingMinutes: 4,
        lineOrDetail: 'Parco contemporaneo di 170.000 mq'
      },
      {
        id: 'poi_3',
        name: 'Esselunga / Pam Local',
        category: 'retail',
        distanceMeters: 210,
        walkingMinutes: 3,
        lineOrDetail: 'Supermercato di quartiere'
      },
      {
        id: 'poi_4',
        name: 'Polo Universitario / Istituto Scolastico Paritario',
        category: 'education',
        distanceMeters: 480,
        walkingMinutes: 6,
        lineOrDetail: 'Plesso scolastico internazionale'
      },
      {
        id: 'poi_5',
        name: 'Ospedale San Giuseppe / Studio Polispecialistico',
        category: 'health',
        distanceMeters: 550,
        walkingMinutes: 7,
        lineOrDetail: 'Pronto soccorso e ambulatori'
      }
    ];
  }

  // Fallback for Turin, Bologna, Florence, etc.
  return [
    {
      id: 'poi_1',
      name: 'Stazione Ferroviaria Centrale / Linea Tram Veloce',
      category: 'transit',
      distanceMeters: 280,
      walkingMinutes: 4,
      lineOrDetail: 'Frequenza passaggi ogni 5 minuti'
    },
    {
      id: 'poi_2',
      name: 'Parco Civico Comunale & Pista Ciclabile',
      category: 'green',
      distanceMeters: 390,
      walkingMinutes: 5,
      lineOrDetail: 'Area verde attrezzata per famiglie e sport'
    },
    {
      id: 'poi_3',
      name: 'Mercato Rionale & Supermercato Coop',
      category: 'retail',
      distanceMeters: 180,
      walkingMinutes: 2,
      lineOrDetail: 'Generi alimentari freschi e biologici'
    },
    {
      id: 'poi_4',
      name: 'Scuola Primaria e Scuola dell\'Infanzia',
      category: 'education',
      distanceMeters: 310,
      walkingMinutes: 4,
      lineOrDetail: 'Edificio scolastico riqualificato con mensa'
    },
    {
      id: 'poi_5',
      name: 'Presidio Sanitario ASL & Farmacia Comunale',
      category: 'health',
      distanceMeters: 240,
      walkingMinutes: 3,
      lineOrDetail: 'Servizi medici di base'
    }
  ];
}

// Returns appropriate images for any property item
export function getPropertyImages(property: PropertyItem): PropertyImage[] {
  if (property.images && property.images.length > 0) {
    return property.images;
  }

  if (property.propertyType === 'Penthouse') {
    return PHOTO_SETS.Penthouse;
  }
  if (property.propertyType === 'Villa') {
    return PHOTO_SETS.Villa;
  }
  if (property.propertyType === 'Loft') {
    return PHOTO_SETS.Loft;
  }
  if (property.propertyType === 'Studio' || property.propertyType === 'Townhouse') {
    return PHOTO_SETS.Studio_Townhouse;
  }

  return PHOTO_SETS.Apartment_Rome;
}
