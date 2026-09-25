import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Mono, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { FindingRow } from '../../components/product/Tender';
import { mockApprovalChecks, mockApprovalIssues } from './approval.data';

export default function ApprovalPage() {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<Set<string>>(new Set(['ac1', 'ac2', 'ac3', 'ac4']));
  const [isApproved, setIsApproved] = useState(false);

  const toggleCheck = (id: string) => {
    if (isApproved) return;
    const newSet = new Set(checks);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setChecks(newSet);
  };

  const remaining = mockApprovalChecks.length - checks.size;
  const isReady = remaining === 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="APPROVAL"
        title="FINAL PROCUREMENT REVIEW"
        description="Review unresolved issues, evidence and specification completeness before approving the procurement package."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        {isApproved ? (
          <section className="flex flex-col gap-6">
            <div className="p-8 border border-accent bg-accent/5 rounded-sm flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <span className="w-4 h-4 rounded-full bg-accent" />
                <Mono className="text-2xl font-bold text-accent">APPROVED</Mono>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-accent/20">
                <div className="flex flex-col gap-1">
                  <Meta>PACKAGE</Meta>
                  <Mono className="text-sm font-bold text-text-primary">Electrical Distribution Panel</Mono>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>APPROVED</Meta>
                  <Mono className="text-sm">25 SEP 2026</Mono>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>REVIEWER</Meta>
                  <Mono className="text-sm">DEMO USER</Mono>
                </div>
                <div className="flex flex-col gap-1">
                  <Meta>STATUS</Meta>
                  <Mono className="text-sm text-text-primary">APPROVED FOR EXPORT</Mono>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => navigate('/export')} size="lg">PROCEED TO EXPORT →</Button>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <section className="flex flex-col gap-6">
              <SectionHeader number="01" title="APPROVAL CHECKLIST" />
              <div className="flex flex-col border border-border bg-surface rounded-sm">
                {mockApprovalChecks.map(check => (
                  <label key={check.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0 cursor-pointer hover:bg-surface-elevated transition-colors">
                    <input 
                      type="checkbox" 
                      checked={checks.has(check.id)} 
                      onChange={() => toggleCheck(check.id)}
                      className="w-4 h-4 rounded-sm border-border bg-background checked:bg-text-primary focus:ring-0 cursor-pointer"
                    />
                    <Mono className={`text-sm ${checks.has(check.id) ? 'text-text-primary' : 'text-text-muted'}`}>
                      [{checks.has(check.id) ? '✓' : ' '}] {check.label}
                    </Mono>
                  </label>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-12">
              <section className="flex flex-col gap-6">
                <SectionHeader number="02" title="UNRESOLVED ITEMS" />
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mono className="text-lg font-bold text-text-primary">{mockApprovalIssues.length.toString().padStart(2, '0')}</Mono>
                    <Meta>ITEMS REQUIRE ATTENTION</Meta>
                  </div>
                  {mockApprovalIssues.map(issue => (
                    <FindingRow 
                      key={issue.id}
                      status="REVIEW REQUIRED"
                      title={issue.type}
                      description={issue.description}
                    />
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-6">
                <div className={`p-6 border rounded-sm flex flex-col gap-6 ${isReady ? 'border-success bg-success/5' : 'border-border bg-surface-elevated'}`}>
                  <Meta>APPROVAL STATUS</Meta>
                  <div className="flex flex-col gap-2">
                    <Mono className={`text-xl font-bold ${isReady ? 'text-success' : 'text-text-primary'}`}>
                      {isReady ? 'READY FOR APPROVAL' : 'NOT READY FOR APPROVAL'}
                    </Mono>
                    <Mono className="text-sm text-text-muted">
                      {isReady ? 'ALL REQUIRED CHECKS COMPLETE' : `${remaining} CHECKS REMAIN`}
                    </Mono>
                  </div>
                  <div className="flex gap-4 mt-2 border-t border-border pt-6">
                    <Button variant="secondary" onClick={() => navigate('/specification-builder')}>RETURN TO REVIEW</Button>
                    <Button disabled={!isReady} onClick={() => setIsApproved(true)}>APPROVE PACKAGE</Button>
                  </div>
                </div>
              </section>
            </div>
            
          </div>
        )}

      </div>
    </PageContainer>
  );
}
