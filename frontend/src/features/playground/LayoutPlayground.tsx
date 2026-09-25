import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { SplitPane } from '../../components/layout/SplitPane';
import { Button } from '../../components/ui/Button';
import { Body, Mono } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';

export default function LayoutPlayground() {
  return (
    <PageContainer>
      <Breadcrumbs 
        items={[
          { label: 'Procurements', href: '/procurements' },
          { label: 'Transformer Procurement', href: '#' },
          { label: 'Standards Discovery' }
        ]} 
      />
      
      <PageHeader 
        eyebrow="03 — STANDARDS DISCOVERY"
        title="Transformer Procurement"
        description="Review primary and allied standards for this procurement. Validate missing coverage and update versions."
        metadata="LAST SCANNED 12 MINS AGO"
        actions={
          <>
            <Button variant="secondary">View Original Tender ↗</Button>
            <Button>Approve Selection</Button>
          </>
        }
      />

      <div className="mt-12 flex flex-col gap-12">
        <section>
          <SectionHeader 
            number="01 — REQUIREMENT"
            title="WHAT WE UNDERSTOOD"
          />
          <SplitPane 
            primary={
              <div className="p-6 border border-border bg-surface rounded min-h-[300px]">
                <Body className="mb-4">Extracted technical parameters from the tender text.</Body>
                <div className="flex gap-2">
                  <Badge variant="accent">33kV / 11kV</Badge>
                  <Badge variant="accent">10 MVA</Badge>
                </div>
              </div>
            }
            secondary={
              <div className="p-6 border border-border bg-surface rounded min-h-[300px]">
                <Body className="mb-4">Original tender clause text for comparison.</Body>
                <Mono className="text-sm">
                  "The power transformer shall be 33/11kV, 10 MVA rating..."
                </Mono>
              </div>
            }
          />
        </section>

        <section>
          <SectionHeader 
            number="02 — DISCOVERY"
            title="APPLICABLE STANDARDS"
          />
          <div className="p-6 border border-border bg-surface rounded min-h-[200px]">
            <Body>Placeholder for standards table.</Body>
          </div>
        </section>
      </div>

    </PageContainer>
  );
}
