import React, { useState } from 'react';
import { 
  Scale, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Layers, 
  ArrowUpDown, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Zap,
  Building2,
  Info
} from 'lucide-react';
import { ComparableTransaction, McaEvaluationResult } from '../../types/comparables';
import { PropertyItem } from '../../types/intelligence';
import { evaluateSubjectWithMca, importHistoricalAgencyTransactionsCsv, getInMemoryTransactionsCount } from '../../backend/comparablesClient';

interface PropertyComparablesMcaTabProps {
  property: PropertyItem;
  onRefreshEvaluation?: () => void;
}

export const PropertyComparablesMcaTab: React.FC<PropertyComparablesMcaTabProps> = ({
  property,
  onRefreshEvaluation
}) => {
  // Calcolo deterministico MCA per il subject corrente
  const [mcaResult, setMcaResult] = useState<McaEvaluationResult>(() => {
    return property.mcaEvaluation || evaluateSubjectWithMca(property);
  });

  // Stato per l'onboarding CSV agenzia
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvFeedback, setCsvFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const sampleCsvSnippet = `address,lat,lon,transactionDate,salePriceEur,surfaceMq,floor,hasElevator,conservationState,energyClass
"Via Nomentana 112, Roma",41.9125,12.5015,2026-01-15,440000,95,3,true,NORMALE,D
"Via Alessandria 44, Roma",41.9105,12.5030,2025-11-20,415000,90,2,true,OTTIMO,C
"Via Reggio Emilia 8, Roma",41.9130,12.5020,2026-03-02,460000,98,4,true,OTTIMO,B`;

  const handleImportCsv = () => {
    if (!csvText.trim()) return;
    const { importedCount, errors } = importHistoricalAgencyTransactionsCsv(csvText);

    if (importedCount > 0) {
      setCsvFeedback({
        success: true,
        message: `Importati con successo ${importedCount} rogiti storici nell'archivio agenzia. Il motore MCA è stato ricalibrato!`
      });
      // Ricalcola subito l'MCA
      const updatedMca = evaluateSubjectWithMca(property);
      setMcaResult(updatedMca);
      if (onRefreshEvaluation) onRefreshEvaluation();
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvFeedback(null);
        setCsvText('');
      }, 2500);
    } else {
      setCsvFeedback({
        success: false,
        message: errors.join(' | ') || 'Nessun record valido trovato.'
      });
    }
  };

  const handleRecompute = () => {
    const updated = evaluateSubjectWithMca(property);
    setMcaResult(updated);
    if (onRefreshEvaluation) onRefreshEvaluation();
  };

  const totalStoreCount = getInMemoryTransactionsCount();

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-6 shadow-xs">
      {/* Header Tab */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold mb-1">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Market Comparison Approach (MCA) • Strada C</span>
            <span>•</span>
            <span className="text-slate-400">IVS / Standard Nazionali</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Motore Comparabili & Rogiti Notarili Verificati</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
              mcaResult.status === 'MCA_SAMPLE_VALID' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' 
                : 'bg-amber-950 text-amber-300 border border-amber-600/50'
            }`}>
              {mcaResult.status === 'MCA_SAMPLE_VALID' ? 'SAMPLE VALIDO (>=3 ROGITI)' : 'FALLBACK OMI DEGRADATO (<3)'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Risoluzione oggettiva dei rogiti notarili reali entro 600m con rettifiche edoniche marginali IVS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Carica CSV Agenzia</span>
          </button>

          <button
            onClick={handleRecompute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ricalcola MCA</span>
          </button>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        {/* Fair Value MCA */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Fair Value MCA Stimato</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">€{mcaResult.mcaFairValueCentral.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">
            €{mcaResult.mcaPricePerMqMean.toLocaleString()}/m² (Mediana Ponderata)
          </p>
        </div>

        {/* Campione Transazioni */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Campione Rogiti (&le; 600m)</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold ${mcaResult.comparablesFoundCount >= 3 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {mcaResult.comparablesFoundCount}
            </span>
            <span className="text-slate-400 text-xs">/ 3 min. richiesti</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Archivio totale attivo: {totalStoreCount} atti
          </p>
        </div>

        {/* Dispersione / Spread */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Dispersione Rettifiche MCA</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold ${mcaResult.divergenceSpreadPct <= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {mcaResult.divergenceSpreadPct}%
            </span>
            <span className="text-slate-400 text-xs">(Target &le; 10%)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Spread max-min prezzi normalizzati
          </p>
        </div>

        {/* Penalità di Confidenza */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Penalità Confidenza (§28)</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold ${mcaResult.confidencePenaltyApplied === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {mcaResult.confidencePenaltyApplied === 0 ? '0 pt' : `-${mcaResult.confidencePenaltyApplied} pt`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {mcaResult.confidencePenaltyApplied === 0 ? 'Campione statisticamente integro' : 'Graceful Degradation attiva'}
          </p>
        </div>
      </div>

      {/* Graceful Degradation Alert or Validation Rationale */}
      {mcaResult.status === 'FALLBACK_OMI_DEGRADED' ? (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300 text-sm">
                Bivio Deterministico Attivo: Graceful Degradation su Baseline OMI (§28)
              </div>
              <p className="text-slate-300 leading-relaxed">
                {mcaResult.appliedRationale}
              </p>
              <div className="text-[11px] font-mono text-amber-400 pt-1">
                • Penalità applicata: <strong>-25 punti</strong> sul Confidence Score.
                <br />
                • Se la confidenza scende sotto 50%, la prescrizione decisionale Action Score viene bloccata per non indurre in errore il broker.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mcaResult.appliedRationale}</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600/40 font-bold">
            IVS COMPLIANT
          </span>
        </div>
      )}

      {/* Tabella Comparabili Notarili con Rettifiche Edoniche Marginali */}
      {mcaResult.comparables.length > 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="p-3.5 bg-slate-850/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Transazioni Rilevate nel Raggio di 600m ({mcaResult.comparables.length} rogiti)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Rettifiche: Piano (±3%) • Ascensore (±8%) • Stato (±10-20%) • Classe En. (±2.5%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Immobile & Indirizzo</th>
                  <th className="py-2.5 px-3">Distanza / Data</th>
                  <th className="py-2.5 px-3">Sup. / Piano / Asc.</th>
                  <th className="py-2.5 px-3">Prezzo Rogito</th>
                  <th className="py-2.5 px-3">€/m² Rogito</th>
                  <th className="py-2.5 px-3">Rettifiche Tot.</th>
                  <th className="py-2.5 px-3 text-right">Prezzo MCA Rettificato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {mcaResult.comparables.map((comp) => {
                  const adj = comp.mcaAdjustments;
                  const deltaTotal = adj?.totalAdjustmentEur ?? 0;

                  return (
                    <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{comp.propertyAddress}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            comp.source === 'REDIP_CLOSED_LOOP' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/40' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {comp.source === 'REDIP_CLOSED_LOOP' ? 'REDIP Closed-Loop' : 'Archivio Agenzia'}
                          </span>
                          <span>Stato: {comp.features.conservationState}</span>
                          <span>•</span>
                          <span>Cl. {comp.features.energyClass}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-cyan-300 font-semibold">{comp.distanceMeters}m</div>
                        <div className="text-[10px] text-slate-400">{comp.transactionDate} ({comp.monthsAgo}m fa)</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div>{comp.surfaceMq} m²</div>
                        <div className="text-[10px] text-slate-400">
                          P.{comp.features.floor} {comp.features.hasElevator ? '• Ascensore' : '• No Asc.'}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        €{comp.salePriceEur.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        €{comp.pricePerMq.toLocaleString()}/m²
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`font-bold ${deltaTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {deltaTotal >= 0 ? `+€${deltaTotal.toLocaleString()}` : `-€${Math.abs(deltaTotal).toLocaleString()}`}
                        </span>
                        <div className="text-[9px] text-slate-400">
                          P:{adj?.floorAdjustmentEur ?? 0} Asc:{adj?.elevatorAdjustmentEur ?? 0} St:{adj?.stateAdjustmentEur ?? 0} En:{adj?.energyAdjustmentEur ?? 0}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="text-sm font-extrabold text-emerald-300">
                          €{(adj?.adjustedPriceEur ?? comp.salePriceEur).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-400/80">
                          €{(adj?.adjustedPricePerMq ?? comp.pricePerMq).toLocaleString()}/m²
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-2 bg-slate-900/30">
          <MapPin className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Nessuna transazione notarile nel raggio di 600m</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Non risultano rogiti storici archiviati per queste coordinate. Puoi caricare il CSV delle compravendite chiuse dalla tua agenzia per sbloccare l'algoritmo MCA.
          </p>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importa Storico Rogiti (.CSV)</span>
          </button>
        </div>
      )}

      {/* Modal Onboarding CSV Agenzia */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Onboarding Agenzia Pilota: Ingestion Storico Rogiti (CSV)</h3>
                <p className="text-xs text-slate-400">Alimenta il closed-loop MCA con le compravendite realmente perfezionate dai tuoi agenti.</p>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Incolla il contenuto CSV con le colonne prescritte:</span>
                <button
                  onClick={() => setCsvText(sampleCsvSnippet)}
                  className="text-cyan-400 hover:underline font-mono text-[11px]"
                >
                  Carica Esempio Demo
                </button>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="address,lat,lon,transactionDate,salePriceEur,surfaceMq,floor,hasElevator,conservationState,energyClass&#10;&quot;Via Cola di Rienzo 110&quot;,41.9065,12.4725,2026-02-10,420000,95,3,true,NORMALE,D"
                rows={8}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {csvFeedback && (
              <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                csvFeedback.success 
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200' 
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
              }`}>
                {csvFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{csvFeedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Esegui Ingestion & Ricalibra MCA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
