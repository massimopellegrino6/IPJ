import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Camera, 
  Layers, 
  FileText, 
  Eye, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { PropertyItem, PropertyImage } from '../../types/intelligence';
import { getPropertyImages } from '../../data/propertyMediaData';

interface PropertyGalleryProps {
  property: PropertyItem;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ property }) => {
  const images: PropertyImage[] = getPropertyImages(property);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'floorplan' | 'virtualStaging'>('photos');

  const currentImage = images[currentIndex] || images[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 shadow-xs">
      {/* Header with Title and Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Galleria Multimediale dell'Immobile</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                {images.length} Foto HD Verificate
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Rappresentazione fotografica certificata degli ambienti interni ed esterni.
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto font-mono">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto ({images.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('floorplan')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'floorplan'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Planimetria</span>
          </button>
          <button
            onClick={() => setActiveTab('virtualStaging')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'virtualStaging'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Staging AI</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'photos' && (
        <div className="space-y-3">
          {/* Main Stage Image */}
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative aspect-16/9 md:aspect-21/9 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group cursor-pointer"
          >
            <img 
              src={currentImage.url} 
              alt={currentImage.caption}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              loading="eager"
            />
            
            {/* Gradient Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top Bar Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  {currentImage.tag}
                </span>
                {currentImage.isHero && (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/90 text-slate-950 flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Copertina Principale</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-black/60 backdrop-blur-md border border-white/20 text-slate-200">
                  {currentIndex + 1} / {images.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  title="Schermo intero"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              aria-label="Foto precedente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
              aria-label="Foto successiva"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Caption Banner */}
            <div className="absolute bottom-3 left-3 right-3 text-left pointer-events-none">
              <p className="text-xs sm:text-sm font-medium text-white drop-shadow-md">
                {currentImage.caption}
              </p>
            </div>
          </div>

          {/* Thumbnail Reel */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative aspect-4/3 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'ring-2 ring-emerald-400 border-emerald-400 scale-102 opacity-100'
                    : 'border-slate-800 opacity-60 hover:opacity-90'
                }`}
              >
                <img 
                  src={img.url} 
                  alt={img.caption}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-white">
                  {img.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floor Plan View */}
      {activeTab === 'floorplan' && (
        <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="max-w-md mx-auto aspect-4/3 rounded-lg bg-slate-950 border border-slate-700/60 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Architectural schematic grid mock */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <Layers className="w-12 h-12 text-emerald-400 mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-white font-mono">
              Planimetria Catastale Ufficiale — {property.squareMeters} m²
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Foglio, Particella e Subalterno validati. Configurazione {property.rooms} locali, {property.bathrooms} bagni, piano {property.floor}.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                Conformità Urbanistica Verificata
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Staging AI View */}
      {activeTab === 'virtualStaging' && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h4 className="text-xs font-bold text-white uppercase font-mono">
                Ipotesi di Arredo & Virtual Staging Esecutivo
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Target: Coppie / Professionisti (Cluster A1)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Stato di Fatto (Listing)</span>
              <div className="aspect-16/9 rounded-lg overflow-hidden border border-slate-800 relative">
                <img 
                  src={images[0]?.url} 
                  alt="Stato Attuale" 
                  className="w-full h-full object-cover filter saturate-75"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-400 uppercase font-mono block font-bold">Staging Virtivo Digitale</span>
              <div className="aspect-16/9 rounded-lg overflow-hidden border border-emerald-500/40 relative">
                <img 
                  src={images[1]?.url || images[0]?.url} 
                  alt="Virtual Staged" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold font-mono text-[10px]">
                  +18% CTR Previsto
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl space-y-3 text-slate-200"
          >
            {/* Lightbox Controls Top */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-bold">
                  {currentImage.tag}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentIndex + 1} di {images.length} — {property.title}
                </span>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Main Image */}
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              <img 
                src={currentImage.url} 
                alt={currentImage.caption}
                className="w-full h-full object-contain"
              />

              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                aria-label="Precedente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                aria-label="Successiva"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <p className="text-center text-sm text-slate-300 font-medium">
              {currentImage.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
