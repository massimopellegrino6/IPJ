import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Train, 
  Trees, 
  ShoppingBag, 
  GraduationCap, 
  HeartPulse, 
  Footprints, 
  Bus, 
  Layers,
  Compass,
  Building
} from 'lucide-react';
import { PropertyItem } from '../../types/intelligence';
import { getNearbyPois, NearbyPoi } from '../../data/propertyMediaData';

interface PropertyLocationMapProps {
  property: PropertyItem;
}

export const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({ property }) => {
  const pois: NearbyPoi[] = getNearbyPois(property);
  const [mapMode, setMapMode] = useState<'map' | 'pois' | 'urbanStats'>('map');
  const [copiedGps, setCopiedGps] = useState(false);
  const [activePoiCategory, setActivePoiCategory] = useState<string>('all');

  const { lat, lng } = property.coordinates;

  // OpenStreetMap embed URL with exact bounding box and marker
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006}%2C${lat - 0.0035}%2C${lng + 0.006}%2C${lat + 0.0035}&layer=mapnik&marker=${lat}%2C${lng}`;

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const googleStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  const handleCopyGps = () => {
    navigator.clipboard?.writeText(`${lat}, ${lng}`);
    setCopiedGps(true);
    setTimeout(() => setCopiedGps(false), 2500);
  };

  const filteredPois = pois.filter(p => activePoiCategory === 'all' || p.category === activePoiCategory);

  const getPoiIcon = (category: string) => {
    switch (category) {
      case 'transit':
        return <Train className="w-4 h-4 text-cyan-400" />;
      case 'green':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'retail':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Localizzazione Geografica & Microzona</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {property.address}, {property.city} ({property.province}) — {property.microZone}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto font-mono">
          <button
            onClick={() => setMapMode('map')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              mapMode === 'map'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mappa Live</span>
          </button>
          <button
            onClick={() => setMapMode('pois')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              mapMode === 'pois'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Servizi & POI ({pois.length})</span>
          </button>
          <button
            onClick={() => setMapMode('urbanStats')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              mapMode === 'urbanStats'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Dati OMI</span>
          </button>
        </div>
      </div>

      {/* Main Map View */}
      {mapMode === 'map' && (
        <div className="space-y-3">
          <div className="relative w-full aspect-16/9 md:aspect-21/9 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
            {/* Live Interactive Map via OpenStreetMap iframe */}
            <iframe
              title={`Mappa ${property.title}`}
              src={osmEmbedUrl}
              className="w-full h-full border-0 filter invert-[90%] hue-rotate-180 contrast-95 opacity-90 hover:opacity-100 transition-opacity"
              loading="lazy"
            />

            {/* Micro-Overlay Pin Info in Corner */}
            <div className="absolute top-3 left-3 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 max-w-xs text-xs space-y-1 shadow-lg pointer-events-auto">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>Posizione Verificata Immobile</span>
              </div>
              <p className="text-[11px] text-white font-semibold line-clamp-1">
                {property.address}
              </p>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                <span>Zona OMI: {property.microZone}</span>
              </div>
            </div>

            {/* Direct Link Controls Bottom Right */}
            <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2 pointer-events-auto">
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-700 backdrop-blur-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
              <a
                href={googleStreetViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-700 backdrop-blur-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Street View</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
              <button
                onClick={handleCopyGps}
                className="px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-700 backdrop-blur-md text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {copiedGps ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">GPS Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copia GPS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Geospatial Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>Walkability</span>
              </span>
              <span className="font-bold text-emerald-400">92 / 100</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Trasporti</span>
              </span>
              <span className="font-bold text-cyan-400">88 / 100</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verde Urbano</span>
              </span>
              <span className="font-bold text-white">450m Parco</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-indigo-400" />
                <span>Metro / FS</span>
              </span>
              <span className="font-bold text-indigo-400">3 min piedi</span>
            </div>
          </div>
        </div>
      )}

      {/* Nearby POIs View */}
      {mapMode === 'pois' && (
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-1 text-xs">
            {[
              { id: 'all', label: 'Tutti i Servizi' },
              { id: 'transit', label: 'Trasporti & Metro' },
              { id: 'green', label: 'Parchi & Verde' },
              { id: 'retail', label: 'Negozi & Spesa' },
              { id: 'education', label: 'Scuole & Didattica' },
              { id: 'health', label: 'Salute & Farmacie' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActivePoiCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                  activePoiCategory === cat.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* POI List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredPois.map(poi => (
              <div 
                key={poi.id}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                  {getPoiIcon(poi.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-white truncate">
                      {poi.name}
                    </h5>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex-shrink-0">
                      {poi.distanceMeters}m ({poi.walkingMinutes} min)
                    </span>
                  </div>
                  {poi.lineOrDetail && (
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {poi.lineOrDetail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urban & OMI Microzone Context */}
      {mapMode === 'urbanStats' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Parametri Microterritoriali Ufficiali OMI (Agenzia delle Entrate)</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Semestre Attivo 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block">Range Min/Max OMI (€/m²)</span>
              <span className="text-sm font-bold text-white">€3.600 - €4.550</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Asset congruo nel range</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block">Liquidità Territoriale</span>
              <span className="text-sm font-bold text-cyan-400">Media-Alta (82/100)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Assorbimento medio: 94 gg</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block">Pressione Domanda Acquirenti</span>
              <span className="text-sm font-bold text-amber-400">9 Prospect Attivi</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Budget medio: €385.000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
