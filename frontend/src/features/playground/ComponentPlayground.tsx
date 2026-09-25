import { useState } from 'react';
import { H1, H2, H3, Body, Small, Meta, Mono, Code } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { Divider } from '../../components/ui/Divider';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { Accordion } from '../../components/ui/Accordion';
import { DataList } from '../../components/ui/DataList';
import { Metric } from '../../components/ui/Metric';
import { Tooltip } from '../../components/ui/Tooltip';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { Skeleton, LoadingState } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Toast } from '../../components/ui/Toast';
import { StandardCard, VersionTimeline, RelationshipItem } from '../../components/product/Standards';
import { EvidenceCitation, EvidenceBlock, VerificationStatus, RecommendationReason, ExclusionReason } from '../../components/product/Evidence';
import { RequirementRow, FindingRow } from '../../components/product/Tender';
import PageContainer from '../../components/layout/PageContainer';
import { SectionHeader } from '../../components/layout/SectionHeader';

export default function ComponentPlayground() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <PageContainer>
      <div className="flex flex-col gap-16 pb-24">
        
        {/* 01 - TYPOGRAPHY */}
        <section>
          <SectionHeader number="01" title="TYPOGRAPHY" />
          <div className="flex flex-col gap-4 p-6 border border-border rounded-sm bg-surface">
            <H1>Standards Discovery</H1>
            <H2>Requirement Extraction</H2>
            <H3>Technical Parameters</H3>
            <Body>
              The system analyzes the uploaded tender document and identifies applicable Indian Standards.
              It verifies claims against the BIS catalogue and provides evidence-backed recommendations.
            </Body>
            <Small>System generated analysis. Accuracy depends on document quality.</Small>
            <div className="flex gap-4 items-center mt-4">
              <Meta>UPDATED 2 HOURS AGO</Meta>
              <Mono>IS 1234:2023</Mono>
              <Code>POST /v1/query</Code>
            </div>
          </div>
        </section>

        {/* 02 - ACTIONS */}
        <section>
          <SectionHeader number="02" title="ACTIONS" />
          <div className="flex flex-wrap gap-4 p-6 border border-border rounded-sm bg-surface items-center">
            <Button>Extract Requirements →</Button>
            <Button variant="secondary">View Evidence ↗</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Remove Standard</Button>
            <Button isLoading>Processing...</Button>
            <Button disabled>Disabled Action</Button>
            <Button size="sm">Small Action</Button>
          </div>
        </section>

        {/* 03 - FORM CONTROLS */}
        <section>
          <SectionHeader number="03" title="FORM CONTROLS" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 border border-border rounded-sm bg-surface">
            <div className="flex flex-col gap-6">
              <Input 
                label="PRODUCT DESCRIPTION" 
                placeholder="e.g. Portland Cement 43 Grade" 
                description="Enter the primary product to find standards for."
              />
              <Input 
                label="STANDARD REFERENCE" 
                error="IS Number is incorrectly formatted" 
                defaultValue="IS 456-ABC" 
              />
              <SearchInput 
                placeholder="SEARCH STANDARDS..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
            <div className="flex flex-col gap-6">
              <Select
                label="CERTIFICATION"
                options={[
                  { value: 'mandatory', label: 'Mandatory (ISI Mark)' },
                  { value: 'voluntary', label: 'Voluntary' }
                ]}
              />
              <Textarea 
                label="TECHNICAL SPECIFICATION" 
                placeholder="Paste tender requirements here..."
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* 04 - DATA DISPLAY */}
        <section>
          <SectionHeader number="04" title="DATA DISPLAY" />
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card interactive>
                <CardHeader>
                  <Mono>IS 456:2000</Mono>
                </CardHeader>
                <CardBody>
                  <Body className="text-sm font-medium text-text-primary mb-2">Plain and Reinforced Concrete - Code of Practice</Body>
                  <StatusIndicator status="CURRENT" description="Reaffirmed 2021" />
                </CardBody>
                <CardFooter className="flex justify-between items-center">
                  <Badge variant="accent">PRIMARY</Badge>
                  <Mono className="text-xs text-text-muted">VIEW ↗</Mono>
                </CardFooter>
              </Card>

              <Card>
                <CardBody className="flex flex-col gap-6">
                  <Metric value="12" label="STANDARDS IDENTIFIED" />
                  <DataList items={[
                    { label: 'STANDARD ID', value: 'IS 1234' },
                    { label: 'EDITION', value: '2025' },
                    { label: 'SOURCE', value: 'BIS CATALOGUE' }
                  ]} />
                </CardBody>
              </Card>

              <div className="flex flex-col gap-4 justify-center items-start p-6 border border-border rounded-sm bg-surface">
                <Tooltip content="Provides exact match requirements.">
                  <Badge className="cursor-help">HOVER ME</Badge>
                </Tooltip>
                <Badge variant="success">VERIFIED</Badge>
                <Badge variant="warning">REVIEW_REQUIRED</Badge>
                <Badge variant="danger">SUPERSEDED</Badge>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Standard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Match</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                <TableRow>
                  <TableCell><Mono>IS 456:2000</Mono></TableCell>
                  <TableCell><StatusIndicator status="CURRENT" /></TableCell>
                  <TableCell><Badge variant="accent">HIGH</Badge></TableCell>
                </TableRow>
                <TableRow selected>
                  <TableCell><Mono>IS 8112:2013</Mono></TableCell>
                  <TableCell><StatusIndicator status="SUPERSEDED" /></TableCell>
                  <TableCell><Badge variant="danger">CONFLICT</Badge></TableCell>
                </TableRow>
              </tbody>
            </Table>
          </div>
        </section>

        {/* 05 - NAVIGATION (TABS / ACCORDION) */}
        <section>
          <SectionHeader number="05" title="NAVIGATION" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 border border-border rounded-sm bg-surface">
              <Tabs 
                tabs={[
                  { id: 'overview', label: 'OVERVIEW', content: <Body>Overview content...</Body> },
                  { id: 'evidence', label: 'EVIDENCE', content: <Body>Evidence supporting the recommendation.</Body> },
                ]}
              />
            </div>
            <Accordion 
              items={[
                { title: 'Why is this recommended?', content: 'This standard explicitly covers the material specified in clause 4.2.' },
                { title: 'Technical Details', content: 'Supersedes IS 269:1989. Mandatory certification applies.' }
              ]}
            />
          </div>
        </section>

        {/* 06 - FEEDBACK */}
        <section>
          <SectionHeader number="06" title="FEEDBACK" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <Button onClick={() => setIsDialogOpen(true)} variant="secondary">Open Dialog</Button>
              <Dialog 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)}
                title="Verify Standard"
                description="Review the evidence below before approving this standard for the specification."
                footer={
                  <>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Approve Standard</Button>
                  </>
                }
              >
                <div className="flex flex-col gap-4">
                  <DataList items={[
                    { label: 'STANDARD', value: 'IS 456:2000' },
                    { label: 'CLAUSE', value: '5.1.1' },
                  ]} />
                  <Divider />
                  <Body>The tender requires 43 grade cement, which is covered under this primary standard.</Body>
                </div>
              </Dialog>

              <div className="flex flex-col gap-4">
                <Toast variant="info" message="ANALYSIS COMPLETE" onClose={() => {}} />
                <Toast variant="warning" message="3 OUTDATED STANDARDS DETECTED" />
                <Toast variant="error" message="TENDER PARSING FAILED" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <EmptyState 
                eyebrow="NO PROCUREMENT DATA"
                title="Workspace Empty"
                description="Upload a tender document or describe your requirements to begin."
                action={<Button>Create Procurement →</Button>}
              />
              
              <ErrorState 
                description="The BIS catalogue could not be reached."
                details="ERR_CONNECTION_REFUSED: api.bis.gov.in"
                onRetry={() => {}}
              />
              
              <div className="p-6 border border-border rounded-sm bg-surface flex flex-col gap-4">
                <LoadingState message="ANALYZING TENDER..." />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            </div>
          </div>
        </section>

        {/* 07 - PROCUREMENT COMPONENTS */}
        <section>
          <SectionHeader number="07" title="PROCUREMENT COMPONENTS" />
          <div className="flex flex-col gap-12">
            
            <div className="flex flex-col gap-4">
              <Meta>STANDARD CARDS & STATUS</Meta>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <StandardCard 
                  id="IS 1234" year="2025" status="CURRENT"
                  title="Low Voltage Electrical Switchgear"
                  description="Applies to low-voltage switchgear assemblies for use in power distribution."
                  type="PRIMARY STANDARD"
                  relevance={{ level: 'HIGH', score: 0.94 }}
                  certification="BIS PRODUCT CERTIFICATION"
                  onWhyRecommended={() => {}}
                  onViewEvidence={() => {}}
                />
                
                <div className="flex flex-col gap-4 p-6 border border-border rounded-sm bg-surface">
                  <VerificationStatus status="VERIFIED" />
                  <VerificationStatus status="PARTIALLY_VERIFIED" />
                  <VerificationStatus status="NEEDS_REVIEW" />
                  <VerificationStatus status="UNVERIFIED" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Meta>EVIDENCE</Meta>
              <EvidenceBlock 
                id="IS 1234" year="2025"
                clause="5.2" page="18"
                text="The operating voltage shall be 415 V AC for secondary distribution."
                sourceLabel="TENDER DOCUMENT"
                confidence={{ level: 'HIGH', score: 0.98 }}
                onCitationAction={() => {}}
              />
              <div className="mt-4">
                <EvidenceCitation id="IS 1234" year="2025" clause="5.2" page="18" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <Meta>RECOMMENDATION / EXCLUSION</Meta>
                <RecommendationReason 
                  matches={['Product category', 'Operating environment', 'Technical specification']}
                  evidenceCount={3}
                />
                <ExclusionReason 
                  id="IS 5678" year="2023"
                  reasonTitle="Scope mismatch"
                  description="The standard applies to industrial equipment outside the specified procurement application."
                  onViewEvidence={() => {}}
                />
              </div>

              <div className="flex flex-col gap-4">
                <Meta>RELATIONSHIPS & TIMELINE</Meta>
                <RelationshipItem 
                  type="TEST METHOD"
                  id="IS 9876 : 2024"
                  description="Testing procedure for electrical assemblies"
                  onAction={() => {}}
                />
                <div className="p-4 border border-border bg-surface rounded-sm">
                  <VersionTimeline 
                    versions={[
                      { date: '2026', status: 'CURRENT', label: 'IS 1234:2026', isCurrent: true },
                      { date: '2024', status: 'AMENDED', label: 'Amendment 2', isCurrent: false },
                      { date: '2022', status: 'SUPERSEDED', label: 'IS 1234:2022', isCurrent: false },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Meta>TENDER DIAGNOSTICS</Meta>
              <div className="flex flex-col border border-border rounded-sm">
                <RequirementRow index={1} parameter="Operating voltage" value="415 V AC" status="SPECIFIED" />
                <RequirementRow index={2} parameter="Protection rating" value="IP54" status="SPECIFIED" />
                <RequirementRow index={3} parameter="Test method" value="—" status="MISSING" />
                <RequirementRow index={4} parameter="Certification" value="—" status="UNKNOWN" />
              </div>
              <div className="mt-4">
                <FindingRow 
                  status="STALE EDITION"
                  title="IS 1234:2018"
                  description="A newer edition exists."
                  actionLabel="VIEW CURRENT VERSION"
                  onAction={() => {}}
                />
              </div>
            </div>
            
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
