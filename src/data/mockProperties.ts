import { PropertyData, MarketData } from '../types/proptech';

export interface PropertyMarketPair {
  property: PropertyData;
  market: MarketData | null;
  scenarioName: string;
  dataCompleteness: 'FULL' | 'PARTIAL' | 'SPARSE';
  scenarioDescription: string;
}

export const PRESET_SCENARIOS: PropertyMarketPair[] = [
  {
    scenarioName: 'Milano Isola - Trilocale Ristrutturato (Dati Completi)',
    dataCompleteness: 'FULL',
    scenarioDescription: 'Microzona liquida con oltre 12 comparabili recenti, forte pressione della domanda (+4.5% YoY), tutti i dati energetici presenti.',
    property: {
      id: 'prop_mi_isola_01',
      external_code: 'MI-ISO-2026-88',
      title: 'Trilocale con Terrazzino e Ascensore - Via Borsieri',
      address: 'Via Borsieri 24',
      city: 'Milano',
      province: 'MI',
      micro_zone: 'Isola - Garibaldi',
      macro_zone: 'Milano Centro-Nord',
      postal_code: '20159',
      typology: 'APARTMENT',
      square_meters: 85,
      rooms: 3,
      bathrooms: 2,
      floor: 3,
      total_floors: 5,
      has_elevator: true,
      has_balcony_or_terrace: true,
      has_parking_space: false,
      has_cellar: true,
      construction_year: 1968,
      last_renovated_year: 2023,
      energy_class: 'B',
      conservation_state: 'EXCELLENT',
      asking_price: 520000, // ~6.117 €/mq
      estimated_renovation_cost: 0,
      seller_urgency: 'MEDIUM',
      features: {
        heating_type: 'Centralizzato a gestione autonoma',
        exposure: ['Sud', 'Est'],
        monthly_condo_fees: 180,
        concierge: true,
        air_conditioning: true,
        notes: 'Affaccio silenzioso su corte interna.'
      }
    },
    market: {
      id: 'mkt_mi_isola_01',
      property_id: 'prop_mi_isola_01',
      micro_zone: 'Isola - Garibaldi',
      macro_zone: 'Milano Centro-Nord',
      reference_period: '2026-Q1',
      avg_price_sqm: 6450,
      median_price_sqm: 6300,
      median_days_on_market: 42,
      demand_intensity_index: 88, // 0 - 100
      active_supply_count: 24,
      monthly_absorption_rate: 26.5, // %
      comparables_count: 14,
      price_trend_yoy_pct: 4.8,
      data_freshness_days: 12,
      raw_comparables: [
        { id: 'comp_1', distance_meters: 150, price_sqm: 6500, similarity_score: 94 },
        { id: 'comp_2', distance_meters: 280, price_sqm: 6350, similarity_score: 91 },
        { id: 'comp_3', distance_meters: 420, price_sqm: 6200, similarity_score: 87 }
      ]
    }
  },
  {
    scenarioName: 'Torino Periferia - Bilocale (Dati Mercato Parziali)',
    dataCompleteness: 'PARTIAL',
    scenarioDescription: 'Assenza del tasso di assorbimento e pochi comparabili (2 immobili). Entra in gioco la Graceful Degradation con calo del Confidence Score.',
    property: {
      id: 'prop_to_mira_02',
      external_code: 'TO-MIR-2026-14',
      title: 'Bilocale Luminoso 55mq - Corso Unione Sovietica',
      address: 'Corso Unione Sovietica 310',
      city: 'Torino',
      province: 'TO',
      micro_zone: 'Mirafiori Nord',
      macro_zone: 'Torino Sud',
      postal_code: '10135',
      typology: 'APARTMENT',
      square_meters: 55,
      rooms: 2,
      bathrooms: 1,
      floor: 2,
      total_floors: 6,
      has_elevator: true,
      has_balcony_or_terrace: true,
      has_parking_space: false,
      has_cellar: true,
      construction_year: 1974,
      last_renovated_year: 2012,
      energy_class: 'E',
      conservation_state: 'HABITABLE',
      asking_price: 88000, // ~1.600 €/mq
      estimated_renovation_cost: 12000,
      seller_urgency: 'HIGH',
      features: {
        heating_type: 'Teleriscaldamento con termovalvole',
        exposure: ['Ovest'],
        monthly_condo_fees: 95,
        concierge: false,
        air_conditioning: false,
        notes: 'Venditore motivato per trasferimento lavorativo.'
      }
    },
    market: {
      id: 'mkt_to_mira_02',
      property_id: 'prop_to_mira_02',
      micro_zone: 'Mirafiori Nord',
      macro_zone: 'Torino Sud',
      reference_period: '2026-Q1',
      avg_price_sqm: 1450,
      median_price_sqm: 1400,
      median_days_on_market: 115,
      demand_intensity_index: 48,
      active_supply_count: 65,
      monthly_absorption_rate: null, // MISSING: Degradation trigger!
      comparables_count: 2,          // SPARSE (< 3): Degradation trigger!
      price_trend_yoy_pct: -0.8,
      data_freshness_days: 45
    }
  },
  {
    scenarioName: 'Brianza - Villa d Epoca da Ristrutturare (Dati Mercato Assenti)',
    dataCompleteness: 'SPARSE',
    scenarioDescription: 'Asset atipico extraurbano. Zero comparabili recenti, indice domanda e assorbimento non disponibili. Il motore applica il fallback euristico conservativo.',
    property: {
      id: 'prop_mb_villa_03',
      external_code: 'MB-BES-2026-03',
      title: 'Villa Storica con Parco Privato 380mq',
      address: 'Via Monte Bianco 12',
      city: 'Besana in Brianza',
      province: 'MB',
      micro_zone: 'Besana Centro Collinare',
      macro_zone: 'Monza e Brianza Nord',
      postal_code: '20842',
      typology: 'VILLA',
      square_meters: 380,
      rooms: 8,
      bathrooms: 4,
      floor: 1,
      total_floors: 2,
      has_elevator: false,
      has_balcony_or_terrace: true,
      has_parking_space: true,
      has_cellar: true,
      construction_year: 1928,
      last_renovated_year: null,
      energy_class: null, // MISSING APE
      conservation_state: 'NEEDS_RENOVATION',
      asking_price: 490000,
      estimated_renovation_cost: null, // MISSING CAPEX
      seller_urgency: 'LOW',
      features: {
        heating_type: 'Caldaia autonoma da sostituire',
        exposure: ['Nord', 'Sud', 'Est', 'Ovest'],
        monthly_condo_fees: 0,
        concierge: false,
        air_conditioning: false,
        notes: 'Parco piantumato di 2.000 mq, vincolo storico parziale.'
      }
    },
    market: null // TOTAL ABSENCE OF MARKET DATA: Full Graceful Degradation
  },
  {
    scenarioName: 'Roma Prati - Ufficio/Abitazione Signorile (Prezzo Fuori Target)',
    dataCompleteness: 'FULL',
    scenarioDescription: 'Mercato solido ma proprietario ha fissato un prezzo di richiesta superiore del +28% al fair value di zona. Il sistema raccomanda rinegoziazione.',
    property: {
      id: 'prop_rm_prati_04',
      external_code: 'RM-PRA-2026-92',
      title: 'Appartamento d Epoca 135mq con Soffitti a Volta',
      address: 'Via Cola di Rienzo 180',
      city: 'Roma',
      province: 'RM',
      micro_zone: 'Prati - Delle Vittorie',
      macro_zone: 'Roma Centro-Ovest',
      postal_code: '00192',
      typology: 'APARTMENT',
      square_meters: 135,
      rooms: 5,
      bathrooms: 2,
      floor: 4,
      total_floors: 5,
      has_elevator: true,
      has_balcony_or_terrace: true,
      has_parking_space: false,
      has_cellar: true,
      construction_year: 1935,
      last_renovated_year: 2005,
      energy_class: 'D',
      conservation_state: 'GOOD',
      asking_price: 890000, // ~6.592 €/mq (mercato ~5.200 €/mq)
      estimated_renovation_cost: 35000,
      seller_urgency: 'LOW',
      features: {
        heating_type: 'Centralizzato con contabilizzatori',
        exposure: ['Sud', 'Ovest'],
        monthly_condo_fees: 220,
        concierge: true,
        air_conditioning: true,
        notes: 'Stabile d epoca prestigioso con portineria intera giornata.'
      }
    },
    market: {
      id: 'mkt_rm_prati_04',
      property_id: 'prop_rm_prati_04',
      micro_zone: 'Prati - Delle Vittorie',
      macro_zone: 'Roma Centro-Ovest',
      reference_period: '2026-Q1',
      avg_price_sqm: 5250,
      median_price_sqm: 5100,
      median_days_on_market: 75,
      demand_intensity_index: 76,
      active_supply_count: 48,
      monthly_absorption_rate: 19.2,
      comparables_count: 9,
      price_trend_yoy_pct: 1.5,
      data_freshness_days: 18
    }
  }
];
