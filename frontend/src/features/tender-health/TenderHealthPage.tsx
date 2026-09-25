import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Select } from '../../components/ui/Select';
import { FindingRow, RequirementRow } from '../../components/product/Tender';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { EvidenceCitation } from '../../components/product/Evidence';
import { mockFindings, mockCoverage, mockMissing, mockConflicts } from './tender-health.data';
import type { TenderFinding } from './tender-health.types';

export default function TenderHealthPage() {
  const navigate = useNavigate();
  const [selectedFinding, setSelectedFinding] = useState<TenderFinding | null>(null);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="TENDER HEALTH"
        title="SPECIFICATION DIAGNOSTICS"
        description="Identify outdated standards, missing requirements, scope mismatches, certification gaps and conflicts."
      />
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>PROCUREMENT</Meta>
        <Body className="text-sm font-medium">Electrical Distribution Panel</Body>
        <span className="text-border">|</span>
        <Meta>LAST ANALYZED</Meta>
        <Mono className="text-sm">DEMO · 24 SEP 2026</Mono>
      </div>

      <div className="flex flex-col gap-12 pb-24">
        
        {/* HEALTH SUMMARY */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value="07" label="FINDINGS" />
          <Metric value="03" label="HIGH PRIORITY" />
          <Metric value="02" label="MEDIUM" />
          <Metric value="02" label="INFORMATIONAL" />
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
            {mockFindings.map((finding) => (
              <FindingRow 
                key={finding.id}
                status={finding.type}
                title={finding.standardId}
                description={finding.description}
                actionLabel="REVIEW"
                onAction={() => setSelectedFinding(finding)}
              />
            ))}
          </div>
        </section>

        {/* REQUIREMENT COVERAGE */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="02" title="REQUIREMENT COVERAGE" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>REQUIREMENT</TableHead>
                <TableHead>COVERAGE</TableHead>
                <TableHead>STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {mockCoverage.map((c, i) => (
                <TableRow key={i}>
                  <TableCell><Body className="text-sm">{c.requirement}</Body></TableCell>
                  <TableCell><Mono className="text-sm">{c.coverage}</Mono></TableCell>
                  <TableCell><StatusIndicator status={c.status} /></TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </section>

        {/* MISSING REQUIREMENTS */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="03" title="MISSING REQUIREMENTS" />
          <div className="flex flex-col border border-border rounded-sm bg-surface">
            {mockMissing.map((m, i) => (
              <RequirementRow 
                key={i}
                index={i + 1}
                parameter={m.parameter}
                value={m.description}
                status={m.status}
              />
            ))}
          </div>
        </section>

        {/* CROSS-ITEM CONFLICTS */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="04" title="CROSS-ITEM CONFLICTS" />
          <div className="flex flex-col gap-4">
            {mockConflicts.map((c) => (
              <div key={c.id} className="p-4 border-l-2 border-warning bg-surface flex flex-col gap-2 rounded-r-sm">
                <Meta className="text-warning">CONFLICT</Meta>
                <Body className="text-sm whitespace-pre-line">{c.description}</Body>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-border">
          <Button variant="secondary" onClick={() => navigate('/tender-diff')}>OPEN DIFF / FIX →</Button>
          <Button onClick={() => navigate('/review')}>CONTINUE TO REVIEW →</Button>
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
              <Meta>{selectedFinding.type}</Meta>
              <Mono className="text-lg font-bold text-text-primary mt-1">{selectedFinding.standardId}</Mono>
            </div>
            
            {selectedFinding.currentVersion && (
              <div className="flex flex-col gap-1 p-3 border border-border bg-surface-elevated rounded-sm">
                <Meta>CURRENT VERSION</Meta>
                <Mono className="text-sm">{selectedFinding.currentVersion}</Mono>
              </div>
            )}

            {selectedFinding.issue && (
              <div className="flex flex-col gap-1">
                <Meta>ISSUE</Meta>
                <Body className="text-sm">{selectedFinding.issue}</Body>
              </div>
            )}

            {selectedFinding.evidence && (
              <div className="flex flex-col gap-2">
                <Meta>EVIDENCE</Meta>
                <EvidenceCitation 
                  id={selectedFinding.evidence.id}
                  year={selectedFinding.evidence.year}
                  clause={selectedFinding.evidence.clause}
                  page={selectedFinding.evidence.page}
                />
              </div>
            )}

            {selectedFinding.recommendedAction && (
              <div className="flex flex-col gap-2 p-4 border-l-2 border-accent bg-surface rounded-r-sm mt-4">
                <Meta>RECOMMENDED ACTION</Meta>
                <Body className="text-sm">{selectedFinding.recommendedAction}</Body>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
