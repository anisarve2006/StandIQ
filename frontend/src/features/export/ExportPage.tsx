import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Check
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

export default function ExportPage() {
  const { basket } = useStandIQ();

  const [format, setFormat] = useState<'pdf' | 'docx' | 'xlsx' | 'json'>('pdf');
  const [fileName, setFileName] = useState('Electrical_Motor_Specification_2026');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [packageItems, setPackageItems] = useState([
    { id: 'tech-spec', label: 'Technical Specification', checked: true },
    { id: 'std-list', label: 'Applicable Standards List', checked: true },
    { id: 'comp-check', label: 'Compliance Checklist', checked: true },
    { id: 'mapping-table', label: 'Standards Mapping Table', checked: true },
    { id: 'ai-report', label: 'AI Analysis Report', checked: true },
    { id: 'approval-hist', label: 'Approval History', checked: true },
  ]);

  const togglePackageItem = (id: string) => {
    setPackageItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      // Trigger a client-side text/json or simulated file download
      const element = document.createElement('a');
      const file = new Blob([
        `STANDIQ SPECIFICATION PACKAGE\n==============================\nFile: ${fileName}.${format}\nStandards Included:\n${basket.map(s => `- ${s.code}: ${s.title}`).join('\n')}\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${fileName}.${format}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Export Specification Package</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate and export complete tender specification documents.
        </p>
      </div>

      {/* 02. Two Column Selector Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Export Format */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Export Format</h2>

          <div className="space-y-3">
            {[
              {
                id: 'pdf',
                title: 'PDF (Recommended)',
                description: 'Complete specification document with official headers and formatting',
                icon: FileText
              },
              {
                id: 'docx',
                title: 'DOCX',
                description: 'Editable Microsoft Word document for procurement revision',
                icon: FileText
              },
              {
                id: 'xlsx',
                title: 'XLSX',
                description: 'Standards mapping and compliance verification spreadsheet',
                icon: FileSpreadsheet
              },
              {
                id: 'json',
                title: 'JSON',
                description: 'Structured data export for GeM / CPPP ERP system integration',
                icon: FileCode
              },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = format === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{f.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Package Includes */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Package Includes</h2>
            <span className="text-xs text-slate-400 font-mono">
              {packageItems.filter(p => p.checked).length} of {packageItems.length} selected
            </span>
          </div>

          <div className="space-y-2.5">
            {packageItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/70 cursor-pointer transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => togglePackageItem(item.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                  Ready
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 03. Bottom File Name & Action Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            File Name
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-l-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs font-mono text-slate-500 font-bold">
              .{format}
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm self-end sm:self-auto"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Downloaded!</span>
            </>
          ) : downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Package...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Generate & Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
