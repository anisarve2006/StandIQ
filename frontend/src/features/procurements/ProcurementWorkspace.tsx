import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { DataList } from '../../components/ui/DataList';
import { Mono, Meta, Body } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
import { initialProcurementDraft } from './procurement.data';

export default function ProcurementWorkspace() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(initialProcurementDraft);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = () => {
    // Simulate file selection
    setDraft({
      ...draft,
      fileName: 'TENDER_SPECIFICATION_V2.PDF',
      fileSize: '2.4 MB'
    });
  };

  const handleRemoveFile = () => {
    setDraft({ ...draft, fileName: null, fileSize: null });
  };

  const validate = () => {
    if (draft.mode === 'describe') {
      if (!draft.description.trim()) return 'Product Description is required.';
    } else {
      if (!draft.fileName) return 'Please upload a tender document.';
    }
    return null;
  };

  const handleAnalyze = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/requirements');
    }, 1500);
  };

  const isReady = draft.mode === 'describe' ? draft.description.length > 0 : !!draft.fileName;

  const describeTab = (
    <div className="flex flex-col gap-6 p-6 border border-border border-t-0 bg-surface">
      <Textarea
        label="PRODUCT / SERVICE"
        placeholder="Describe the product, equipment, material or service..."
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        required
        rows={3}
      />
      <Textarea
        label="TECHNICAL SPECIFICATION"
        placeholder="Enter technical requirements, dimensions, ratings, materials, operating conditions, etc."
        value={draft.technicalSpec}
        onChange={(e) => setDraft({ ...draft, technicalSpec: e.target.value })}
        rows={5}
      />
      <Input
        label="APPLICATION / INTENDED USE"
        value={draft.application}
        onChange={(e) => setDraft({ ...draft, application: e.target.value })}
      />
      <Input
        label="OPERATING ENVIRONMENT"
        value={draft.environment}
        onChange={(e) => setDraft({ ...draft, environment: e.target.value })}
      />
      <Input
        label="EXISTING STANDARD REFERENCES"
        placeholder="e.g. IS 456, IS 800"
        value={draft.existingStandards}
        onChange={(e) => setDraft({ ...draft, existingStandards: e.target.value })}
      />
      <Select
        label="INPUT LANGUAGE"
        value={draft.language}
        onChange={(e) => setDraft({ ...draft, language: e.target.value })}
        options={[
          { value: 'auto', label: 'Auto-detect' },
          { value: 'en', label: 'English' },
          { value: 'hi', label: 'Hindi' },
          { value: 'mr', label: 'Marathi' },
        ]}
      />
    </div>
  );

  const uploadTab = (
    <div className="flex flex-col gap-6 p-6 border border-border border-t-0 bg-surface">
      {!draft.fileName ? (
        <div className="border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center rounded-sm">
          <Mono className="text-text-secondary mb-4">DROP TENDER DOCUMENT HERE</Mono>
          <Meta className="mb-6">PDF / DOCX / TXT</Meta>
          <Meta className="mb-6">or</Meta>
          <Button variant="secondary" onClick={handleFileSelect}>SELECT FILE</Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border border-border bg-surface-elevated rounded-sm">
          <div className="flex flex-col gap-1">
            <Mono className="text-text-primary font-bold">{draft.fileName}</Mono>
            <Meta>{draft.fileSize}</Meta>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="success">READY</Badge>
            <Button variant="ghost" size="sm" onClick={handleRemoveFile}>✕</Button>
          </div>
        </div>
      )}
      <Select
        label="DOCUMENT LANGUAGE"
        value={draft.language}
        onChange={(e) => setDraft({ ...draft, language: e.target.value })}
        options={[
          { value: 'auto', label: 'Auto-detect' },
          { value: 'en', label: 'English' },
          { value: 'hi', label: 'Hindi' },
        ]}
      />
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="NEW PROCUREMENT"
        title="STANDARD INTELLIGENCE WORKSPACE"
        description="Describe what you are procuring or provide an existing tender/specification for analysis."
      />

      <SplitPane
        primary={
          <div className="flex flex-col gap-6">
            <SectionHeader number="01" title="PROCUREMENT INPUT" />
            <div className="flex flex-col">
              <Tabs
                defaultActive="describe"
                onChange={(id: string) => setDraft({ ...draft, mode: id as 'describe' | 'upload' })}
                tabs={[
                  { id: 'describe', label: 'DESCRIBE PROCUREMENT', content: describeTab },
                  { id: 'upload', label: 'UPLOAD TENDER', content: uploadTab },
                ]}
              />
            </div>
            {error && <ErrorState title="VALIDATION ERROR" description={error} />}
            <div className="flex justify-end pt-4">
              <Button onClick={handleAnalyze} isLoading={isLoading}>
                ANALYZE PROCUREMENT →
              </Button>
            </div>
          </div>
        }
        secondary={
          <div className="flex flex-col gap-6 sticky top-8">
            <SectionHeader number="02" title="ANALYSIS CONTEXT" />
            <div className="p-6 border border-border bg-surface flex flex-col gap-8 rounded-sm">
              <div className="flex flex-col gap-2">
                <Meta>INPUT STATUS</Meta>
                {isReady ? (
                  <Badge variant="success" className="w-fit">READY</Badge>
                ) : (
                  <Badge variant="warning" className="w-fit">WAITING FOR INPUT</Badge>
                )}
              </div>
              <DataList
                items={[
                  { label: 'LANGUAGE', value: draft.language === 'auto' ? 'AUTO-DETECT' : draft.language.toUpperCase() },
                  { label: 'INPUT TYPE', value: draft.mode === 'describe' ? 'PRODUCT DESCRIPTION' : 'TENDER DOCUMENT' },
                  { label: 'DOCUMENT', value: draft.fileName ? 'ATTACHED' : 'NOT ATTACHED' },
                  { label: 'REQUIREMENTS', value: '0 DETECTED' },
                ]}
              />
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <Meta>DRAFT STATE</Meta>
                <Body className="text-sm text-text-secondary">INPUT CAPTURED</Body>
                <Body className="text-sm text-text-secondary">NOT YET ANALYZED</Body>
              </div>
            </div>
          </div>
        }
      />
    </PageContainer>
  );
}
