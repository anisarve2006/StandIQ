import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { DataList } from '../../components/ui/DataList';
import { VersionTimeline, RelationshipItem, CertificationIndicator } from '../../components/product/Standards';
import { useStandard, useStandardVersions } from '../../hooks/useStandards';
import { LoadingState } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export default function StandardDetailPage() {
  const navigate = useNavigate();
  const { standardId } = useParams();

  const { data: stdData, isLoading, error } = useStandard(standardId || '');
  const { data: versionsData } = useStandardVersions(standardId || '', { enabled: !!standardId });

  if (isLoading) return <LoadingState message={`Loading standard ${standardId}...`} />;
  if (error || !stdData) return <PageContainer><ErrorState title="NOT FOUND" description="Standard could not be loaded." /></PageContainer>;

  const standard = stdData.standard;
  const alliedGraph = stdData.allied_graph || [];
  const certification = stdData.certification;

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" className="px-0 text-text-muted hover:text-text-primary uppercase text-xs tracking-wider" onClick={() => navigate('/standards')}>
          ← BACK TO STANDARDS
        </Button>
      </div>
      
      <PageHeader
        eyebrow={`${standard.raw_id || standard.number}`}
        title={(standard.title_en || standard.title || '').toUpperCase()}
        description={standard.status}
      />

      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>EDITION</Meta>
        <Mono className="text-sm">{standard.year}</Mono>
        <span className="text-border">|</span>
        <Meta>STATUS</Meta>
        <Badge variant={standard.status === 'CURRENT' ? 'success' : 'neutral'}>{standard.status || 'CURRENT'}</Badge>
        <span className="text-border">|</span>
        <Meta>PUBLICATION</Meta>
        <Mono className="text-sm">{standard.publication_date || 'UNKNOWN'}</Mono>
        <span className="text-border">|</span>
        <Meta>CATEGORY</Meta>
        <Body className="text-sm">{standard.committee || 'N/A'}</Body>
      </div>

      <div className="flex flex-col gap-12 pb-24">
        
        <div className="flex gap-4 border-b border-border pb-8">
          <Button>ADD TO BASKET</Button>
          <Button variant="secondary" onClick={() => navigate('/standards')}>OPEN IN DISCOVERY</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 flex flex-col gap-12">
            
            <section className="flex flex-col gap-6">
              <SectionHeader number="01" title="OVERVIEW" />
              <div className="p-6 border border-border bg-surface rounded-sm">
                <DataList 
                  items={[
                    { label: 'TITLE', value: standard.title_en || standard.title },
                    { label: 'STATUS', value: standard.status || 'CURRENT' },
                    { label: 'EDITION', value: standard.year },
                    { label: 'PUBLICATION DATE', value: standard.publication_date || 'UNKNOWN' },
                    { label: 'COMMITTEE', value: standard.committee || 'UNKNOWN' }
                  ]}
                />
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="02" title="SCOPE" />
              <div className="p-6 border border-border bg-surface rounded-sm">
                <Body className="text-sm whitespace-pre-line leading-relaxed">
                  {standard.scope || 'Scope not provided for this standard.'}
                </Body>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="05" title="KEY REQUIREMENTS" />
              <EmptyState title="NO EXTRACTED REQUIREMENTS" description="Detailed clause-level requirements extraction is not available natively in this lookup." />
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="06" title="EVIDENCE" />
              <div className="flex flex-col gap-6">
                <EmptyState title="NO SPECIFIC EVIDENCE" description="Evidence is provided during procurement recommendation workflow." />
              </div>
            </section>

          </div>

          <div className="flex flex-col gap-12">
            
            <section className="flex flex-col gap-6">
              <SectionHeader number="03" title="CERTIFICATION" />
              <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Meta>REGULATORY INDICATOR</Meta>
                  <CertificationIndicator type={certification?.status === 'MANDATORY' ? 'REQUIRED' : 'VOLUNTARY'} />
                </div>
                {certification?.orders?.length > 0 && (
                  <div className="flex flex-col gap-1 pt-4 border-t border-border">
                    <Meta>QUALITY CONTROL ORDERS</Meta>
                    <Body className="text-sm text-text-secondary">
                      {certification.orders.map((o: any) => o.title).join(', ')}
                    </Body>
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="04" title="VERSION HISTORY" />
              <div className="p-6 border border-border bg-surface rounded-sm">
                {!versionsData?.version_info ? (
                  <VersionTimeline 
                    versions={[
                      { date: standard.year, status: standard.status || 'CURRENT', label: `${standard.raw_id || standard.number}`, isCurrent: true },
                    ]}
                  />
                ) : (
                  <VersionTimeline 
                    versions={[
                      {
                        date: versionsData.version_info.version || standard.year,
                        status: versionsData.version_info.status as any,
                        label: standard.raw_id || standard.number,
                        isCurrent: versionsData.version_info.status === 'CURRENT'
                      }
                    ]}
                  />
                )}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="07" title="RELATED STANDARDS" />
              <div className="flex flex-col gap-4">
                {alliedGraph?.length === 0 && <Body className="text-text-muted text-sm">No allied standards found.</Body>}
                {alliedGraph?.map((rel: any, i: number) => (
                  <RelationshipItem 
                    key={i}
                    type={rel.relationship_type || 'RELATES_TO'}
                    id={rel.target_id}
                    description={rel.context || `Related standard`}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="08" title="PROCUREMENT RELEVANCE" />
              <EmptyState title="NO ACTIVE PROCUREMENT SESSION" description="Access this standard through a procurement recommendation to see contextual relevance." />
            </section>

          </div>

        </div>
      </div>
    </PageContainer>
  );
}
