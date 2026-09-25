import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Mono, Meta, Body } from '../../components/ui/Typography';
import { RequirementRow } from '../../components/product/Tender';
import { ConfidenceIndicator } from '../../components/product/Evidence';
import { Select } from '../../components/ui/Select';
import { DataList } from '../../components/ui/DataList';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { useSearchParams } from 'react-router-dom';
import { useGetSession } from '../../hooks/useProcurement';
import { LoadingState } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Requirement } from '../../types/api';

export default function RequirementUnderstandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data: sessionData, isLoading, error } = useGetSession(sessionId);

  // We map the backend Requirement array directly.
  const [editedRequirements, setEditedRequirements] = useState<Requirement[]>([]);
  const requirements = editedRequirements.length > 0 ? editedRequirements : (sessionData?.requirements || []);

  const [editingReq, setEditingReq] = useState<Requirement | null>(null);

  const categories = useMemo(() => {
    if (!requirements) return [];
    const cats = new Set(requirements.map((r: Requirement) => r.category));
    return Array.from(cats);
  }, [requirements]);

  const handleEditSave = () => {
    if (!editingReq) return;
    setEditedRequirements(requirements.map(r => r.id === editingReq.id ? editingReq : r));
    setEditingReq(null);
  };

  const handleRemove = (id: string | undefined) => {
    if (!id) return;
    setEditedRequirements(requirements.filter(r => r.id !== id));
    if (editingReq?.id === id) setEditingReq(null);
  };

  if (isLoading) return <LoadingState message="Loading procurement requirements..." />;
  if (error || !sessionId) return <PageContainer><ErrorState title="SESSION ERROR" description="Could not load the procurement session." /></PageContainer>;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="REQUIREMENT UNDERSTANDING"
        title="STRUCTURED PROCUREMENT REQUIREMENTS"
        description="Review what was extracted from the procurement description before standards are recommended."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        {/* INPUT SUMMARY */}
        <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Meta>SOURCE</Meta>
            <Body className="font-medium text-text-primary">
              {sessionData?.title || "Procurement Session"}
            </Body>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DataList items={[
              { label: 'INPUT LANGUAGE', value: 'AUTO-DETECT' }
            ]} />
            <DataList items={[
              { label: 'INPUT TYPE', value: 'ANALYZED CONTEXT' }
            ]} />
          </div>
        </div>

        {/* REQUIREMENT CATEGORIES */}
        <section>
          <SectionHeader number="01" title="EXTRACTED REQUIREMENTS" />
          <div className="flex flex-col gap-8">
            <Tabs 
              tabs={categories.map(cat => ({
                id: cat,
                label: cat,
                content: (
                  <div className="flex flex-col border border-border rounded-sm bg-surface overflow-hidden">
                    {requirements.filter(r => r.category === cat).map((req, idx) => (
                      <div key={req.id || idx} className="relative group flex items-center justify-between border-b border-border last:border-0 hover:bg-surface-elevated transition-colors px-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <RequirementRow 
                            index={idx + 1}
                            parameter={req.name}
                            value={req.normalized_value ? `${req.normalized_value} ${req.unit || ''}` : req.source_text}
                            status={req.required ? "SPECIFIED" : "OPTIONAL"}
                          />
                          <div className="flex items-center gap-4 py-2 border-t border-border opacity-60 group-hover:opacity-100 transition-opacity">
                            <ConfidenceIndicator level={(req.confidence || 0.8) > 0.7 ? 'HIGH' : 'MEDIUM'} />
                            {req.source_clause && (
                              <Mono className="text-xs text-text-secondary">SOURCE: {req.source_clause}</Mono>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 uppercase text-xs" onClick={() => setEditingReq(req)}>
                          EDIT
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              }))}
            />
          </div>
        </section>

        {/* INFORMATION GAPS */}
        <section>
          <SectionHeader number="02" title="INFORMATION GAPS" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState title="NO GAPS DETECTED" description="The backend does not currently expose requirement gaps natively through the session response." />
          </div>
        </section>

        {/* CLARIFYING QUESTIONS */}
        <section>
          <SectionHeader number="03" title="CLARIFICATION" />
          <div className="p-6 border border-border rounded-sm bg-surface flex flex-col gap-6">
            <EmptyState title="NO CLARIFYING QUESTIONS" description="The backend does not currently expose clarifying questions through the session response." />
          </div>
        </section>

        {/* CONTINUE ACTION */}
        <div className="mt-8 p-6 border border-border rounded-sm bg-surface-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Meta>REQUIREMENTS REVIEWED</Meta>
            <Body className="font-medium text-text-primary">
              {requirements.length} REQUIREMENTS
            </Body>
          </div>
          <Button onClick={() => navigate(`/standards?session_id=${sessionId}`)} size="lg" className="w-full sm:w-auto shrink-0">
            CONTINUE TO STANDARD DISCOVERY →
          </Button>
        </div>

      </div>

      <Dialog 
        isOpen={!!editingReq}
        onClose={() => setEditingReq(null)}
        title="Edit Requirement"
        footer={
          <>
            <Button variant="ghost" onClick={() => handleRemove(editingReq!.id)} className="text-error mr-auto hover:text-error hover:bg-error/10">REMOVE</Button>
            <Button variant="ghost" onClick={() => setEditingReq(null)}>CANCEL</Button>
            <Button onClick={handleEditSave}>SAVE CHANGES</Button>
          </>
        }
      >
        {editingReq && (
          <div className="flex flex-col gap-6 py-4">
            <Input 
              label="PARAMETER" 
              value={editingReq.name}
              onChange={(e: any) => setEditingReq({...editingReq, name: e.target.value})}
            />
            <Input 
              label="VALUE" 
              value={editingReq.source_text}
              onChange={(e: any) => setEditingReq({...editingReq, source_text: e.target.value})}
            />
            <Select 
              label="CATEGORY"
              value={editingReq.category}
              onChange={e => setEditingReq({...editingReq, category: e.target.value as any})}
              options={[
                { value: 'PRODUCT', label: 'PRODUCT' },
                { value: 'PERFORMANCE', label: 'PERFORMANCE' },
                { value: 'MATERIAL', label: 'MATERIAL' },
                { value: 'ENVIRONMENT', label: 'ENVIRONMENT' },
                { value: 'SAFETY', label: 'SAFETY' },
                { value: 'TESTING', label: 'TESTING' },
                { value: 'CERTIFICATION', label: 'CERTIFICATION' },
                { value: 'INSTALLATION', label: 'INSTALLATION' },
              ]}
            />
            <Select 
              label="STATUS"
              value={editingReq.required ? 'SPECIFIED' : 'OPTIONAL'}
              onChange={e => setEditingReq({...editingReq, required: e.target.value === 'SPECIFIED'})}
              options={[
                { value: 'SPECIFIED', label: 'SPECIFIED' },
                { value: 'OPTIONAL', label: 'OPTIONAL' },
              ]}
            />
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
