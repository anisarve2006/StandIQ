import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Accordion } from '../../components/ui/Accordion';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EvidenceBlock, VerificationStatus } from '../../components/product/Evidence';
import { useSearchParams } from 'react-router-dom';
import { useGetSession } from '../../hooks/useProcurement';
import { useGenerateSpecification } from '../../hooks/useTender';
import { LoadingState } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';

export default function SpecificationBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';

  const { data: sessionData, isLoading: sessionLoading, error: sessionError } = useGetSession(sessionId);
  const { mutate: generateSpec, data: generatedData, isPending: generating } = useGenerateSpecification();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  if (sessionLoading) return <LoadingState message="Loading specification builder..." />;
  if (sessionError || !sessionId) return <PageContainer><ErrorState title="SESSION ERROR" description="Could not load the procurement session." /></PageContainer>;

  const requirements = sessionData?.requirements || [];
  const totalReqs = requirements.length;
  // We don't have sourceStatus on backend Requirement model, so we fake it for demo UI or use an existing property.
  const verifiedReqs = requirements.length;
  const reviewReqs = 0;
  const missingReqs = 0;

  const handleGenerate = () => {
    generateSpec({
      requirements: sessionData?.requirements || [],
      standards: sessionData?.selected_standards || [],
      evidence: sessionData?.evidence || []
    });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="SPECIFICATION BUILDER"
        title="BUILD PROCUREMENT REQUIREMENTS"
        description="Assemble verified requirements, applicable standards, test methods and certification requirements."
      />

      <SplitPane
        primary={
          <div className="flex flex-col gap-8 pb-24">
            
            <div className="flex justify-between items-center mb-4">
              <Button onClick={() => setIsAddOpen(true)}>+ ADD REQUIREMENT</Button>
              <Button variant="primary" onClick={handleGenerate} disabled={generating}>
                {generating ? 'GENERATING...' : 'GENERATE SPECIFICATION'}
              </Button>
            </div>

            {generatedData?.specification_clause ? (
              <div className="p-6 border border-accent bg-accent/5 rounded-sm">
                <Meta className="mb-4">GENERATED SPECIFICATION</Meta>
                <Body className="text-sm whitespace-pre-line">{generatedData.specification_clause}</Body>
              </div>
            ) : (
              <Accordion items={[{
                title: 'GENERAL REQUIREMENTS',
                content: requirements.length === 0 ? (
                  <Body className="text-sm text-text-muted italic py-4">No requirements added.</Body>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    {requirements.map((req, idx) => (
                      <div key={idx} className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-sm transition-colors cursor-pointer ${selectedReq?.name === req.name ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-surface-elevated'}`} onClick={() => setSelectedReq(req)}>
                        <div className="flex flex-col gap-1">
                          <Meta>{req.category || 'GENERAL'}</Meta>
                          <Mono className="text-sm font-bold text-text-primary">{req.name}</Mono>
                          <Body className="text-sm text-text-muted">{req.source_text}</Body>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }]} className="flex flex-col gap-4" />
            )}
            
            <div className="mt-8"><SectionHeader number="08" title="CERTIFICATION" /></div>
            <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-4">
              <Mono className="text-lg font-bold">BIS PRODUCT CERTIFICATION</Mono>
              <div className="flex flex-col gap-1">
                <Meta>STATUS</Meta>
                <Badge variant="warning" className="w-fit">REVIEW REQUIRED</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <Meta>SOURCE</Meta>
                <Mono className="text-sm">IS 1234 : 2025</Mono>
              </div>
              <div className="flex flex-col gap-1 p-3 border-l-2 border-warning bg-surface-elevated rounded-r-sm mt-2">
                <Meta className="text-warning">NOTE</Meta>
                <Body className="text-sm">Confirm applicability before final approval.</Body>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button size="lg" onClick={() => navigate(`/approval?session_id=${sessionId}`)}>CONTINUE TO APPROVAL →</Button>
            </div>
          </div>
        }
        secondary={
          <div className="flex flex-col gap-6 sticky top-8">
            {/* SPECIFICATION COMPLETENESS SUMMARY */}
            <SectionHeader number="" title="SPECIFICATION STATUS" />
            <div className="p-6 border border-border bg-surface rounded-sm grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 col-span-2 mb-2 pb-4 border-b border-border">
                <Mono className="text-3xl text-text-primary">{totalReqs.toString().padStart(2, '0')}</Mono>
                <Meta>REQUIREMENTS</Meta>
              </div>
              <div className="flex flex-col gap-1">
                <Mono className="text-lg text-success">{verifiedReqs.toString().padStart(2, '0')}</Mono>
                <Meta>VERIFIED</Meta>
              </div>
              <div className="flex flex-col gap-1">
                <Mono className="text-lg text-warning">{reviewReqs.toString().padStart(2, '0')}</Mono>
                <Meta>NEEDS REVIEW</Meta>
              </div>
              <div className="flex flex-col gap-1">
                <Mono className="text-lg text-danger">{missingReqs.toString().padStart(2, '0')}</Mono>
                <Meta>MISSING</Meta>
              </div>
              <div className="flex flex-col gap-1 col-span-2 pt-4 mt-2 border-t border-border">
                <Meta>COMPLETENESS</Meta>
                <Mono className="text-sm text-warning font-bold mt-1">REVIEW REQUIRED</Mono>
              </div>
            </div>

            {/* SOURCE PANEL */}
            <div className="mt-4"><SectionHeader number="" title="SOURCE / EVIDENCE" /></div>
            {selectedReq ? (
              <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <Meta>PARAMETER</Meta>
                  <Mono className="text-sm font-bold text-text-primary">{selectedReq.parameter}</Mono>
                </div>
                
                  <>
                    <div className="flex flex-col gap-4 pt-4 border-t border-border">
                      <EvidenceBlock 
                        id={selectedReq.category || 'EVIDENCE'}
                        year="2025"
                        clause="N/A"
                        page="N/A"
                        text={selectedReq.source_text || "Requirement detail."}
                        sourceLabel="TENDER"
                      />
                    </div>
                    <div className="flex flex-col gap-1 pt-4 border-t border-border">
                      <Meta>VERIFICATION</Meta>
                      <VerificationStatus status="VERIFIED" />
                    </div>
                  </>
              </div>
            ) : (
              <div className="p-12 border border-dashed border-border bg-surface/50 rounded-sm text-center">
                <Meta className="mb-2">NO REQUIREMENT SELECTED</Meta>
                <Body className="text-sm text-text-muted">Select a requirement to view its supporting evidence.</Body>
              </div>
            )}
          </div>
        }
      />

      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="ADD REQUIREMENT"
        footer={<><Button variant="ghost" onClick={() => setIsAddOpen(false)}>CANCEL</Button><Button onClick={() => setIsAddOpen(false)}>SAVE</Button></>}
      >
        <div className="flex flex-col gap-4 py-4">
          <Select label="SECTION" options={[{ value: '1', label: 'General' }]} />
          <Input label="PARAMETER" placeholder="e.g. Operating Voltage" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="VALUE" placeholder="e.g. 415" />
            <Input label="UNIT" placeholder="e.g. V AC" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
            <Input label="STANDARD REFERENCE" placeholder="e.g. IS 1234 : 2025" />
            <Input label="CLAUSE" placeholder="e.g. 5.2" />
          </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
