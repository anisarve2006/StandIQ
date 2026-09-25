import { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockExportOptions, mockPackageContent } from './export.data';

export default function ExportPage() {
  const [queuedExport, setQueuedExport] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setQueuedExport(format);
    setTimeout(() => setQueuedExport(null), 3000);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="EXPORT"
        title="PROCUREMENT SPECIFICATION PACKAGE"
        description="Prepare the approved specification and supporting evidence for downstream procurement workflows."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        {queuedExport && (
          <section className="flex flex-col gap-6">
            <div className="p-8 border-l-4 border-accent bg-surface-elevated rounded-r-sm flex flex-col gap-2 shadow-lg">
              <Mono className="text-xl font-bold text-accent">EXPORT QUEUED: {queuedExport}</Mono>
              <Body className="text-sm">File generation will be connected to the backend export service later.</Body>
              <Meta className="mt-2 opacity-50">Demo Behavior</Meta>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <section className="flex flex-col gap-6 lg:col-span-2">
            <SectionHeader number="01" title="OUTPUT FORMATS" />
            <div className="flex flex-col gap-4">
              {mockExportOptions.map(opt => (
                <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-border bg-surface rounded-sm gap-6">
                  <div className="flex flex-col gap-1">
                    <Mono className="text-lg font-bold text-text-primary">{opt.format}</Mono>
                    <Body className="text-sm">{opt.description}</Body>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <Badge variant="success">{opt.status}</Badge>
                    <Button onClick={() => handleExport(opt.format)} disabled={!!queuedExport}>
                      {queuedExport === opt.format ? 'QUEUING...' : `EXPORT ${opt.format}`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <SectionHeader number="02" title="PACKAGE CONTENT" />
            <div className="flex flex-col border border-border bg-surface rounded-sm p-4 gap-4">
              {mockPackageContent.map(item => (
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
