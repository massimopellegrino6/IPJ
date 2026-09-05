export const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- PROPTECH DECISION INTELLIGENCE PLATFORM - SUPABASE POSTGRESQL SCHEMA
-- Moduli: Property_Data, Market_Data, Decision_Log (Proprietary Loop)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS DI DOMINIO
-- ----------------------------------------------------------------------------
CREATE TYPE energy_class_enum AS ENUM ('A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G');
CREATE TYPE property_typology_enum AS ENUM ('APARTMENT', 'PENTHOUSE', 'VILLA', 'STUDIO', 'LOFT', 'TOWNHOUSE');
CREATE TYPE conservation_state_enum AS ENUM ('EXCELLENT', 'GOOD', 'HABITABLE', 'NEEDS_RENOVATION', 'UNDER_CONSTRUCTION');
CREATE TYPE recommended_action_enum AS ENUM ('ACQUIRE_PRIORITY', 'ACQUIRE_STANDARD', 'RENEGOTIATE_PRICE', 'REJECT_UNFAVORABLE');
CREATE TYPE agent_decision_enum AS ENUM ('PENDING', 'ACCEPTED', 'OVERRIDDEN', 'REJECTED');
CREATE TYPE rejection_category_enum AS ENUM (
    'PRICE_UNREALISTIC',            -- Aspettative del venditore irragionevoli
    'POOR_PHYSICAL_CONDITION',      -- Vizi strutturali o ristrutturazione sottostimata
    'UNRESOLVED_LEGAL_ISSUES',      -- Difformità catastali o gravami ipotecari
    'MICRO_ZONE_DEGRADATION',       -- Fattori ambientali/rumore non visibili dai dati macro
    'SELLER_INFLEXIBLE',            -- Proprietario non collaborativo / rifiuto mandato
    'CONDO_EXPENSES_EXCESSIVE',     -- Spese straordinarie deliberate elevate
    'OTHER'
);

-- ----------------------------------------------------------------------------
-- 2. TABELLA: PROPERTY_DATA
-- Caratteristiche fisiche, dimensionali e contrattuali dell'immobile
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.property_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_code VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(10) NOT NULL DEFAULT 'MI',
    postal_code VARCHAR(16) NOT NULL,
    micro_zone VARCHAR(100) NOT NULL,         -- Es. "Isola - Garibaldi", "Crocetta"
    macro_zone VARCHAR(100) NOT NULL,
    
    typology property_typology_enum NOT NULL DEFAULT 'APARTMENT',
    square_meters NUMERIC(7, 2) NOT NULL CHECK (square_meters > 0),
    rooms SMALLINT NOT NULL CHECK (rooms > 0),
    bathrooms SMALLINT NOT NULL DEFAULT 1 CHECK (bathrooms > 0),
    floor SMALLINT NOT NULL DEFAULT 1,
    total_floors SMALLINT NOT NULL DEFAULT 5,
    has_elevator BOOLEAN NOT NULL DEFAULT FALSE,
    has_balcony_or_terrace BOOLEAN NOT NULL DEFAULT FALSE,
    has_parking_space BOOLEAN NOT NULL DEFAULT FALSE,
    has_cellar BOOLEAN NOT NULL DEFAULT FALSE,
    
    construction_year SMALLINT CHECK (construction_year BETWEEN 1700 AND 2100),
    last_renovated_year SMALLINT CHECK (last_renovated_year BETWEEN 1900 AND 2100),
    energy_class energy_class_enum,
    conservation_state conservation_state_enum NOT NULL DEFAULT 'HABITABLE',
    
    asking_price NUMERIC(12, 2) NOT NULL CHECK (asking_price > 0),
    estimated_renovation_cost NUMERIC(12, 2) DEFAULT 0 CHECK (estimated_renovation_cost >= 0),
    seller_urgency VARCHAR(16) DEFAULT 'MEDIUM' CHECK (seller_urgency IN ('LOW', 'MEDIUM', 'HIGH')),
    
    -- Attributi flessibili non strutturati (esposizione, riscaldamento, spese cond.)
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_property_data_location ON public.property_data(city, micro_zone);
CREATE INDEX idx_property_data_asking_price ON public.property_data(asking_price);
CREATE INDEX idx_property_data_features_gin ON public.property_data USING GIN (features);

-- ----------------------------------------------------------------------------
-- 3. TABELLA: MARKET_DATA
-- Indicatori di mercato. I campi ammettono NULL per permettere la Graceful Degradation.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.property_data(id) ON DELETE CASCADE,
    micro_zone VARCHAR(100) NOT NULL,
    macro_zone VARCHAR(100) NOT NULL,
    reference_period VARCHAR(32) NOT NULL DEFAULT 'CURRENT', -- es. '2026-Q1'
    
    avg_price_sqm NUMERIC(10, 2) CHECK (avg_price_sqm > 0),
    median_price_sqm NUMERIC(10, 2) CHECK (median_price_sqm > 0),
    median_days_on_market NUMERIC(6, 1) CHECK (median_days_on_market >= 0),
    demand_intensity_index NUMERIC(5, 2) CHECK (demand_intensity_index BETWEEN 0 AND 100),
    active_supply_count INT CHECK (active_supply_count >= 0),
    monthly_absorption_rate NUMERIC(5, 2) CHECK (monthly_absorption_rate BETWEEN 0 AND 100), -- %
    comparables_count INT DEFAULT 0 CHECK (comparables_count >= 0),
    price_trend_yoy_pct NUMERIC(5, 2),
    
    raw_comparables JSONB DEFAULT '[]'::jsonb,
    data_freshness_days INT DEFAULT 7 CHECK (data_freshness_days >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE UNIQUE INDEX idx_market_data_zone_period ON public.market_data(micro_zone, reference_period);
CREATE INDEX idx_market_data_property ON public.market_data(property_id);
CREATE INDEX idx_market_data_comparables_gin ON public.market_data USING GIN (raw_comparables);

-- ----------------------------------------------------------------------------
-- 4. TABELLA: DECISION_LOG ("Data Capture by Design")
-- Registra l'output immutabile del motore + il feedback finale dell'agente.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.decision_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.property_data(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_name VARCHAR(128) NOT NULL DEFAULT 'Real Estate Advisor',
    model_version VARCHAR(32) NOT NULL DEFAULT 'v1.4.0-degradation-aware',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    -- Snapshot dell'output del motore
    system_rating NUMERIC(5, 2) NOT NULL CHECK (system_rating BETWEEN 0 AND 100),
    system_confidence NUMERIC(5, 2) NOT NULL CHECK (system_confidence BETWEEN 0 AND 100),
    system_recommended_action recommended_action_enum NOT NULL,
    system_suggested_price NUMERIC(12, 2) NOT NULL CHECK (system_suggested_price > 0),
    system_suggested_min_price NUMERIC(12, 2) CHECK (system_suggested_min_price > 0),
    system_suggested_max_price NUMERIC(12, 2) CHECK (system_suggested_max_price > 0),
    
    sub_score_intrinsic NUMERIC(5, 2),
    sub_score_market_momentum NUMERIC(5, 2),
    sub_score_price_competitiveness NUMERIC(5, 2),
    sub_score_liquidity NUMERIC(5, 2),
    
    -- Tracciamento della degradazione applicata
    system_degraded BOOLEAN NOT NULL DEFAULT FALSE,
    missing_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_buyer_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Feedback dell'agente (Human-in-the-Loop)
    agent_decision agent_decision_enum NOT NULL DEFAULT 'PENDING',
    agent_final_price NUMERIC(12, 2),
    agent_action_taken VARCHAR(64),
    rejection_category rejection_category_enum,
    agent_feedback_notes TEXT,
    
    -- Colonna generata automaticamente per analytics e benchmark scostamenti
    delta_price_pct NUMERIC(6, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN agent_final_price IS NOT NULL AND system_suggested_price > 0 
            THEN ROUND(((agent_final_price - system_suggested_price) / system_suggested_price * 100), 2)
            ELSE NULL 
        END
    ) STORED,
    
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_decision_log_property ON public.decision_log(property_id);
CREATE INDEX idx_decision_log_agent ON public.decision_log(agent_id);
CREATE INDEX idx_decision_log_decision ON public.decision_log(agent_decision);
CREATE INDEX idx_decision_log_rejection_cat ON public.decision_log(rejection_category) WHERE rejection_category IS NOT NULL;
CREATE INDEX idx_decision_log_eval_date ON public.decision_log(evaluated_at DESC);

-- Trigger aggiornamento timestamp automatico
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_property_data_updated_at BEFORE UPDATE ON public.property_data FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_market_data_updated_at BEFORE UPDATE ON public.market_data FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Supabase Row Level Security (RLS)
ALTER TABLE public.property_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view property data" ON public.property_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can view market data" ON public.market_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can view decision logs" ON public.decision_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can manage decision logs" ON public.decision_log FOR ALL TO authenticated USING (auth.uid() = agent_id OR agent_id IS NULL);
`;

export const NODE_EDGE_FUNCTION_CODE = `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Penalità deterministiche per il calcolo della Confidence (Base = 100)
const CONFIDENCE_PENALTIES = {
  MISSING_COMPARABLES: 25,       // Nessun comparabile transato recente (< 6 mesi)
  INSUFFICIENT_COMPARABLES: 15,  // Meno di 3 comparabili validi nella microzona
  MISSING_DEMAND_INDEX: 20,      // Indice di intensità della domanda mancante
  MISSING_ABSORPTION_RATE: 15,   // Tasso di assorbimento mensile ignoto
  MISSING_DAYS_ON_MARKET: 10,    // Giorni medi di giacenza (DOM) non disponibili
  OUTDATED_MARKET_DATA: 10,      // Dati di mercato più vecchi di 90 giorni
  INCOMPLETE_ENERGY_CLASS: 10,   // Classe APE non comunicata
  MISSING_RENOVATION_COST: 8,    // Mancanza stima capex per immobile da ristrutturare
};

// Pesi dei 4 pilastri del Rating
const PILLAR_WEIGHTS = {
  INTRINSIC: 0.35,              // Qualità fisica, piano, ascensore, APE, stato
  MARKET_MOMENTUM: 0.25,        // Pressione domanda, trend dei prezzi
  PRICE_COMPETITIVENESS: 0.25,  // Confronto asking price vs benchmark reale
  LIQUIDITY: 0.15,              // Tasso di assorbimento e giorni medi sul mercato
};

serve(async (req) => {
  try {
    const { property_id } = await req.json();

    if (!property_id) {
      return new Response(JSON.stringify({ error: "property_id obbligatorio" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Query Property
    const { data: property, error: propErr } = await supabaseClient
      .from("property_data")
      .select("*")
      .eq("id", property_id)
      .single();

    if (propErr || !property) {
      return new Response(JSON.stringify({ error: "Property not found" }), { status: 404 });
    }

    // 2. Query Market Data per la microzona
    const { data: market } = await supabaseClient
      .from("market_data")
      .select("*")
      .eq("micro_zone", property.micro_zone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 3. Graceful Degradation & Confidence Score
    let confidence = 100;
    const degradationAudit = [];

    if (!property.energy_class) {
      confidence -= CONFIDENCE_PENALTIES.INCOMPLETE_ENERGY_CLASS;
      degradationAudit.push({
        signal: "energy_class",
        penalty: CONFIDENCE_PENALTIES.INCOMPLETE_ENERGY_CLASS,
        fallback: "Assunta classe energetica media convenzionale (Classe E)."
      });
    }

    if (!market) {
      confidence -= 50;
      degradationAudit.push({
        signal: "market_data",
        penalty: 50,
        fallback: "Fallback su quotazione media macrozona con forchetta allargata del 15%."
      });
    } else {
      if (!market.comparables_count || market.comparables_count === 0) {
        confidence -= CONFIDENCE_PENALTIES.MISSING_COMPARABLES;
        degradationAudit.push({
          signal: "comparables_count",
          penalty: CONFIDENCE_PENALTIES.MISSING_COMPARABLES,
          fallback: "Utilizzo di quotazioni d offerta storiche in assenza di transato reale."
        });
      }

      if (market.demand_intensity_index === null || market.demand_intensity_index === undefined) {
        confidence -= CONFIDENCE_PENALTIES.MISSING_DEMAND_INDEX;
        degradationAudit.push({
          signal: "demand_intensity_index",
          penalty: CONFIDENCE_PENALTIES.MISSING_DEMAND_INDEX,
          fallback: "Assunto indice di pressione della domanda neutrale (50/100)."
        });
      }
    }

    const finalConfidence = Math.max(15, Math.min(100, Math.round(confidence)));

    // 4. Rating Calculation
    let intrinsic = 50;
    if (property.conservation_state === "EXCELLENT") intrinsic += 25;
    if (property.conservation_state === "NEEDS_RENOVATION") intrinsic -= 15;
    if (property.floor >= 3 && !property.has_elevator) intrinsic -= 20;
    intrinsic = Math.max(10, Math.min(100, intrinsic));

    const momentum = Math.max(10, Math.min(100, market?.demand_intensity_index ?? 50));
    
    const askingSqm = property.asking_price / Math.max(1, property.square_meters);
    const benchmarkSqm = market?.avg_price_sqm || 3000;
    const ratio = askingSqm / benchmarkSqm;
    let priceScore = ratio <= 0.85 ? 95 : ratio <= 1.0 ? 75 : ratio <= 1.15 ? 45 : 20;

    const liquidity = market?.median_days_on_market ? (market.median_days_on_market < 60 ? 90 : 60) : 50;

    const overallRating = Math.round(
      intrinsic * PILLAR_WEIGHTS.INTRINSIC +
      momentum * PILLAR_WEIGHTS.MARKET_MOMENTUM +
      priceScore * PILLAR_WEIGHTS.PRICE_COMPETITIVENESS +
      liquidity * PILLAR_WEIGHTS.LIQUIDITY
    );

    const fairValue = benchmarkSqm * property.square_meters * (0.80 + (intrinsic / 100) * 0.40);
    const spreadPct = finalConfidence < 60 ? 0.08 : 0.04;
    const suggestedTargetPrice = Math.round(fairValue / 1000) * 1000;

    const responsePayload = {
      property_id: property.id,
      overall_rating: overallRating,
      confidence_score: finalConfidence,
      is_degraded: degradationAudit.length > 0,
      degradation_penalties: degradationAudit,
      valuation: {
        asking_price: property.asking_price,
        suggested_target_price: suggestedTargetPrice,
        suggested_min_price: Math.round((fairValue * (1 - spreadPct)) / 1000) * 1000,
        suggested_max_price: Math.round((fairValue * (1 + spreadPct)) / 1000) * 1000,
      },
      recommended_action: overallRating >= 80 ? "ACQUIRE_PRIORITY" : overallRating >= 65 ? "ACQUIRE_STANDARD" : "RENEGOTIATE_PRICE"
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
`;
