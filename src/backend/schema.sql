-- ============================================================================
-- PROPTECH DECISION INTELLIGENCE PLATFORM - SUPABASE POSTGRESQL SCHEMA
-- Author: Senior Software Architect & Tech Lead (PropTech & Cloud Architecture)
-- Principles: 
--   1. "Graceful Degradation": Market indicators allow controlled NULLability 
--      while preserving structural integrity and enforcing CHECK boundaries.
--   2. "Data Capture by Design": decision_log persists complete immutable snapshots
--      of system outputs (scoring + degradation ledger) & agent override telemetry.
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. DOMAIN ENUMS & TYPES
-- ----------------------------------------------------------------------------

CREATE TYPE energy_class_enum AS ENUM (
    'A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'
);

CREATE TYPE property_typology_enum AS ENUM (
    'APARTMENT', 'PENTHOUSE', 'VILLA', 'STUDIO', 'LOFT', 'TOWNHOUSE'
);

CREATE TYPE conservation_state_enum AS ENUM (
    'EXCELLENT', 'GOOD', 'HABITABLE', 'NEEDS_RENOVATION', 'UNDER_CONSTRUCTION'
);

CREATE TYPE recommended_action_enum AS ENUM (
    'ACQUIRE_PRIORITY',     -- Rating >= 80, high liquidity or strong upside
    'ACQUIRE_STANDARD',     -- Rating 65-79, sound asset at fair pricing
    'RENEGOTIATE_PRICE',    -- Rating 50-64 or high asking price vs benchmark
    'REJECT_UNFAVORABLE'    -- Rating < 50, low liquidity or excessive capex
);

CREATE TYPE agent_decision_enum AS ENUM (
    'PENDING',              -- Evaluated, waiting for agent review
    'ACCEPTED',             -- Agent accepted platform recommendation
    'OVERRIDDEN',           -- Agent agreed to proceed but adjusted price/terms
    'REJECTED'              -- Agent discarded acquisition
);

CREATE TYPE rejection_category_enum AS ENUM (
    'PRICE_UNREALISTIC',            -- Venditore irragionevole sul prezzo
    'POOR_PHYSICAL_CONDITION',      -- Vizi strutturali o ristrutturazione sottostimata
    'UNRESOLVED_LEGAL_ISSUES',      -- Gravami ipotecari o difformità catastali
    'MICRO_ZONE_DEGRADATION',       -- Feedback qualitativo su via/vicinato non rilevato dai dati
    'SELLER_INFLEXIBLE',            -- Mancanza di mandato o tempistiche incompatibili
    'CONDO_EXPENSES_EXCESSIVE',     -- Spese condominiali straordinarie deliberate
    'OTHER'
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: PROPERTY_DATA
-- Core physical, cadastral, and commercial attributes of the property.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.property_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_code VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(10) NOT NULL DEFAULT 'MI',
    postal_code VARCHAR(16) NOT NULL,
    micro_zone VARCHAR(100) NOT NULL,         -- e.g. "Isola - Garibaldi", "Crocetta"
    macro_zone VARCHAR(100) NOT NULL,         -- e.g. "Milano Centro-Nord", "Torino Sud"
    
    -- Dimensional & Architectural features
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
    
    -- Quality & Sustainability
    construction_year SMALLINT CHECK (construction_year BETWEEN 1700 AND 2100),
    last_renovated_year SMALLINT CHECK (last_renovated_year BETWEEN 1900 AND 2100),
    energy_class energy_class_enum,
    conservation_state conservation_state_enum NOT NULL DEFAULT 'HABITABLE',
    
    -- Financials & Mandate
    asking_price NUMERIC(12, 2) NOT NULL CHECK (asking_price > 0),
    estimated_renovation_cost NUMERIC(12, 2) DEFAULT 0 CHECK (estimated_renovation_cost >= 0),
    seller_urgency VARCHAR(16) DEFAULT 'MEDIUM' CHECK (seller_urgency IN ('LOW', 'MEDIUM', 'HIGH')),
    
    -- Flexible Unstructured Attributes (Heating, Exposures, Condo Fees, Smart Features)
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Indexes for fast querying
CREATE INDEX idx_property_data_location ON public.property_data(city, micro_zone);
CREATE INDEX idx_property_data_asking_price ON public.property_data(asking_price);
CREATE INDEX idx_property_data_features_gin ON public.property_data USING GIN (features);

-- ----------------------------------------------------------------------------
-- 3. TABLE: MARKET_DATA
-- Dynamic market indicators (demand, supply, absorption, comps) associated with micro_zone.
-- Designed for Graceful Degradation: fields like comparables_count or demand_intensity_index
-- are nullable; missing records trigger fallback scoring and confidence discounts.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.property_data(id) ON DELETE CASCADE,
    micro_zone VARCHAR(100) NOT NULL,
    macro_zone VARCHAR(100) NOT NULL,
    reference_period VARCHAR(32) NOT NULL DEFAULT 'CURRENT', -- e.g. '2026-Q1'
    
    -- Pricing Benchmarks
    avg_price_sqm NUMERIC(10, 2) CHECK (avg_price_sqm > 0),
    median_price_sqm NUMERIC(10, 2) CHECK (median_price_sqm > 0),
    
    -- Liquidity & Momentum Metrics
    median_days_on_market NUMERIC(6, 1) CHECK (median_days_on_market >= 0),
    demand_intensity_index NUMERIC(5, 2) CHECK (demand_intensity_index BETWEEN 0 AND 100),
    active_supply_count INT CHECK (active_supply_count >= 0),
    monthly_absorption_rate NUMERIC(5, 2) CHECK (monthly_absorption_rate BETWEEN 0 AND 100), -- in %
    comparables_count INT DEFAULT 0 CHECK (comparables_count >= 0),
    price_trend_yoy_pct NUMERIC(5, 2), -- e.g. +3.5 or -1.2 %
    
    -- Comparable Transactions & Freshness
    raw_comparables JSONB DEFAULT '[]'::jsonb,
    data_freshness_days INT DEFAULT 7 CHECK (data_freshness_days >= 0),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Unique index to prevent duplicate market snapshots per zone & period
CREATE UNIQUE INDEX idx_market_data_zone_period ON public.market_data(micro_zone, reference_period);
CREATE INDEX idx_market_data_property ON public.market_data(property_id);
CREATE INDEX idx_market_data_comparables_gin ON public.market_data USING GIN (raw_comparables);

-- ----------------------------------------------------------------------------
-- 4. TABLE: DECISION_LOG ("Data Capture by Design")
-- Crucial audit ledger capturing the complete proprietary feedback loop:
--   1. Model recommendation snapshot (rating, confidence, degraded flag, missing signals)
--   2. Agent actual decision (accepted, overridden price, rejected)
--   3. Structured rejection reason & qualitative domain notes for ML retraining.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.decision_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.property_data(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_name VARCHAR(128) NOT NULL DEFAULT 'Senior Real Estate Advisor',
    model_version VARCHAR(32) NOT NULL DEFAULT 'prototype-v0.1',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    
    -- System Output Snapshot (Deterministic capture)
    system_rating NUMERIC(5, 2) NOT NULL CHECK (system_rating BETWEEN 0 AND 100),
    system_confidence NUMERIC(5, 2) NOT NULL CHECK (system_confidence BETWEEN 0 AND 100),
    system_recommended_action recommended_action_enum NOT NULL,
    system_suggested_price NUMERIC(12, 2) NOT NULL CHECK (system_suggested_price > 0),
    system_suggested_min_price NUMERIC(12, 2) CHECK (system_suggested_min_price > 0),
    system_suggested_max_price NUMERIC(12, 2) CHECK (system_suggested_max_price > 0),
    
    -- Sub-pillar score snapshots
    sub_score_intrinsic NUMERIC(5, 2),
    sub_score_market_momentum NUMERIC(5, 2),
    sub_score_price_competitiveness NUMERIC(5, 2),
    sub_score_liquidity NUMERIC(5, 2),
    
    -- Graceful Degradation Audit Trail
    system_degraded BOOLEAN NOT NULL DEFAULT FALSE,
    missing_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_buyer_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Agent Loop & Human-in-the-Loop Feedback
    agent_decision agent_decision_enum NOT NULL DEFAULT 'PENDING',
    agent_final_price NUMERIC(12, 2),
    agent_action_taken VARCHAR(64),
    rejection_category rejection_category_enum,
    agent_feedback_notes TEXT,
    
    -- Generated / Computed Metrics for Analytics
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

-- Analytical Indexes
CREATE INDEX idx_decision_log_property ON public.decision_log(property_id);
CREATE INDEX idx_decision_log_agent ON public.decision_log(agent_id);
CREATE INDEX idx_decision_log_decision ON public.decision_log(agent_decision);
CREATE INDEX idx_decision_log_rejection_cat ON public.decision_log(rejection_category) WHERE rejection_category IS NOT NULL;
CREATE INDEX idx_decision_log_signals_gin ON public.decision_log USING GIN (missing_signals);
CREATE INDEX idx_decision_log_eval_date ON public.decision_log(evaluated_at DESC);

-- ----------------------------------------------------------------------------
-- 5. TRIGGERS: AUTOMATIC updated_at HANDLING
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_property_data_updated_at
    BEFORE UPDATE ON public.property_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_market_data_updated_at
    BEFORE UPDATE ON public.market_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES (Supabase Best Practice)
-- ----------------------------------------------------------------------------

ALTER TABLE public.property_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_log ENABLE ROW LEVEL SECURITY;

-- Agents can read all properties and market data
CREATE POLICY "Agents can view property data" 
    ON public.property_data FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Agents can insert property data" 
    ON public.property_data FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Agents can view market data" 
    ON public.market_data FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Agents can view decision logs" 
    ON public.decision_log FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Agents can insert and update their decision logs" 
    ON public.decision_log FOR ALL 
    TO authenticated 
    USING (auth.uid() = agent_id OR agent_id IS NULL)
    WITH CHECK (auth.uid() = agent_id OR agent_id IS NULL);
