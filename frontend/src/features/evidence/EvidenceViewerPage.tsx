import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { VerificationStatus, ConfidenceIndicator } from '../../components/product/Evidence';
import { useStandIQ } from '../../stores/standiq.store';

interface EvidenceItem {
  id: string;
  standardId: string;
  clause: string;
  page: number;
  excerpt: string;
  verificationStatus: 'VERIFIED' | 'REVIEW' | 'REJECTED';
  evidenceType: 'DIRECT_REQUIREMENT' | 'TECHNICAL_CLAUSE' | 'QCO_STANDARD';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  severity?: string;
}

export default function EvidenceViewerPage() {
  const navigate = useNavigate();
  const { activeDocument } = useStandIQ();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Derive evidence items strictly from real activeDocument requirements and clauses
  const evidenceList: EvidenceItem[] = (activeDocument?.requirements || []).map((req, idx) => ({
    id: `ev-${req.id || idx + 1}`,
    standardId: req.recommendedStandard || activeDocument?.tenderNumber || 'Extracted Clause',
    clause: req.clauseNumber || `1.${idx + 1}`,
    page: 1,
    excerpt: req.requirementText,
    verificationStatus: req.status === 'accepted' ? 'VERIFIED' : 'REVIEW',
    evidenceType: req.isMandatoryQco ? 'QCO_STANDARD' : 'DIRECT_REQUIREMENT',
    confidence: req.severity === 'High' ? 'HIGH' : req.severity === 'Medium' ? 'MEDIUM' : 'LOW',
    category: req.category || 'Technical Requirement',
    severity: req.severity || 'Medium'
  }));

  const selectedEvidence = evidenceList[selectedIndex] || null;

  const handlePrev = () => setSelectedIndex(i => Math.max(0, i - 1));
  const handleNext = () => setSelectedIndex(i => Math.min(evidenceList.length - 1, i + 1));

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" className="px-0 text-text-muted hover:text-text-primary uppercase text-xs tracking-wider" onClick={() => navigate('/review')}>
          Review / Evidence
        </Button>
      </div>

      <PageHeader
        eyebrow="EVIDENCE"
        title="EVIDENCE VIEWER"
        description="Inspect source passages supporting standards, requirements and recommendation decisions."
      />

      {evidenceList.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center rounded-sm max-w-lg mx-auto space-y-4 my-8">
          <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mx-auto text-text-muted">
            <FileText className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">No Evidence Data Available</h3>
            <p className="text-xs text-text-muted">
              {activeDocument 
                ? `No extracted clause evidence found in "${activeDocument.fileName}".` 
                : 'Upload and analyze a tender document in Review & Verify to inspect extracted source passages and standard citations.'}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/review')} className="mx-auto flex items-center gap-1.5">
            <span>Go to Review & Verify</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <SplitPane
          primary={
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-surface p-2 border border-border rounded-sm">
                <Button variant="ghost" size="sm" onClick={handlePrev} disabled={selectedIndex === 0}>← PREVIOUS</Button>
                <Mono className="text-sm">EVIDENCE {selectedIndex + 1} OF {evidenceList.length}</Mono>
                <Button variant="ghost" size="sm" onClick={handleNext} disabled={selectedIndex === evidenceList.length - 1}>NEXT →</Button>
              </div>

              <div className="flex flex-col gap-4">
                {evidenceList.map((ev, idx) => (
                  <div 
                    key={ev.id} 
                    className={`p-4 border rounded-sm cursor-pointer transition-colors ${idx === selectedIndex ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-surface-elevated'}`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Mono className="text-sm font-bold text-text-primary">{ev.standardId}</Mono>
                      <Badge variant={ev.verificationStatus === 'VERIFIED' ? 'success' : ev.verificationStatus === 'REVIEW' ? 'warning' : 'danger'}>{ev.verificationStatus}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <Mono>CLAUSE {ev.clause}</Mono>
                      <Mono>PAGE {ev.page}</Mono>
                      <Badge variant="neutral" className="py-0">{ev.evidenceType.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          secondary={
            selectedEvidence ? (
              <div className="flex flex-col gap-8 sticky top-8">
                <div className="border border-border bg-surface flex flex-col p-6 rounded-sm min-h-[220px] relative">
                  <div className="bg-background px-2.5 py-1 border border-border inline-flex items-center gap-2 mb-4 self-start">
                    <Mono className="text-xs font-bold text-text-primary">SOURCE PASSAGE | CLAUSE {selectedEvidence.clause}</Mono>
                  </div>
                  
                  <div className="bg-background border border-border/80 p-5 rounded-sm text-xs font-mono text-text-primary leading-relaxed">
                    <p className="border-l-2 border-accent pl-3 text-text-primary font-medium">
                      &quot;{selectedEvidence.excerpt}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
                  <SectionHeader number="01" title="SOURCE" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Meta>TARGET STANDARD / CODE</Meta>
                      <Mono className="text-sm font-bold text-text-primary">{selectedEvidence.standardId}</Mono>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Meta>CLAUSE NUMBER</Meta>
                      <Mono className="text-sm">{selectedEvidence.clause}</Mono>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Meta>DOCUMENT</Meta>
                      <Mono className="text-sm truncate">{activeDocument?.fileName || 'Active Document'}</Mono>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Meta>EVIDENCE TYPE</Meta>
                      <Mono className="text-sm">{selectedEvidence.evidenceType.replace('_', ' ')}</Mono>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-6">
                    <SectionHeader number="02" title="VERIFICATION" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <Meta>STATUS</Meta>
                      <VerificationStatus status={selectedEvidence.verificationStatus} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Meta>CONFIDENCE</Meta>
                      <ConfidenceIndicator level={selectedEvidence.confidence} score={selectedEvidence.confidence === 'HIGH' ? 0.95 : selectedEvidence.confidence === 'MEDIUM' ? 0.75 : 0.45} />
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-6">
                    <SectionHeader number="03" title="EXCERPT" />
                  </div>
                  <div className="p-4 border-l-2 border-accent bg-surface-elevated rounded-r-sm">
                    <Body className="text-sm italic">{selectedEvidence.excerpt}</Body>
                  </div>

                  <div className="mt-4 border-t border-border pt-6">
                    <SectionHeader number="04" title="SPECIFICATION CONTEXT" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Meta>CATEGORY & SEVERITY</Meta>
                      <Body className="text-sm text-text-secondary">
                        {selectedEvidence.category} — Priority Severity: {selectedEvidence.severity}
                      </Body>
                    </div>
                    {activeDocument?.department && (
                      <div className="flex flex-col gap-1 mt-1">
                        <Meta>PROCURING AUTHORITY</Meta>
                        <Body className="text-xs font-mono text-text-muted">
                          {activeDocument.department}
                        </Body>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null
          }
        />
      )}
    </PageContainer>
  );
}
