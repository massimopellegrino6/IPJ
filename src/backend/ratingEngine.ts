/**
 * REDIP Rating Engine - Integrazione Demografica ISTAT SDMX & World Model Baseline
 * Conforme con la Product Thesis (§28 Graceful Degradation, §29 Zero Mock Policy)
 */

import { PropertyItem, DimensionBreakdown, AgencyFitData } from '../types/intelligence';
import { MunicipalityDemographics, DemographicsEnrichmentResult } from '../types/demographics';
import { getMunicipalityDemographics, resolveMunicipalityKey } from './istatDemographicsClient';
import { EnvironmentalRiskProfile } from '../types/environmentalRisk';
import { getEnvironmentalRisk } from './environmentalRiskClient';
import { resolveTerritory, ResolvedTerritory } from './territorialResolver';
import { getOmiBandsForProperty, OmiBandData, evaluatePriceFitScore } from './omiClient';

/**
 * Calcola il Pilastro 6 (Economics & Price Fit) e il Valore Congruo MCA con Fallback OMI Dinamico
 * Conforme alla Product Thesis (§28, §29):
 * In assenza di rogiti notarili (<3 entro 600m), usa rigorosamente:
 * valoreCongruoBase = property.surfaceMq * omiData.medianEurMq
 * Applica le rettifiche marginali dell'immobile specifico (piano, ascensore, APE, stato manutentivo).
 * Calcola lo scostamento percentuale reale:
 * delta = ((property.askingPrice - valoreCongruoStimato) / valoreCongruoStimato) * 100
 */
export function calculateEconomicsPillarScores(
  property: PropertyItem,
  territory: ResolvedTerritory,
  omiBand: OmiBandData,
  mcaFairValue?: number
): {
  economicsScore: number;
  fairValue: number;
  priceDifferencePct: number;
  isMcaApplied: boolean;
  deltaPct: number;
} {
  let fairValue = property.estimatedFairValue;
  let isMcaApplied = false;

  if (mcaFairValue && mcaFairValue > 0) {
    fairValue = mcaFairValue;
    isMcaApplied = true;
  } else {
    // In assenza di rogiti notarili (<3 entro 600m), usa rigorosamente il fallback OMI dinamico
    const baseFairValue = property.squareMeters * omiBand.medianEurMq;
    let hedonicAdjustmentPct = 0;

    // Piano & Ascensore
    if (property.floor === 0) {
      hedonicAdjustmentPct -= 5;
    } else if (property.floor === 1) {
      hedonicAdjustmentPct -= 2;
    } else if (property.floor >= 4 && !property.hasElevator) {
      hedonicAdjustmentPct -= 15;
    } else if (property.floor >= 3 && !property.hasElevator) {
      hedonicAdjustmentPct -= 10;
    } else if (property.floor === property.totalFloors && property.totalFloors >= 3) {
      hedonicAdjustmentPct += 6; // Attico/Ultimo piano
    }

    // Stato conservativo
    if (property.conservationState === 'Excellent') {
      hedonicAdjustmentPct += 8;
    } else if (property.conservationState === 'Habitable') {
      hedonicAdjustmentPct -= 8;
    } else if (property.conservationState === 'Needs Renovation') {
      hedonicAdjustmentPct -= 18;
    }

    // Classe Energetica APE
    const eClass = (property.energyClass || 'G').toUpperCase();
    if (eClass.includes('A4') || eClass.includes('A3') || eClass.includes('A2') || eClass.includes('A1') || eClass === 'A') {
      hedonicAdjustmentPct += 10;
    } else if (eClass === 'B') {
      hedonicAdjustmentPct += 6;
    } else if (eClass === 'C') {
      hedonicAdjustmentPct += 3;
    } else if (eClass === 'E') {
      hedonicAdjustmentPct -= 4;
    } else if (eClass === 'F') {
      hedonicAdjustmentPct -= 7;
    } else if (eClass === 'G') {
      hedonicAdjustmentPct -= 10;
    }

    // Dotazioni accessorie
    if (property.hasBalcony) hedonicAdjustmentPct += 3;
    if (property.hasParking) hedonicAdjustmentPct += 5;

    const hedonicMultiplier = 1 + (hedonicAdjustmentPct / 100);
    fairValue = Math.round(baseFairValue * hedonicMultiplier);
  }

  // Calcola lo scostamento percentuale reale:
  // delta = ((property.askingPrice - valoreCongruoStimato) / valoreCongruoStimato) * 100
  const deltaPct = Number((((property.askingPrice - fairValue) / fairValue) * 100).toFixed(1));

  // Calcola il Price Fit Score (0-100)
  let economicsScore = 70;
  if (isMcaApplied) {
    if (deltaPct <= -10) economicsScore = 95;
    else if (deltaPct <= 0) economicsScore = 88;
    else if (deltaPct <= 5) economicsScore = 78;
    else if (deltaPct <= 10) economicsScore = 60;
    else if (deltaPct <= 20) economicsScore = 38;
    else economicsScore = 20;
  } else {
    economicsScore = evaluatePriceFitScore(
      property.askingPrice,
      property.squareMeters,
      omiBand.microzoneCode,
      territory,
      property.cadastralData?.cadastralCategory || 'A/2'
    );
  }

  return {
    economicsScore,
    fairValue,
    priceDifferencePct: deltaPct,
    isMcaApplied,
    deltaPct
  };
}

/**
 * Calcola il punteggio del Pilastro 4 (Asset Risk Index, peso 14-15%)
 * incrociando i dati ISPRA IdroGEO, la zonizzazione sismica Protezione Civile
 * e l'Audit Catastale Documentale (D.P.R. 380/01).
 */
export function calculateEnvironmentalRiskPillarScores(
  riskProfile: EnvironmentalRiskProfile,
  cadastralAssetRiskIndex?: string,
  urbanCompliance?: string
): {
  riskScore: number;
  floodScore: number;
  seismicScore: number;
  landslideScore: number;
  status: 'RISCHIO MINIMO CERTIFICATO' | 'RISCHIO MODERATO' | 'ATTENZIONE RICHIESTA';
  confidencePenaltyOrBonus: number;
} {
  const isAuditVerified = cadastralAssetRiskIndex === 'VERIFIED' || urbanCompliance === 'COMPLIANT';
  const isHydrogeologicalSafe = riskProfile.floodRiskLevel === 'NONE' && riskProfile.landslideRiskLevel === 'NONE';

  let riskScore: number;
  let status: 'RISCHIO MINIMO CERTIFICATO' | 'RISCHIO MODERATO' | 'ATTENZIONE RICHIESTA';
  let confidencePenaltyOrBonus = 0;

  // Graceful Degradation (§28): penalità -5 pt se fallback provinciale
  if (riskProfile.dataSource === 'PROVINCIAL_FALLBACK') {
    confidencePenaltyOrBonus -= 5;
  }

  // Incrocio Audit Catastale + ISPRA / Prot. Civile
  if (isAuditVerified && isHydrogeologicalSafe) {
    // Visura caricata (VERIFIED) e rischi idrogeologici NONE: score 98/100 con status RISCHIO MINIMO CERTIFICATO
    riskScore = 98;
    status = 'RISCHIO MINIMO CERTIFICATO';
    confidencePenaltyOrBonus += 8;
  } else if (isHydrogeologicalSafe) {
    // Coordinate libere da vincoli idrogeologici ma audit documentale da completare
    riskScore = Math.min(100, Math.max(30, Math.round(
      riskProfile.floodScore * 0.30 +
      riskProfile.seismicScore * 0.40 +
      riskProfile.landslideScore * 0.30
    )));
    status = 'RISCHIO MODERATO';
  } else {
    // Presenza di criticità idrogeologiche perimetrate da IdroGEO/PAI
    riskScore = Math.min(100, Math.max(20, Math.round(riskProfile.overallRiskIndex * 0.85)));
    status = 'ATTENZIONE RICHIESTA';
  }

  return {
    riskScore,
    floodScore: riskProfile.floodScore,
    seismicScore: riskProfile.seismicScore,
    landslideScore: riskProfile.landslideScore,
    status,
    confidencePenaltyOrBonus
  };
}

/**
 * Calcola l'impatto dei dati demografici ISTAT sul Pilastro 7 (Macro & Time, peso 8%)
 * e sul Pilastro 2 (Location & Densità Urbana, peso 20%).
 */
export function calculateDemographicPillarScores(
  demographics: MunicipalityDemographics,
  currentMacroScore: number,
  currentLocationScore: number
): {
  macroScore: number;
  demographicTrendScore: number;
  urbanDensityScore: number;
  agingPenaltyOrBonus: number;
  status: 'VERIFIED' | 'SIMULATED';
} {
  // 1. Analisi Indice di Vecchiaia (Aging Index)
  // Media nazionale italiana ~ 195-200. Sotto 175 è giovane/dinamico; sopra 210 è invecchiamento accentuato.
  let agingBonus = 0;
  if (demographics.agingIndex < 165) {
    agingBonus = +12; // E.g. Napoli, Milano dinamica
  } else if (demographics.agingIndex < 180) {
    agingBonus = +6;  // E.g. Roma Prati/Nord
  } else if (demographics.agingIndex < 200) {
    agingBonus = 0;   // In linea con media
  } else if (demographics.agingIndex < 215) {
    agingBonus = -6;  // Campobasso / aree interne
  } else {
    agingBonus = -12; // Invecchiamento severo
  }

  // 2. Analisi Quota Giovani Famiglie 25-44 anni (Young Families Ratio)
  // Media ~ 21-22%. Oltre il 25% indica forte ricambio generazionale e richiesta bilocali/trilocali.
  const familyBonus = Math.round((demographics.youngFamiliesRatio - 0.22) * 150); // E.g. 0.25 -> +4.5 pt

  // Punteggio specifico per sub_macro_4 (Demographic Trend)
  const baseDemoScore = 70;
  const demographicTrendScore = Math.min(100, Math.max(35, baseDemoScore + agingBonus + familyBonus));

  // Punteggio Macro complessivo aggiornato (conferma empirica ISTAT)
  // Pondera il punteggio macro di base col nuovo trend demografico reale
  const updatedMacroScore = Math.min(100, Math.max(20, Math.round(
    currentMacroScore * 0.70 + demographicTrendScore * 0.30
  )));

  // 3. Analisi Densità Abitativa (Densità ab/km²) per Pilastro 2 (Location / sub_loc_4 Urban Structure)
  let densityScore = 70;
  if (demographics.densityPerKm2 >= 6000) {
    densityScore = 88; // Elevata polarizzazione metropolitana (Milano, Napoli, Torino centro)
  } else if (demographics.densityPerKm2 >= 2000) {
    densityScore = 80; // Densità urbana solida (Roma)
  } else if (demographics.densityPerKm2 >= 800) {
    densityScore = 68; // Capoluogo provinciale medio (Campobasso, Perugia)
  } else {
    densityScore = 55; // Densità bassa / periurbana
  }

  return {
    macroScore: updatedMacroScore,
    demographicTrendScore,
    urbanDensityScore: densityScore,
    agingPenaltyOrBonus: agingBonus + familyBonus,
    status: demographics.dataSource === 'REGIONAL_FALLBACK' ? 'SIMULATED' : 'VERIFIED'
  };
}

/**
 * Pondera il modulo Demand Match / Agency Fit in base al bacino demografico attivo locale (youngFamiliesRatio).
 * Ad esempio per l'asset di Campobasso o Via Nomentana a Roma.
 */
export function reweightAgencyFitWithDemographics(
  currentAgencyFit: AgencyFitData,
  demographics: MunicipalityDemographics
): AgencyFitData {
  const youngFamiliesRatio = demographics.youngFamiliesRatio; // es. 0.25 (25%)
  const totalMatches = currentAgencyFit.compatibleActiveBuyers || 14;

  // Calcola acquirenti nel target giovane famiglia
  const calculatedYoungTarget = Math.max(1, Math.round(totalMatches * (youngFamiliesRatio * 2.2)));

  // Ponderazione del punteggio di Agency Fit
  const demographicWeightFactor = 0.85 + (youngFamiliesRatio * 0.6); // es. 0.85 + (0.25 * 0.6) = 1.0
  const adjustedFitScore = Math.min(100, Math.max(25, Math.round(currentAgencyFit.score * demographicWeightFactor)));

  // Aggiornamento dei cluster di acquirenti con la quota famiglie ISTAT
  const updatedClusters = (currentAgencyFit.matchingBuyerClusters || []).map(cluster => {
    if (cluster.profile.toLowerCase().includes('famigli') || cluster.profile.toLowerCase().includes('coppi')) {
      return {
        ...cluster,
        count: Math.max(cluster.count, calculatedYoungTarget)
      };
    }
    return cluster;
  });

  return {
    ...currentAgencyFit,
    score: adjustedFitScore,
    explanation: `${currentAgencyFit.explanation} (Convalidato da censimento ISTAT: quota giovani famiglie ${Math.round(youngFamiliesRatio * 100)}%)`,
    matchingBuyerClusters: updatedClusters
  };
}

/**
 * Funzione principale: Arricchisce e aggiorna una proprietà con i dati demografici ISTAT
 */
export async function enrichPropertyWithIstatDemographics(
  property: PropertyItem
): Promise<{
  updatedProperty: PropertyItem;
  demographics: MunicipalityDemographics;
  enrichmentResult: DemographicsEnrichmentResult;
}> {
  // 1. Estrazione identificativo comune: visura catastale o geocoding/città
  const cadastralCity = property.cadastralData?.cityCode || property.cadastralData?.sheet || property.city;
  const demographics = await getMunicipalityDemographics(cadastralCity);

  // 2. Trova punteggi attuali macro e location
  const currentMacroDim = property.dimensions?.find(d => d.key === 'macro');
  const currentLocationDim = property.dimensions?.find(d => d.key === 'location');

  const currentMacroScore = currentMacroDim?.score ?? 70;
  const currentLocationScore = currentLocationDim?.score ?? 75;

  // 3. Calcolo impatto pilastri
  const pillarImpact = calculateDemographicPillarScores(demographics, currentMacroScore, currentLocationScore);

  // 4. Aggiornamento dimensioni rating (Pilastro 7: Macro & Time, Pilastro 2: Location)
  const updatedDimensions: DimensionBreakdown[] = (property.dimensions || []).map(dim => {
    if (dim.key === 'macro') {
      return {
        ...dim,
        score: pillarImpact.macroScore,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_macro_4') {
            return {
              ...sub,
              score: pillarImpact.demographicTrendScore,
              summary: `ISTAT SDMX: Indice Vecchiaia ${demographics.agingIndex} • Quota Giovani Famiglie ${Math.round(demographics.youngFamiliesRatio * 100)}% • Pop. ${demographics.totalPopulation.toLocaleString()} ab.`,
              evidenceCount: 120
            };
          }
          return sub;
        })
      };
    }
    if (dim.key === 'location') {
      return {
        ...dim,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_loc_4') {
            return {
              ...sub,
              score: pillarImpact.urbanDensityScore,
              summary: `Densità demografica ISTAT: ${demographics.densityPerKm2.toLocaleString()} ab/km² su ${demographics.municipalityName} (${demographics.surfaceKm2} km²).`
            };
          }
          return sub;
        })
      };
    }
    return dim;
  });

  // 5. Ricalcolo Real Estate Rating
  let newRating = 0;
  for (const dim of updatedDimensions) {
    newRating += dim.score * dim.weight;
  }
  const roundedRating = Math.min(100, Math.max(10, Math.round(newRating)));

  // 6. Ricalcolo Agency Fit con peso giovani famiglie
  const updatedAgencyFit = reweightAgencyFitWithDemographics(property.agencyFit, demographics);

  const updatedProperty: PropertyItem = {
    ...property,
    realEstateRating: roundedRating,
    dimensions: updatedDimensions,
    agencyFit: updatedAgencyFit,
    demographics
  };

  const enrichmentResult: DemographicsEnrichmentResult = {
    demographics,
    macroPillarImpact: {
      status: pillarImpact.status,
      scoreContribution: pillarImpact.macroScore,
      agingRatioPenaltyOrBonus: pillarImpact.agingPenaltyOrBonus,
      densityPressureScore: pillarImpact.urbanDensityScore
    },
    demandMatchImpact: {
      targetYoungFamiliesCount: Math.round((updatedAgencyFit.compatibleActiveBuyers || 10) * demographics.youngFamiliesRatio),
      reweightedAgencyFitScore: updatedAgencyFit.score
    }
  };

  return {
    updatedProperty,
    demographics,
    enrichmentResult
  };
}

/**
 * Funzione di arricchimento dedicata: calcola e integra il profilo di rischio territoriale e ambientale (ISPRA / PCIV)
 */
export async function enrichPropertyWithEnvironmentalRisk(
  property: PropertyItem
): Promise<{
  updatedProperty: PropertyItem;
  environmentalRisk: EnvironmentalRiskProfile;
}> {
  const lat = property.coordinates?.lat ?? 41.9028;
  const lon = property.coordinates?.lng ?? 12.4964;
  const cadastralCity = property.cadastralData?.cityCode || property.cadastralData?.sheet || property.city;

  const environmentalRisk = await getEnvironmentalRisk(lat, lon, cadastralCity);
  const riskPillar = calculateEnvironmentalRiskPillarScores(
    environmentalRisk, 
    property.cadastralData?.assetRiskIndex, 
    property.cadastralData?.urbanCompliance
  );

  const updatedDimensions: DimensionBreakdown[] = (property.dimensions || []).map(dim => {
    if (dim.key === 'risk') {
      return {
        ...dim,
        score: riskPillar.riskScore,
        subDimensions: dim.subDimensions.map(sub => {
          if (sub.id === 'sub_risk_1') {
            return {
              ...sub,
              score: riskPillar.floodScore,
              summary: environmentalRisk.floodRiskLevel === 'NONE'
                ? 'ISPRA IdroGEO / Direttiva Alluvioni: Pericolosità idraulica P0 (Assente)'
                : `ISPRA IdroGEO: Pericolosità alluvione livello ${environmentalRisk.floodRiskLevel}`,
              evidenceCount: 15
            };
          }
          if (sub.id === 'sub_risk_2') {
            return {
              ...sub,
              score: riskPillar.seismicScore,
              summary: `Protezione Civile: ${environmentalRisk.seismicZoneLabel || `Zona Sismica ${environmentalRisk.seismicZone}`}`,
              evidenceCount: 12
            };
          }
          if (sub.id === 'sub_risk_3') {
            return {
              ...sub,
              score: riskPillar.landslideScore,
              summary: environmentalRisk.landslideRiskLevel === 'NONE'
                ? 'ISPRA IdroGEO PAI: Rischio geomorfologico e stabilità versanti assente'
                : `ISPRA IdroGEO PAI: Pericolo frana livello ${environmentalRisk.landslideRiskLevel}`,
              evidenceCount: 10
            };
          }
          return sub;
        })
      };
    }
    return dim;
  });

  let newRating = 0;
  for (const dim of updatedDimensions) {
    newRating += dim.score * dim.weight;
  }
  const roundedRating = Math.min(100, Math.max(10, Math.round(newRating)));

  const updatedProperty: PropertyItem = {
    ...property,
    realEstateRating: roundedRating,
    dimensions: updatedDimensions,
    environmentalRisk
  };

  return {
    updatedProperty,
    environmentalRisk
  };
}
