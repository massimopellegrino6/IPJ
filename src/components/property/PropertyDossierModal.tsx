import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Download, 
  Share2, 
  Globe, 
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  Building,
  Layers,
  FileBadge,
  Edit3
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { getPropertyRegistryInfo } from '../../data/propertyRegistryData';
import { getPropertyImages } from '../../data/propertyMediaData';
import { CadastralUploadDropzone } from './CadastralUploadDropzone';
import { EditPropertyModal } from './EditPropertyModal';

interface PropertyDossierModalProps {
  property: PropertyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenIntelligence: (property: PropertyItem) => void;
  onUpdateProperty?: (updated: PropertyItem) => void;
}

export const PropertyDossierModal: React.FC<PropertyDossierModalProps> = ({
  property,
  isOpen,
  onClose,
  onOpenIntelligence,
  onUpdateProperty
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showCadastralUpload, setShowCadastralUpload] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen || !property) return null;

  const registry = getPropertyRegistryInfo(property);
  const images = getPropertyImages(property);
  const heroImage = images[0]?.url;

  const { cadastralData, mandate, documents, portalSyndication } = registry;

  const handleDownloadBrochure = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const docCount = Object.values(documents).filter(Boolean).length;
  const isAllDocsValid = docCount === 5;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with hero photo banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900 flex-shrink-0">
          <img 
            src={heroImage} 
            alt={property.title}
            className="w-full h-full object-cover filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md cursor-pointer transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner bottom info */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500 text-slate-950">
                  {mandate.type} Mandate
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 border border-white/20 text-slate-200">
                  Cod: {property.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 border border-white/20 text-slate-200">
                  {property.propertyType} • {property.squareMeters} m²
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {property.title}
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                {property.address}, {property.city} ({property.province}) — {property.microZone}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Prezzo Richiesto</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                €{property.askingPrice.toLocaleString('it-IT')}
              </span>
              <span className="text-[11px] font-mono text-slate-400 block">
                (€{property.pricePerSqm.toLocaleString('it-IT')} / m²)
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-200">
          
          {/* Section 1: Dati Catastali & Regolarità Urbanistica */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <FileBadge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    Identificativi Catastali Ufficiali (Catasto Fabbricati)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Parser Visura per Soggetto AdE con Certificazione Immobile Principale + Pertinenze
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCadastralUpload(!showCadastralUpload)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-950 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{showCadastralUpload ? 'Chiudi Parser' : 'Carica Visura AdE (+8% Boost)'}</span>
                </button>

                {cadastralData.urbanCompliance === 'COMPLIANT' ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Conformità RRE OK</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>In Corso</span>
                  </span>
                )}
              </div>
            </div>

            {/* Embedded Cadastral Upload Dropzone */}
            {showCadastralUpload && (
              <div className="pt-2 pb-2">
                <CadastralUploadDropzone
                  currentProperty={property}
                  onApplyAudit={(updatedProp) => {
                    if (onUpdateProperty) {
                      onUpdateProperty(updatedProp);
                    }
                    setShowCadastralUpload(false);
                  }}
                  onClose={() => setShowCadastralUpload(false)}
                />
              </div>
            )}

            {/* Verified Asset Risk Index Banner */}
            {cadastralData.assetRiskIndex === 'VERIFIED' && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                      <span>Asset Risk Index: VERIFIED</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500 text-slate-950 font-extrabold">
                        AUDIT DOCUMENTALE COMPLETO
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-300/80 font-mono">
                      Rating Engine World Model: Boost algoritmico +8% applicato (Confidenza: {property.ratingConfidence}%)
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {cadastralData.provenance ? cadastralData.provenance : 'Rogito validato'}
                </span>
              </div>
            )}

            {/* Main Cadastral Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Comune Catastale</span>
                <span className="font-bold text-white">{property.city} ({property.province})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Foglio</span>
                <span className="font-bold text-white">{cadastralData.sheet}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Particella</span>
                <span className="font-bold text-white">{cadastralData.parcel}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Subalterno</span>
                <span className="font-bold text-cyan-400">{cadastralData.subaltern}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Categoria</span>
                <span className="font-bold text-white">{cadastralData.cadastralCategory}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Rendita Catastale</span>
                <span className="font-bold text-emerald-400">€{cadastralData.annuity.toLocaleString('it-IT')}</span>
              </div>
            </div>

            {/* Annexes / Pertinenze collegate if available */}
            {cadastralData.annexes && cadastralData.annexes.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pertinenze Catastali Collegate ({cadastralData.annexes.length} Rilevate nella Visura)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Immobile Principale + Pertinenza Collegata
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {cadastralData.annexes.map((annex, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-cyan-300">{annex.cadastralCategory}</span>
                        <span className="text-slate-300"> — {annex.address || property.address}</span>
                        <span className="text-[10px] text-slate-400 block">
                          Fgl. {annex.sheet} • Part. {annex.parcel} • Sub. {annex.subaltern} ({annex.totalSurfaceMq || 15} mq)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Rendita</span>
                        <span className="font-bold text-emerald-400">€{annex.annuity.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Checklist Documentale (Due Diligence) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  Dossier Documentale & Due Diligence ({docCount}/5 Verificati)
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold ${isAllDocsValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAllDocsValid ? 'Dossier Conforme al Rogito' : 'Mancanze Documentali Rilevate'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Atto di Provenienza</div>
                  <div className="text-[10px] text-slate-400 font-mono">Notaio & Trascrizione OK</div>
                </div>
                {documents.deedOfOrigin ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Visura Ipotecaria</div>
                  <div className="text-[10px] text-slate-400 font-mono">Libero da ipoteche pregiudizievoli</div>
                </div>
                {documents.mortgageInspection ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                    Aggiornamento
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Certificato APE (Classe {property.energyClass})</div>
                  <div className="text-[10px] text-slate-400 font-mono">Registrazione SIAPE valida</div>
                </div>
                {documents.energyCertificateAPE ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Planimetria Catastale</div>
                  <div className="text-[10px] text-slate-400 font-mono">Corrispondenza 1:1 con stato di fatto</div>
                </div>
                {documents.floorPlanCompliance ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
                <div>
                  <div className="font-bold text-white">Regolamento di Condominio & Oneri Ordinari</div>
                  <div className="text-[10px] text-slate-400 font-mono">Nessuna spesa straordinaria deliberata negli ultimi verbali</div>
                </div>
                {documents.condoRegulation ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Gestione Mandato & Agente Incaricato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mandate Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Contratto di Mandato</span>
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {mandate.type}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Data Inizio:</span>
                  <span className="text-white font-bold">{mandate.startDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Scadenza Incarico:</span>
                  <span className="text-white font-bold">{mandate.expirationDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Giorni Residui:</span>
                  <span className={`font-bold ${mandate.daysToExpiration < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {mandate.daysToExpiration} giorni {mandate.daysToExpiration < 30 ? '(Scadenza Imminente)' : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Provvigione Concordata:</span>
                  <span className="text-emerald-400 font-bold">{mandate.commissionPct}% + IVA</span>
                </div>
              </div>
            </div>

            {/* Assigned Agent Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Broker / Agente Assegnato</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Incarico Attivo</span>
              </div>

              <div className="flex items-center gap-3">
                <img 
                  src={mandate.assignedAgent.avatar} 
                  alt={mandate.assignedAgent.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                />
                <div>
                  <h5 className="text-sm font-bold text-white">{mandate.assignedAgent.name}</h5>
                  <p className="text-xs text-slate-400">{mandate.assignedAgent.role}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {mandate.assignedAgent.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Disponibilità visite proprietario: Lunedì e Giovedì 16:00 - 19:00, Sabato mattina su appuntamento.
              </div>
            </div>
          </div>

          {/* Section 4: Multicasting & Portali */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Multicasting & Sincronizzazione Portali Immobiliari</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400">Feed XML Sincronizzato</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Immobiliare.it</span>
                {portalSyndication.immobiliare ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">ONLINE</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-500">OFF</span>
                )}
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Idealista.it</span>
                {portalSyndication.idealista ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">ONLINE</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-500">OFF</span>
                )}
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Casa.it</span>
                {portalSyndication.casaIt ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">ONLINE</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-500">OFF</span>
                )}
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Portale Agency</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">ATTIVO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Ultima verifica tecnica catastale: 12 gg fa</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
              title="Modifica indirizzo, prezzo, vani o dati catastali"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Modifica Dati Immobile</span>
            </button>

            <button
              onClick={handleDownloadBrochure}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Dossier PDF Scaricato!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Scarica Dossier PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenIntelligence(property);
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apri Scheda Decisionale</span>
            </button>
          </div>
        </div>

        {/* Embedded Edit Modal */}
        <EditPropertyModal
          property={property}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateProperty={(updatedProp) => {
            if (onUpdateProperty) {
              onUpdateProperty(updatedProp);
            }
            setIsEditModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};
