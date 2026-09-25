import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { DataList } from '../../components/ui/DataList';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { VersionTimeline, RelationshipItem, CertificationIndicator } from '../../components/product/Standards';
import { EvidenceBlock, VerificationStatus } from '../../components/product/Evidence';
import { mockCandidates, mockRelationships } from './standards.data';

export default function StandardDetailPage() {
  const navigate = useNavigate();
  const { standardId } = useParams();

  const standard = mockCandidates.find(c => standardId && c.id.toLowerCase().replace(/ /g, '-') === standardId.split('-202')[0]) || mockCandidates[0];

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" className="px-0 text-text-muted hover:text-text-primary uppercase text-xs tracking-wider" onClick={() => navigate('/standards')}>
          ← BACK TO STANDARDS
        </Button>
      </div>
      
      <PageHeader
        eyebrow={`${standard.id}:${standard.year}`}
        title={standard.title.toUpperCase()}
        description={standard.status}
      />

      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>EDITION</Meta>
        <Mono className="text-sm">{standard.year}</Mono>
        <span className="text-border">|</span>
        <Meta>STATUS</Meta>
        <Badge variant={standard.status === 'CURRENT' ? 'success' : 'neutral'}>{standard.status}</Badge>
        <span className="text-border">|</span>
        <Meta>PUBLICATION</Meta>
        <Mono className="text-sm">12 SEP 2026</Mono>
        <span className="text-border">|</span>
        <Meta>CATEGORY</Meta>
        <Body className="text-sm">Electrical Equipment</Body>
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
                    { label: 'TITLE', value: standard.title },
                    { label: 'STATUS', value: standard.status },
                    { label: 'EDITION', value: standard.year },
                    { label: 'PUBLICATION DATE', value: '12 SEP 2026' }
                  ]}
                />
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="02" title="SCOPE" />
              <div className="p-6 border border-border bg-surface rounded-sm">
                <Body className="text-sm whitespace-pre-line leading-relaxed">
                  This standard specifies requirements for electrical distribution equipment used in low-voltage installations.{'\n\n'}
                  It covers construction, performance, testing and safety requirements within the defined scope.{'\n\n'}
                  [DEMO CONTENT]
                </Body>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="05" title="KEY REQUIREMENTS" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>REQUIREMENT</TableHead>
                    <TableHead>VALUE / CONDITION</TableHead>
                    <TableHead>SOURCE</TableHead>
                    <TableHead>STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody>
                  <TableRow>
                    <TableCell><Body className="text-sm">Temperature range</Body></TableCell>
                    <TableCell><Mono className="text-sm">-10°C to 50°C</Mono></TableCell>
                    <TableCell><Mono className="text-sm">Clause 5.2</Mono></TableCell>
                    <TableCell><Badge variant="success">VERIFIED</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Body className="text-sm">Ingress protection</Body></TableCell>
                    <TableCell><Mono className="text-sm">IP54</Mono></TableCell>
                    <TableCell><Mono className="text-sm">Clause 6.1</Mono></TableCell>
                    <TableCell><Badge variant="success">VERIFIED</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Body className="text-sm">Testing</Body></TableCell>
                    <TableCell><Mono className="text-sm">Dielectric test</Mono></TableCell>
                    <TableCell><Mono className="text-sm">Clause 8</Mono></TableCell>
                    <TableCell><Badge variant="warning">REVIEW</Badge></TableCell>
                  </TableRow>
                </tbody>
              </Table>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="06" title="EVIDENCE" />
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 relative">
                  <EvidenceBlock 
                    id={standard.id}
                    year={standard.year}
                    clause="5.2"
                    page="12"
                    text="Demo standard evidence demonstrating the requirement."
                    sourceLabel="DEMO STANDARD EVIDENCE"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/evidence')} className="text-accent uppercase text-xs">VIEW EVIDENCE →</Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Meta>VERIFICATION:</Meta>
                    <VerificationStatus status="VERIFIED" />
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="flex flex-col gap-12">
            
            <section className="flex flex-col gap-6">
              <SectionHeader number="03" title="CERTIFICATION" />
              <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Meta>DEMO REGULATORY INDICATOR</Meta>
                  <CertificationIndicator type={standard.certification} />
                </div>
                <div className="flex flex-col gap-1 pt-4 border-t border-border">
                  <Meta>APPLICABILITY</Meta>
                  <Badge variant="warning" className="w-fit">REVIEW REQUIRED</Badge>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="04" title="VERSION HISTORY" />
              <div className="p-6 border border-border bg-surface rounded-sm">
                <VersionTimeline 
                  versions={[
                    { date: '2026', status: 'CURRENT', label: `${standard.id}:${standard.year}`, isCurrent: true },
                    { date: '2022', status: 'SUPERSEDED', label: `${standard.id}:2022`, isCurrent: false },
                    { date: '2018', status: 'SUPERSEDED', label: `${standard.id}:2018`, isCurrent: false }
                  ]}
                />
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="07" title="RELATED STANDARDS" />
              <div className="flex flex-col gap-4">
                {mockRelationships.map(rel => (
                  <RelationshipItem 
                    key={rel.id}
                    type={rel.type}
                    id={rel.targetId}
                    description={rel.description}
                  />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="08" title="PROCUREMENT RELEVANCE" />
              <div className="p-6 border-l-2 border-accent bg-surface-elevated rounded-r-sm flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <Meta>APPLICABLE CONTEXT</Meta>
                  <Body className="text-sm font-medium">Electrical distribution equipment</Body>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>MATCH SIGNALS</Meta>
                  <ul className="list-disc pl-4 text-sm font-mono text-text-primary">
                    <li>Electrical equipment</li>
                    <li>Low-voltage application</li>
                    <li>Distribution use</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-1 pt-4 border-t border-accent/20">
                  <Meta>OPEN QUESTIONS</Meta>
                  <ul className="list-disc pl-4 text-sm text-text-muted">
                    <li>Installation environment not specified</li>
                    <li>Required rating not specified</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>

        </div>
      </div>
    </PageContainer>
  );
}
