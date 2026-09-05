import React, { useState } from 'react';
import { Database, FileCode, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL, NODE_EDGE_FUNCTION_CODE } from '../backend/sampleCode';

interface CodeViewerProps {
  initialCodeType?: 'sql' | 'node';
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ initialCodeType = 'sql' }) => {
  const [activeCode, setActiveCode] = useState<'sql' | 'node' | 'curl'>(initialCodeType);
  const [copied, setCopied] = useState<boolean>(false);

  const curlExample = `# Test Supabase Edge Function locally or in production
curl -X POST 'https://<your-project-ref>.supabase.co/functions/v1/evaluate-property' \\
  -H 'Authorization: Bearer <SUPABASE_ANON_KEY>' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "property_id": "prop_mi_isola_01"
  }'`;

  const getCodeContent = () => {
    switch (activeCode) {
      case 'sql':
        return SUPABASE_SCHEMA_SQL;
      case 'node':
        return NODE_EDGE_FUNCTION_CODE;
      case 'curl':
        return curlExample;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-slate-900 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>Production Architecture Assets</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Codice Sorgente per Supabase & Node.js
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            File pronti per il deployment su Supabase SQL Editor e Supabase Edge Functions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Code Selection Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveCode('sql')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCode === 'sql'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>schema.sql</span>
            </button>

            <button
              onClick={() => setActiveCode('node')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCode === 'node'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>evaluate-property.ts</span>
            </button>

            <button
              onClick={() => setActiveCode('curl')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCode === 'curl'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>cURL Test</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiato!' : 'Copia'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Preview Box */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-300 font-semibold">
              {activeCode === 'sql' && 'supabase/schema.sql (PostgreSQL 15+)'}
              {activeCode === 'node' && 'supabase/functions/evaluate-property/index.ts'}
              {activeCode === 'curl' && 'api-test.sh'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">UTF-8 • Production Ready</span>
        </div>

        <pre className="p-4 overflow-x-auto text-slate-200 max-h-[600px] leading-relaxed select-text">
          <code>{getCodeContent()}</code>
        </pre>
      </div>
    </div>
  );
};
