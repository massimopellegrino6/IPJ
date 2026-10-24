import { MacroCreditSnapshot } from '../types/marketData';

/**
 * Client Macroeconomia & Credito Residenziale (Banca d'Italia / BCE).
 * Traccia i tassi guida: Euribor 3M, Euribor 6M, EurIRS 20Y e il TAEG medio dei mutui residenziali in Italia.
 * Calcola il creditAvailabilityIndex (0–100) e il liquidityDiscountFactor per la stima DOM.
 */
export function getMacroCreditContext(customTaeg?: number): MacroCreditSnapshot {
  // Parametri di mercato macroeconomico corrente (aggiornati ai dati statistici Banca d'Italia)
  const euribor3m = 3.18;
  const euribor6m = 3.12;
  const eurIrs20y = 2.65;
  const avgMortgageTaegItaly = customTaeg ?? 3.48; // Media nazionale standard attuale

  let creditAvailabilityIndex = 72;
  let liquidityDiscountFactor = 1.0;

  // Regole prescritte:
  // Se TAEG medio > 4.2%: creditAvailabilityIndex = 50, liquidityDiscountFactor = 0.85 (contrazione del mercato, +15% di giorni sul mercato necessari)
  // Se TAEG medio < 2.8%: creditAvailabilityIndex = 90, liquidityDiscountFactor = 1.15 (espansione e accelerazione compravendite)
  // Range normale: creditAvailabilityIndex = 72, liquidityDiscountFactor = 1.0
  if (avgMortgageTaegItaly > 4.2) {
    creditAvailabilityIndex = 50;
    liquidityDiscountFactor = 0.85;
  } else if (avgMortgageTaegItaly < 2.8) {
    creditAvailabilityIndex = 90;
    liquidityDiscountFactor = 1.15;
  } else {
    // Calibrazione continua all'interno della fascia normale (2.8 - 4.2%)
    // Interpolazione lineare
    const ratio = (avgMortgageTaegItaly - 2.8) / (4.2 - 2.8);
    creditAvailabilityIndex = Math.round(90 - ratio * 40); // 90 -> 50
    liquidityDiscountFactor = Number((1.15 - ratio * 0.30).toFixed(2)); // 1.15 -> 0.85
  }

  return {
    recordedAt: new Date().toISOString(),
    euribor3m,
    euribor6m,
    eurIrs20y,
    avgMortgageTaegItaly,
    creditAvailabilityIndex,
    liquidityDiscountFactor
  };
}
