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
import { mockRequirements, mockGaps, mockQuestions } from './requirements.data';
import { DataList } from '../../components/ui/DataList';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import type { Requirement } from './requirements.types';

export default function RequirementUnderstandingPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState(mockRequirements);
  const [editingReq, setEditingReq] = useState<Requirement | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(requirements.map(r => r.category));
    return Array.from(cats);
  }, [requirements]);

  const handleEditSave = () => {
    if (!editingReq) return;
    setRequirements(requirements.map(r => r.id === editingReq.id ? editingReq : r));
    setEditingReq(null);
  };

  const handleRemove = (id: string) => {
    setRequirements(requirements.filter(r => r.id !== id));
    if (editingReq?.id === id) setEditingReq(null);
  };

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
              Electrical distribution panel for commercial building applications.
            </Body>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DataList items={[
              { label: 'INPUT LANGUAGE', value: 'ENGLISH' }
            ]} />
            <DataList items={[
              { label: 'INPUT TYPE', value: 'PRODUCT DESCRIPTION' }
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
                      <div key={req.id} className="relative group flex items-center justify-between border-b border-border last:border-0 hover:bg-surface-elevated transition-colors px-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <RequirementRow 
                            index={idx + 1}
                            parameter={req.parameter}
                            value={req.value}
                            status={req.status}
                          />
                          <div className="flex items-center gap-4 py-2 border-t border-border opacity-60 group-hover:opacity-100 transition-opacity">
                            <ConfidenceIndicator level={req.confidence} />
                            {req.source && (
                              <Mono className="text-xs text-text-secondary">SOURCE: {req.source}</Mono>
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
            {mockGaps.map(gap => (
              <div key={gap.id} className="p-4 border border-border rounded-sm bg-surface flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Mono className="text-sm font-bold text-text-primary">{gap.parameter}</Mono>
                  <Body className="text-sm text-text-secondary">{gap.description}</Body>
                </div>
                <Button variant="secondary" size="sm" className="w-fit mt-2 uppercase text-xs">ADD VALUE</Button>
              </div>
            ))}
          </div>
        </section>

        {/* CLARIFYING QUESTIONS */}
        <section>
          <SectionHeader number="03" title="CLARIFICATION" />
          <div className="p-6 border border-border rounded-sm bg-surface flex flex-col gap-6">
            <Body className="text-sm text-text-secondary">
              The following information may improve standards applicability:
            </Body>
            <div className="flex flex-col gap-4">
              {mockQuestions.map(q => (
                <Input key={q.id} label={q.question} placeholder="Enter your answer..." />
              ))}
            </div>
          </div>
        </section>

        {/* CONTINUE ACTION */}
        <div className="mt-8 p-6 border border-border rounded-sm bg-surface-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Meta>REQUIREMENTS REVIEWED</Meta>
            <Body className="font-medium text-text-primary">
              {requirements.length} REQUIREMENTS · {mockGaps.length} INFORMATION GAPS
            </Body>
          </div>
          <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:w-auto shrink-0">
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
            <Button variant="ghost" onClick={() => handleRemove(editingReq!.id)} className="text-red-500 mr-auto hover:text-red-600 hover:bg-red-500/10">REMOVE</Button>
            <Button variant="ghost" onClick={() => setEditingReq(null)}>CANCEL</Button>
            <Button onClick={handleEditSave}>SAVE CHANGES</Button>
          </>
        }
      >
        {editingReq && (
          <div className="flex flex-col gap-6 py-4">
            <Input 
              label="PARAMETER" 
              value={editingReq.parameter}
              onChange={e => setEditingReq({...editingReq, parameter: e.target.value})}
            />
            <Input 
              label="VALUE" 
              value={editingReq.value}
              onChange={e => setEditingReq({...editingReq, value: e.target.value})}
            />
            <Select 
              label="CATEGORY"
              value={editingReq.category}
              onChange={e => setEditingReq({...editingReq, category: e.target.value})}
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
              value={editingReq.status}
              onChange={e => setEditingReq({...editingReq, status: e.target.value as any})}
              options={[
                { value: 'SPECIFIED', label: 'SPECIFIED' },
                { value: 'MISSING', label: 'MISSING' },
                { value: 'CONFLICT', label: 'CONFLICT' },
                { value: 'UNKNOWN', label: 'UNKNOWN' },
                { value: 'VERIFIED', label: 'VERIFIED' },
              ]}
            />
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
