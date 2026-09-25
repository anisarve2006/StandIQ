import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { StandardCard } from '../../components/product/Standards';
import { ConfidenceIndicator, EvidenceBlock } from '../../components/product/Evidence';
import { mockReviewQueue, mockChecklist } from './review.data';
import type { ReviewItem, VerificationState } from './review.types';

export default function ReviewVerifyPage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(mockReviewQueue);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<Set<string>>(new Set(['c1', 'c2', 'c3']));

  const handleStatusChange = (id: string, newStatus: VerificationState) => {
    setQueue(queue.map(q => q.id === id ? { ...q, status: newStatus } : q));
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  const handleNoteChange = (id: string, note: string) => {
    setNotes(prev => ({ ...prev, [id]: note }));
  };

  const toggleChecklist = (id: string) => {
    const newSet = new Set(checklist);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setChecklist(newSet);
  };

  const statusCounts = queue.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="REVIEW & VERIFY"
        title="EVIDENCE-BACKED STANDARD REVIEW"
        description="Verify recommended standards, supporting evidence, versions, applicability and certification requirements."
      />
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>PROCUREMENT</Meta>
        <Body className="text-sm font-medium">Electrical Distribution Panel</Body>
        <span className="text-border">|</span>
        <Meta>STANDARDS</Meta>
        <Mono className="text-sm">07 CANDIDATES</Mono>
        <span className="text-border">|</span>
        <Meta>FINDINGS</Meta>
        <Mono className="text-sm">07</Mono>
      </div>

      <div className="flex flex-col gap-12 pb-24">
        
        {/* SUMMARY */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value={queue.length.toString().padStart(2, '0')} label="RECOMMENDED" />
          <Metric value={(statusCounts['VERIFIED'] || 0).toString().padStart(2, '0')} label="VERIFIED" />
          <Metric value={(statusCounts['NEEDS REVIEW'] || 0).toString().padStart(2, '0')} label="NEEDS REVIEW" />
          <Metric value={(statusCounts['REJECTED'] || 0).toString().padStart(2, '0')} label="REJECTED" />
        </section>

        {/* REVIEW QUEUE */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="01" title="REVIEW QUEUE" />
          <div className="flex flex-col gap-6">
            {queue.map(item => (
              <div key={item.id} className="relative">
                <StandardCard 
                  id={item.id}
                  year={item.year}
                  status="CURRENT"
                  title={item.title}
                  type="RECOMMENDED"
                  relevance={item.confidence}
                  certification={item.certification}
                />
                <div className="absolute top-0 right-0 h-full flex flex-col md:flex-row items-end md:items-center justify-end p-4 gap-6 bg-surface md:bg-transparent pointer-events-none">
                  <div className="flex flex-col gap-1 pointer-events-auto items-end md:items-start bg-surface p-2 rounded-sm border md:border-0 border-border">
                    <Meta>VERIFICATION</Meta>
                    <Badge variant={
                      item.status === 'VERIFIED' ? 'success' : 
                      item.status === 'REJECTED' ? 'danger' : 
                      item.status === 'UNVERIFIED' ? 'neutral' : 'warning'
                    }>{item.status}</Badge>
                  </div>
                  <div className="flex flex-col gap-1 pointer-events-auto items-end md:items-start bg-surface p-2 rounded-sm border md:border-0 border-border">
                    <Meta>EVIDENCE</Meta>
                    <Mono className="text-sm font-medium">{item.evidence.length} REFERENCES</Mono>
                  </div>
                  <Button className="pointer-events-auto uppercase" size="sm" onClick={() => setSelectedItem(item)}>
                    REVIEW
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* CHECKLIST */}
          <section className="flex flex-col gap-6">
            <SectionHeader number="02" title="VERIFICATION CHECKLIST" />
            <div className="flex flex-col border border-border bg-surface rounded-sm">
              {mockChecklist.map(check => (
                <label key={check.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0 cursor-pointer hover:bg-surface-elevated transition-colors">
                  <input 
                    type="checkbox" 
                    checked={checklist.has(check.id)} 
                    onChange={() => toggleChecklist(check.id)}
                    className="w-4 h-4 rounded-sm border-border bg-background checked:bg-text-primary focus:ring-0 cursor-pointer"
                  />
                  <Mono className={`text-sm ${checklist.has(check.id) ? 'text-text-primary' : 'text-text-muted'}`}>
                    [{checklist.has(check.id) ? '✓' : ' '}] {check.label}
                  </Mono>
                </label>
              ))}
            </div>
          </section>

          {/* WARNINGS */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 p-6 border-l-2 border-warning bg-surface rounded-r-sm h-full justify-center">
              <Meta className="text-warning">REVIEW REQUIRED</Meta>
              <Body className="text-sm">
                Certification requirement has not yet been independently verified.
              </Body>
            </div>
          </section>
        </div>

        {/* SUMMARY ACTION */}
        <section className="flex flex-col gap-6 mt-8">
          <SectionHeader number="03" title="REVIEW SUMMARY" />
          <div className="p-6 border border-border bg-surface-elevated rounded-sm flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 items-center flex-wrap">
              <Mono className="text-sm"><span className="text-text-primary font-bold">{statusCounts['VERIFIED'] || 0}</span> VERIFIED</Mono>
              <Mono className="text-sm"><span className="text-text-primary font-bold">{statusCounts['NEEDS REVIEW'] || 0}</span> NEEDS REVIEW</Mono>
              <Mono className="text-sm"><span className="text-text-primary font-bold">{statusCounts['REJECTED'] || 0}</span> REJECTED</Mono>
              <Mono className="text-sm"><span className="text-text-primary font-bold">{statusCounts['UNVERIFIED'] || 0}</span> NOT REVIEWED</Mono>
            </div>
            <Button onClick={() => navigate('/basket')} className="shrink-0 w-full sm:w-auto">
              CONTINUE TO STANDARDS BASKET →
            </Button>
          </div>
        </section>

      </div>

      <Dialog
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="STANDARD REVIEW"
        className="max-w-3xl"
        footer={<Button onClick={() => setSelectedItem(null)}>CLOSE</Button>}
      >
        {selectedItem && (
          <div className="flex flex-col gap-8 py-2">
            <div className="flex flex-col gap-1">
              <Mono className="text-lg font-bold text-text-primary">{selectedItem.id} : {selectedItem.year}</Mono>
              <Body className="font-medium text-text-secondary">{selectedItem.title}</Body>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y border-border py-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Meta>RECOMMENDATION</Meta>
                  <Badge variant="neutral" className="w-fit">{selectedItem.type}</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Meta>CONFIDENCE</Meta>
                  <ConfidenceIndicator level={selectedItem.confidence.level} score={selectedItem.confidence.score} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Meta>APPLICABILITY</Meta>
                <div className="flex flex-col gap-1">
                  {selectedItem.applicability.map((app, i) => (
                    <Body key={i} className="text-sm">{app}</Body>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <Meta>VERSION</Meta>
                <Mono className="text-sm">CURRENT<br/>{selectedItem.id} : {selectedItem.year}</Mono>
              </div>
              <div className="flex flex-col gap-2">
                <Meta>CERTIFICATION</Meta>
                <Mono className="text-sm text-text-primary">{selectedItem.certification}</Mono>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <Meta>EVIDENCE</Meta>
              {selectedItem.evidence.map((ev, i) => (
                <div key={ev.id} className="flex flex-col gap-2">
                  <Mono className="text-xs text-text-muted">EVIDENCE {(i+1).toString().padStart(2, '0')}</Mono>
                  <EvidenceBlock 
                    id={ev.standardId}
                    year={ev.year}
                    clause={ev.clause}
                    page={ev.page}
                    text={ev.text}
                    sourceLabel="DEMO SOURCE"
                  />
                  <div className="flex justify-between items-center mt-1 mb-4">
                    <div className="flex items-center gap-2">
                      <Meta>VERIFICATION:</Meta>
                      <Badge variant={ev.verification === 'SUPPORTED' ? 'success' : 'neutral'}>{ev.verification}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/evidence')} className="text-accent uppercase text-xs">OPEN EVIDENCE →</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-6">
              <Textarea 
                label="REVIEW NOTE" 
                placeholder="Add a note about this standard..."
                value={notes[selectedItem.id] || ''}
                onChange={(e) => handleNoteChange(selectedItem.id, e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-4 border-t border-border pt-6 bg-surface-elevated p-4 -mx-6 -mb-6 mt-4 rounded-b-sm items-center justify-between">
              <Meta>REVIEW DECISION</Meta>
              <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" onClick={() => handleStatusChange(selectedItem.id, 'VERIFIED')}>VERIFY STANDARD</Button>
                <Button variant="destructive" onClick={() => handleStatusChange(selectedItem.id, 'REJECTED')}>REJECT STANDARD</Button>
                <Button variant="ghost" onClick={() => handleStatusChange(selectedItem.id, 'NEEDS REVIEW')}>KEEP FOR FURTHER REVIEW</Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
