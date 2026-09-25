import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Select } from '../../components/ui/Select';
import { FindingRow } from '../../components/product/Tender';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { useSearchParams } from 'react-router-dom';
import { useGetSession } from '../../hooks/useProcurement';
import { LoadingState } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export default function TenderHealthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data: sessionData, isLoading, error } = useGetSession(sessionId);
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);

  if (isLoading) return <LoadingState message="Analyzing tender health..." />;
  if (error || !sessionId) return <PageContainer><ErrorState title="SESSION ERROR" description="Could not load the procurement session." /></PageContainer>;

  const findings = sessionData?.tender_findings || [];
  const highPriority = findings.filter(f => f.severity === 'HIGH').length;
  const mediumPriority = findings.filter(f => f.severity === 'MEDIUM').length;
  const infoPriority = findings.filter(f => f.severity === 'LOW').length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="TENDER HEALTH"
        title="SPECIFICATION DIAGNOSTICS"
        description="Identify outdated standards, missing requirements, scope mismatches, certification gaps and conflicts."
      />
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>PROCUREMENT</Meta>
        <Body className="text-sm font-medium">{sessionData?.title || 'Procurement Session'}</Body>
        <span className="text-border">|</span>
        <Meta>LAST ANALYZED</Meta>
        <Mono className="text-sm">LIVE SESSION</Mono>
      </div>

      <div className="flex flex-col gap-12 pb-24">
        
        {/* HEALTH SUMMARY */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value={findings.length.toString().padStart(2, '0')} label="FINDINGS" />
          <Metric value={highPriority.toString().padStart(2, '0')} label="HIGH PRIORITY" />
          <Metric value={mediumPriority.toString().padStart(2, '0')} label="MEDIUM" />
          <Metric value={infoPriority.toString().padStart(2, '0')} label="INFORMATIONAL" />
        </section>

        {/* FINDINGS FILTERS */}
        <section className="flex flex-wrap gap-4 p-4 border border-border bg-surface rounded-sm">
          <Select label="PRIORITY" options={[{value:'all', label:'ALL'}, {value:'high', label:'HIGH'}, {value:'medium', label:'MEDIUM'}, {value:'info', label:'INFORMATIONAL'}]} />
          <Select label="TYPE" options={[{value:'all', label:'ALL TYPES'}, {value:'stale', label:'STALE EDITION'}, {value:'superseded', label:'SUPERSEDED'}, {value:'withdrawn', label:'WITHDRAWN'}, {value:'notfound', label:'NOT FOUND'}, {value:'wrongpart', label:'WRONG PART'}, {value:'scope', label:'SCOPE MISMATCH'}, {value:'amendment', label:'AMENDMENT NOT REFERENCED'}, {value:'cert', label:'CERTIFICATION GAP'}, {value:'conflict', label:'CONFLICT'}]} />
        </section>

        {/* FINDINGS LIST */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="01" title="FINDINGS" />
          <div className="flex flex-col gap-4">
            {findings.length === 0 && <EmptyState title="NO FINDINGS" description="No significant health issues found in this tender specification." />}
            {findings.map((finding, index) => (
              <FindingRow 
                key={index}
                status={finding.severity === 'HIGH' ? 'danger' : finding.severity === 'MEDIUM' ? 'warning' : 'neutral'}
                title={finding.category}
                description={finding.message}
                actionLabel="REVIEW"
                onAction={() => setSelectedFinding(finding)}
              />
            ))}
          </div>
        </section>

        {/* REQUIREMENT COVERAGE */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="02" title="REQUIREMENT COVERAGE" />
          <EmptyState title="NOT AVAILABLE" description="Requirement coverage metrics are currently not natively surfaced by the session endpoint." />
        </section>

        {/* MISSING REQUIREMENTS */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="03" title="MISSING REQUIREMENTS" />
          <EmptyState title="NOT AVAILABLE" description="Missing requirements are calculated dynamically in the specification builder." />
        </section>

        {/* CROSS-ITEM CONFLICTS */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="04" title="CROSS-ITEM CONFLICTS" />
          <EmptyState title="NO CONFLICTS" description="No major conflicts were reported in this session." />
        </section>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-border">
          <Button variant="secondary" onClick={() => navigate(`/tender-diff?session_id=${sessionId}`)}>OPEN DIFF / FIX →</Button>
          <Button onClick={() => navigate(`/review?session_id=${sessionId}`)}>CONTINUE TO REVIEW →</Button>
        </div>

      </div>

      {/* FINDING DETAIL DIALOG */}
      <Dialog
        isOpen={!!selectedFinding}
        onClose={() => setSelectedFinding(null)}
        title="FINDING DETAIL"
        footer={<Button onClick={() => setSelectedFinding(null)}>CLOSE</Button>}
      >
        {selectedFinding && (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-1">
              <Meta>{selectedFinding.category}</Meta>
              <Mono className="text-lg font-bold text-text-primary mt-1">{selectedFinding.severity} PRIORITY</Mono>
            </div>
            
            <div className="flex flex-col gap-1">
              <Meta>CLAUSE</Meta>
              <Body className="text-sm">{selectedFinding.clause}</Body>
            </div>

            <div className="flex flex-col gap-1">
              <Meta>ISSUE</Meta>
              <Body className="text-sm">{selectedFinding.message}</Body>
            </div>

            <div className="flex flex-col gap-2 p-4 border-l-2 border-accent bg-surface rounded-r-sm mt-4">
              <Meta>RECOMMENDED ACTION</Meta>
              <Body className="text-sm">{selectedFinding.suggested_action}</Body>
            </div>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
