import { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Mono, Body } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useExportSession } from '../../hooks/useTender';
import { useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../components/ui/ErrorState';

export default function ExportPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';

  const { mutate: exportSession, isPending } = useExportSession();
  const [queuedExport, setQueuedExport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supportedFormats = [
    { id: 'json', format: 'JSON', description: 'Raw session payload containing all entities', status: 'AVAILABLE' },
    { id: 'md', format: 'MARKDOWN', description: 'Human-readable markdown document', status: 'AVAILABLE' }
  ];

  const packageContent = [
    { id: '1', label: 'Requirements', included: true },
    { id: '2', label: 'Selected Standards', included: true },
    { id: '3', label: 'Generated Specification', included: true },
    { id: '4', label: 'Verification State', included: true }
  ];

  const handleExport = (format: string) => {
    if (!sessionId) {
      setError("No active session to export.");
      return;
    }
    setQueuedExport(format);
    setError(null);
    exportSession({ session_id: sessionId, format: format.toLowerCase() }, {
      onSuccess: (data) => {
        const blob = new Blob([data.content], { type: data.content_type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${sessionId}.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setQueuedExport(null);
      },
      onError: (err: any) => {
        setError(err.message || "Failed to export");
        setQueuedExport(null);
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="EXPORT"
        title="PROCUREMENT SPECIFICATION PACKAGE"
        description="Prepare the approved specification and supporting evidence for downstream procurement workflows."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        {error && <ErrorState title="EXPORT FAILED" description={error} />}
        
        {queuedExport && (
          <section className="flex flex-col gap-6">
            <div className="p-8 border-l-4 border-accent bg-surface-elevated rounded-r-sm flex flex-col gap-2 shadow-lg">
              <Mono className="text-xl font-bold text-accent">EXPORTING: {queuedExport}</Mono>
              <Body className="text-sm">Please wait while your file is generated and downloaded...</Body>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <section className="flex flex-col gap-6 lg:col-span-2">
            <SectionHeader number="01" title="OUTPUT FORMATS" />
            <div className="flex flex-col gap-4">
              {supportedFormats.map(opt => (
                <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-border bg-surface rounded-sm gap-6">
                  <div className="flex flex-col gap-1">
                    <Mono className="text-lg font-bold text-text-primary">{opt.format}</Mono>
                    <Body className="text-sm">{opt.description}</Body>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <Badge variant="success">{opt.status}</Badge>
                    <Button onClick={() => handleExport(opt.format)} disabled={isPending || !sessionId}>
                      {queuedExport === opt.format ? 'EXPORTING...' : `EXPORT ${opt.format}`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <SectionHeader number="02" title="PACKAGE CONTENT" />
            <div className="flex flex-col border border-border bg-surface rounded-sm p-4 gap-4">
              {packageContent.map(item => (
                <div key={item.id} className="flex items-start gap-3 border-b border-border last:border-0 pb-4 last:pb-0">
                  <Mono className="text-text-primary shrink-0 mt-0.5">{item.included ? '✓' : ' '}</Mono>
                  <Mono className="text-sm">{item.label}</Mono>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </PageContainer>
  );
}
