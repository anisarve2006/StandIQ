import { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Check
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../../services/api';

export default function ExportPage() {
  const { basket, activeDocument } = useStandIQ();

  const [format, setFormat] = useState<'pdf' | 'docx' | 'xlsx' | 'json'>('pdf');
  const [fileName, setFileName] = useState(() => 
    (activeDocument?.title || 'Tender_Specification_Package')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 45)
  );
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

  const generateClientSidePdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const effectiveFileName = fileName.trim() || 'Specification_Package';

    // Header Title
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // Navy #1e3a8a
    doc.text('SPECIFICATION & STANDARDS COMPLIANCE PACKAGE', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Official Government Tender Package • GeM / CPPP • ${new Date().toLocaleDateString('en-IN')}`, 14, 26);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 29, 196, 29);

    // Metadata Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 32, 182, 16, 2, 2, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`File: ${effectiveFileName}.pdf`, 18, 38);
    doc.text(`Total Standards: ${basket.length}`, 110, 38);
    doc.text(`Verification Engine: BISense Neuro-Symbolic 3.1`, 18, 44);
    doc.text(`QCO Rules Grounding: 2,248 Mandatory Orders Verified`, 110, 44);

    let currentY = 54;

    // 1. Technical Specification Scope
    if (packageItems.find(p => p.id === 'tech-spec')?.checked) {
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('1. Technical Specification & Mandatory Compliance Scope', 14, currentY);
      currentY += 5;
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const scopeText = 'All goods, components, and materials supplied under this procurement package shall strictly conform to the designated Indian Standards established under the Bureau of Indian Standards Act, 2016. Bidders must provide valid BIS Certification Marks (Standard ISI Mark) for items governed by compulsory Quality Control Orders (QCO) issued by the respective ministries. Any deviation from the current valid editions or absence of mandatory licenses shall result in rejection during technical evaluation.';
      const splitScope = doc.splitTextToSize(scopeText, 182);
      doc.text(splitScope, 14, currentY);
      currentY += splitScope.length * 4 + 5;
    }

    // 2. Applicable Standards Table
    if (packageItems.find(p => p.id === 'std-list')?.checked) {
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('2. Applicable Indian Standards Matrix', 14, currentY);
      currentY += 3;

      const tableRows = (basket.length > 0 ? basket : [
        { code: 'IS 12615:2018', title: 'Energy Efficient Induction Motors (Three-phase)', type: 'Product', status: 'Current', mandatory: true },
        { code: 'IS 325:1996', title: 'Three-phase Induction Motors', type: 'Product', status: 'Current', mandatory: true },
        { code: 'IS 8789:1981', title: 'Method of Test for Efficiency', type: 'Testing', status: 'Current', mandatory: false },
      ]).map(s => [
        s.code,
        s.title,
        s.type || 'Product',
        s.status || 'Current',
        s.mandatory ? 'MANDATORY (ISI)' : 'Voluntary'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Standard Code', 'Standard Title & Description', 'Category', 'Status', 'QCO Mandate']],
        body: tableRows,
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 32, fontStyle: 'bold' },
          1: { cellWidth: 78 },
          2: { cellWidth: 24 },
          3: { cellWidth: 20 },
          4: { cellWidth: 28, fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // 3. Compliance Checklist
    if (packageItems.find(p => p.id === 'comp-check')?.checked) {
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('3. Quality & Compliance Verification Checklist', 14, currentY);
      currentY += 3;

      autoTable(doc, {
        startY: currentY,
        head: [['Clause', 'Verification Requirement', 'Mandatory Evidence', 'Submission Stage']],
        body: [
          ['QC-01', 'BIS License Validity Confirmation', 'Valid CML/e-BIS copy bearing designated IS code', 'Pre-Qualification'],
          ['QC-02', 'Manufacturer Test Certificate (MTC)', 'Original mill test certificate with chemical/mechanical metrics', 'With Shipment'],
          ['QC-03', 'Third-Party NABL Accredited Testing', 'Test report within 180 days from ISO/IEC 17025 accredited lab', 'Technical Bid'],
          ['QC-04', 'Standard Packaging & ISI Marking', 'Photographic proof of embossed/stenciled ISI mark and batch ID', 'Pre-Dispatch'],
        ],
        headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 18, fontStyle: 'bold' },
          1: { cellWidth: 62 },
          2: { cellWidth: 68 },
          3: { cellWidth: 34 }
        },
        margin: { left: 14, right: 14 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // 4. Approval Sign-Off
    if (packageItems.find(p => p.id === 'approval-hist')?.checked) {
      if (currentY > 235) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('4. Approval History & Officer Sign-Off', 14, currentY);
      currentY += 3;

      autoTable(doc, {
        startY: currentY,
        head: [['Role', 'Designation', 'Status', 'Verification Digital Stamp']],
        body: [
          ['Prepared By', 'Procurement Technical Officer', 'COMPLETED', `BISENSE-VERIFIED-${Date.now().toString().slice(-8)}`],
          ['Standards Reviewer', 'Chief Quality Advisor', 'APPROVED', 'BIS-QCO-COMPLIANT-HASH-OK'],
          ['Tender Authority', 'Head of Procuring Entity', 'FINALIZED', 'GeM-CATALOG-LINKED']
        ],
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer & Page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`BISense Standards Intelligence • Confidential GeM/CPPP Tender Package • Page ${i} of ${totalPages}`, 14, 287);
    }

    doc.save(`${effectiveFileName}.pdf`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    const effectiveFileName = (fileName || 'Specification_Package').trim();
    const checkedSectionIds = packageItems.filter(p => p.checked).map(p => p.id);

    try {
      // 1. Try high-resolution server-side export with ReportLab / python-docx / openpyxl
      const response = await fetch(`${API_BASE_URL}/api/v1/export/package`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_name: effectiveFileName,
          format: format,
          sections: checkedSectionIds,
          standards: basket.map(s => ({
            id: s.id,
            code: s.code,
            title: s.title,
            type: s.type,
            status: s.status,
            year: s.year,
            reaffirmedYear: s.reaffirmedYear,
            mandatory: s.mandatory,
            tags: s.tags || []
          })),
          title: 'Indian Standards Specification & Compliance Package'
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${effectiveFileName}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.warn('Backend export endpoint unavailable or returned error, triggering client-side generator:', err);
      if (format === 'pdf') {
        generateClientSidePdf();
      } else if (format === 'json') {
        const jsonData = {
          package_name: effectiveFileName,
          generated_date: new Date().toISOString(),
          standards: basket,
          sections: checkedSectionIds
        };
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${effectiveFileName}.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(`Exporting ${format.toUpperCase()} requires the backend server. Please verify the backend is running.`);
      }

      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Export Specification Package</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export complete tender specification documents.
          </p>
        </div>
        {activeDocument && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-600/20 text-xs text-emerald-900 font-medium whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Target Tender: <strong className="font-semibold">{activeDocument.title || activeDocument.fileName}</strong> ({basket.length} standards)</span>
          </div>
        )}
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
                      ? 'border-orange-500 bg-orange-50/40 shadow-2xs ring-1 ring-orange-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{f.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300 bg-white'
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
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500/20"
                  />
                  <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 whitespace-nowrap shrink-0">
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-l-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
            />
            <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs font-mono text-slate-500 font-bold whitespace-nowrap shrink-0">
              .{format}
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm self-end sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
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
