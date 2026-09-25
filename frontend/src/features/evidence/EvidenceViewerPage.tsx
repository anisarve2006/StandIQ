import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { VerificationStatus, ConfidenceIndicator } from '../../components/product/Evidence';
import { mockEvidence } from './evidence.data';

export default function EvidenceViewerPage() {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const selectedEvidence = mockEvidence[selectedIndex];

  const handlePrev = () => setSelectedIndex(i => Math.max(0, i - 1));
  const handleNext = () => setSelectedIndex(i => Math.min(mockEvidence.length - 1, i + 1));

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

      <SplitPane
        primary={
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-surface p-2 border border-border rounded-sm">
              <Button variant="ghost" size="sm" onClick={handlePrev} disabled={selectedIndex === 0}>← PREVIOUS</Button>
              <Mono className="text-sm">EVIDENCE {selectedIndex + 1} OF {mockEvidence.length}</Mono>
              <Button variant="ghost" size="sm" onClick={handleNext} disabled={selectedIndex === mockEvidence.length - 1}>NEXT →</Button>
            </div>

            <div className="flex flex-col gap-4">
              {mockEvidence.map((ev, idx) => (
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
          <div className="flex flex-col gap-8 sticky top-8">
            <div className="border border-border bg-surface flex flex-col items-center justify-center p-8 rounded-sm min-h-[400px] relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-background px-2 py-1 border border-border">
                <Mono className="text-xs">SOURCE DOCUMENT: {selectedEvidence.standardId} | PAGE {selectedEvidence.page}</Mono>
              </div>
              
              {/* Mock PDF Viewer Area */}
              <div className="w-full max-w-md aspect-[1/1.4] bg-background border border-border/50 relative shadow-sm mx-auto flex flex-col items-center justify-center">
                <Mono className="text-border text-6xl opacity-20 select-none">DEMO DOCUMENT PAGE</Mono>
                <div className="absolute top-1/4 left-1/4">
                  <Mono className="text-border opacity-50">Clause {selectedEvidence.clause}</Mono>
                </div>
                
                {/* Highlight bounding box */}
                <div 
                  className="absolute bg-accent/20 border border-accent/50"
                  style={{
                    left: `${selectedEvidence.boundingBox.x}%`,
                    top: `${selectedEvidence.boundingBox.y}%`,
                    width: `${selectedEvidence.boundingBox.width}%`,
                    height: `${selectedEvidence.boundingBox.height}%`
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-accent text-background px-1 py-0.5 whitespace-nowrap">
                    <Mono className="text-[10px] font-bold">THIS IS THE EVIDENCE</Mono>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-6 border border-border bg-surface rounded-sm">
              <SectionHeader number="01" title="SOURCE" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Meta>STANDARD</Meta>
                  <Mono className="text-sm font-bold text-text-primary">{selectedEvidence.standardId}</Mono>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>CLAUSE</Meta>
                  <Mono className="text-sm">{selectedEvidence.clause}</Mono>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>PAGE</Meta>
                  <Mono className="text-sm">{selectedEvidence.page}</Mono>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>TYPE</Meta>
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
                <SectionHeader number="04" title="RECOMMENDATION CONTEXT" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Meta>WHY THIS EVIDENCE MATTERS</Meta>
                  <Body className="text-sm text-text-secondary">
                    The evidence is associated with the requirement used to recommend this standard for the selected procurement context.
                  </Body>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <Meta>MATCH SIGNALS</Meta>
                  <ul className="list-disc pl-4 text-sm font-mono text-text-primary">
                    <li>Electrical equipment</li>
                    <li>Distribution application</li>
                    <li>Safety requirement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </PageContainer>
  );
}
