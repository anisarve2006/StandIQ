import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { mockDiffFindings } from './tender-diff.data';
import type { DiffFinding } from './tender-diff.types';

export default function TenderDiffPage() {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<DiffFinding[]>(mockDiffFindings);
  const [filter, setFilter] = useState('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = findings.filter(f => {
    if (filter === 'ALL') return true;
    if (['OPEN', 'ACCEPTED', 'REJECTED'].includes(filter)) return f.status === filter;
    if (['HIGH', 'MEDIUM', 'LOW'].includes(filter)) return f.severity === filter;
    return f.issueType === filter;
  });

  const selectedFinding = filtered[selectedIndex] || filtered[0];

  const handlePrev = () => setSelectedIndex(i => Math.max(0, i - 1));
  const handleNext = () => setSelectedIndex(i => Math.min(filtered.length - 1, i + 1));

  const updateStatus = (id: string, status: 'ACCEPTED' | 'REJECTED', reason?: string) => {
    setFindings(findings.map(f => f.id === id ? { ...f, status, rejectionReason: reason } : f));
  };

  const handleReject = () => {
    if (selectedFinding) {
      updateStatus(selectedFinding.id, 'REJECTED', rejectReason);
    }
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const openIssues = findings.filter(f => f.status === 'OPEN').length;
  const highImpact = findings.filter(f => f.severity === 'HIGH').length;
  const fixesAccepted = findings.filter(f => f.status === 'ACCEPTED').length;
  const remaining = openIssues;

  // Change Summary
  const currentOutdated = findings.filter(f => f.issueType === 'STALE_EDITION').length;
  const currentMissing = findings.filter(f => f.issueType === 'MISSING_STANDARD' || f.issueType === 'CERT_REQUIREMENT_MISSING').length;
  const currentScope = findings.filter(f => f.issueType === 'SCOPE_MISMATCH').length;

  const afterOutdated = findings.filter(f => f.issueType === 'STALE_EDITION' && f.status !== 'ACCEPTED').length;
  const afterMissing = findings.filter(f => (f.issueType === 'MISSING_STANDARD' || f.issueType === 'CERT_REQUIREMENT_MISSING') && f.status !== 'ACCEPTED').length;
  const afterScope = findings.filter(f => f.issueType === 'SCOPE_MISMATCH' && f.status !== 'ACCEPTED').length;

  return (
    <PageContainer>
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" className="px-0 text-text-muted hover:text-text-primary uppercase text-xs tracking-wider" onClick={() => navigate('/tender-health')}>
          ← BACK TO TENDER HEALTH
        </Button>
        <Button onClick={() => setApplyDialogOpen(true)}>APPLY ACCEPTED FIXES</Button>
      </div>

      <PageHeader
        eyebrow="TENDER DIFF / FIX"
        title="SPECIFICATION CORRECTION WORKSPACE"
        description="Compare the current tender specification against identified standards and recommended corrections."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value={openIssues.toString().padStart(2, '0')} label="OPEN ISSUES" />
          <Metric value={highImpact.toString().padStart(2, '0')} label="HIGH IMPACT" />
          <Metric value={fixesAccepted.toString().padStart(2, '0')} label="FIXES ACCEPTED" />
          <Metric value={remaining.toString().padStart(2, '0')} label="REMAINING" />
        </section>

        <section className="flex gap-4 p-4 border border-border bg-surface rounded-sm">
          <Select 
            label="FILTER FINDINGS" 
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedIndex(0);
            }}
            options={[
              {value: 'ALL', label: 'ALL'},
              {value: 'OPEN', label: 'OPEN'},
              {value: 'ACCEPTED', label: 'ACCEPTED'},
              {value: 'REJECTED', label: 'REJECTED'},
              {value: 'HIGH', label: 'HIGH SEVERITY'},
              {value: 'MEDIUM', label: 'MEDIUM SEVERITY'},
              {value: 'LOW', label: 'LOW SEVERITY'}
            ]} 
          />
        </section>

        <SplitPane
          primary={
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-surface p-2 border border-border rounded-sm">
                <Button variant="ghost" size="sm" onClick={handlePrev} disabled={selectedIndex === 0}>← PREVIOUS ISSUE</Button>
                <Mono className="text-sm">ISSUE {filtered.length > 0 ? selectedIndex + 1 : 0} OF {filtered.length}</Mono>
                <Button variant="ghost" size="sm" onClick={handleNext} disabled={selectedIndex >= filtered.length - 1}>NEXT ISSUE →</Button>
              </div>

              {selectedFinding ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CURRENT TENDER */}
                  <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
                    <SectionHeader number="" title="CURRENT TENDER" />
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Meta>REQUIREMENT</Meta>
                        <Body className="text-sm font-medium text-text-primary">{selectedFinding.requirement}</Body>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Meta>CURRENT REFERENCE</Meta>
                        <Mono className="text-sm text-text-primary">{selectedFinding.currentReference}</Mono>
                      </div>

                      <div className="flex flex-col gap-1 pt-4 border-t border-border">
                        <Meta>CURRENT TEXT</Meta>
                        <Body className="text-sm italic">{selectedFinding.currentText}</Body>
                      </div>

                      <div className="flex flex-col gap-2 pt-4 border-t border-border">
                        <Meta>STATUS</Meta>
                        <div className="flex items-center gap-2">
                          <StatusIndicator status="ATTENTION" />
                          <Badge variant="danger">{selectedFinding.issueType.replace(/_/g, ' ')}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RECOMMENDED FIX */}
                  <div className="flex flex-col gap-6 p-6 border border-accent bg-accent/5 rounded-sm relative">
                    <SectionHeader number="" title="RECOMMENDED FIX" />
                    
                    {selectedFinding.status === 'ACCEPTED' && (
                      <div className="absolute top-4 right-4 bg-success text-background px-2 py-1">
                        <Mono className="text-xs font-bold">ACCEPTED</Mono>
                      </div>
                    )}
                    {selectedFinding.status === 'REJECTED' && (
                      <div className="absolute top-4 right-4 bg-danger text-background px-2 py-1">
                        <Mono className="text-xs font-bold">REJECTED</Mono>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <Meta>RECOMMENDED REFERENCE</Meta>
                        <Mono className="text-sm text-text-primary font-bold">{selectedFinding.recommendedReference}</Mono>
                      </div>

                      <div className="flex flex-col gap-1 pt-4 border-t border-accent/20">
                        <Meta>PROPOSED REQUIREMENT</Meta>
                        <Body className="text-sm">{selectedFinding.recommendedText}</Body>
                      </div>

                      <div className="flex flex-col gap-1 pt-4 border-t border-accent/20">
                        <Meta>REASON</Meta>
                        <Body className="text-sm text-text-muted">{selectedFinding.issueDescription}</Body>
                        <Meta className="mt-1 opacity-50">DEMO ANALYSIS</Meta>
                      </div>
                      
                      {selectedFinding.status === 'REJECTED' && selectedFinding.rejectionReason && (
                        <div className="flex flex-col gap-1 pt-4 border-t border-danger/20">
                          <Meta className="text-danger">REJECTION REASON</Meta>
                          <Body className="text-sm">{selectedFinding.rejectionReason}</Body>
                        </div>
                      )}

                      <div className="flex gap-4 pt-6 mt-auto border-t border-accent/20">
                        <Button 
                          variant={selectedFinding.status === 'ACCEPTED' ? 'ghost' : 'primary'} 
                          onClick={() => updateStatus(selectedFinding.id, 'ACCEPTED')}
                          disabled={selectedFinding.status === 'ACCEPTED'}
                        >
                          {selectedFinding.status === 'ACCEPTED' ? 'ACCEPTED' : 'ACCEPT FIX'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-danger hover:text-danger hover:bg-danger/10"
                          onClick={() => setRejectDialogOpen(true)}
                          disabled={selectedFinding.status === 'REJECTED'}
                        >
                          {selectedFinding.status === 'REJECTED' ? 'REJECTED' : 'REJECT FIX'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border border-border bg-surface text-text-muted">
                  <Mono>NO FINDINGS MATCHING FILTER</Mono>
                </div>
              )}
            </div>
          }
          secondary={
            <div className="flex flex-col gap-6 sticky top-8">
              <SectionHeader number="03" title="CHANGE SUMMARY" />
              <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <Meta>CURRENT</Meta>
                  <ul className="flex flex-col gap-2">
                    <li className="flex justify-between items-center">
                      <Body className="text-sm">Outdated references</Body>
                      <Mono className="text-sm text-text-primary">{currentOutdated}</Mono>
                    </li>
                    <li className="flex justify-between items-center">
                      <Body className="text-sm">Missing references</Body>
                      <Mono className="text-sm text-text-primary">{currentMissing}</Mono>
                    </li>
                    <li className="flex justify-between items-center">
                      <Body className="text-sm">Scope mismatch</Body>
                      <Mono className="text-sm text-text-primary">{currentScope}</Mono>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col gap-4 pt-6 border-t border-border">
                  <Meta>AFTER ACCEPTED FIXES</Meta>
                  <ul className="flex flex-col gap-2">
                    <li className="flex justify-between items-center">
                      <Body className="text-sm">Outdated references</Body>
                      <Mono className={`text-sm ${afterOutdated === 0 ? 'text-success' : 'text-text-primary'}`}>{afterOutdated}</Mono>
                    </li>
                    <li className="flex justify-between items-center">
                      <Body className="text-sm">Missing references</Body>
                      <Mono className={`text-sm ${afterMissing === 0 ? 'text-success' : 'text-text-primary'}`}>{afterMissing}</Mono>
                    </li>
                    <li className="flex justify-between items-center">
                      <Body className="text-sm">Scope mismatch</Body>
                      <Mono className={`text-sm ${afterScope === 0 ? 'text-success' : 'text-text-primary'}`}>{afterScope}</Mono>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <Dialog
        isOpen={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        title="REJECT FIX"
        footer={<><Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>CANCEL</Button><Button onClick={handleReject}>CONFIRM REJECTION</Button></>}
      >
        <div className="py-4">
          <label className="flex flex-col gap-2">
            <Meta>REJECTION REASON</Meta>
            <textarea 
              className="bg-background border border-border p-3 text-sm text-text-primary focus:outline-none focus:border-accent min-h-[100px] resize-none"
              placeholder="Reason for not applying this proposed correction."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </label>
        </div>
      </Dialog>

      <Dialog
        isOpen={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        title="APPLY ACCEPTED FIXES"
        footer={<><Button variant="ghost" onClick={() => setApplyDialogOpen(false)}>CANCEL</Button><Button onClick={() => setApplyDialogOpen(false)}>CONFIRM</Button></>}
      >
        <div className="py-4 flex flex-col gap-4">
          <Body>{fixesAccepted.toString().padStart(2, '0')} corrections are marked for application.</Body>
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-sm">
            <Body className="text-sm text-warning">This demo will update the local review state only.</Body>
          </div>
        </div>
      </Dialog>
    </PageContainer>
  );
}
