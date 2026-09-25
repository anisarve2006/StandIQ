import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SearchInput } from '../../components/ui/SearchInput';
import { Metric } from '../../components/ui/Metric';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { StandardCard, VersionTimeline } from '../../components/product/Standards';
import { RecommendationReason, EvidenceBlock } from '../../components/product/Evidence';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Select } from '../../components/ui/Select';
import { useRecommendStandards } from '../../hooks/useStandards';
import type { StandardRecommendation } from '../../types/api';

export default function StandardsDiscoveryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<StandardRecommendation | null>(null);
  const [dialogType, setDialogType] = useState<'why' | 'evidence' | 'versions' | null>(null);
  const [basket, setBasket] = useState<Set<string>>(new Set());
  
  const { mutate: recommend, data: apiData, isPending: isLoading, error } = useRecommendStandards();
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      recommend({ query: searchQuery, limit: 10 });
    }
  };

  const handleToggleBasket = (id: string) => {
    const newBasket = new Set(basket);
    if (newBasket.has(id)) {
      newBasket.delete(id);
    } else {
      newBasket.add(id);
    }
    setBasket(newBasket);
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedStandard(null);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="STANDARDS DISCOVERY"
        title="APPLICABLE INDIAN STANDARDS"
        description="Review standards identified from the structured procurement requirements."
      />
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>PROCUREMENT</Meta>
        <Body className="text-sm font-medium">Electrical Distribution Panel</Body>
        <span className="text-border">|</span>
        <Meta>REQUIREMENTS</Meta>
        <Mono className="text-sm">06</Mono>
        <span className="text-border">|</span>
        <Meta>INPUT LANGUAGE</Meta>
        <Badge variant="neutral">ENGLISH</Badge>
      </div>

      <SplitPane 
        primary={
          <div className="flex flex-col gap-12 pb-24">
            
            <div className="flex gap-2 w-full">
              <SearchInput 
                placeholder="SEARCH STANDARDS (e.g. Electric Motor 5HP 230V)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
              <Button onClick={handleSearch} disabled={isLoading}>{isLoading ? 'SEARCHING...' : 'SEARCH'}</Button>
            </div>
            
            {error && <div className="text-danger p-4 border border-danger rounded-sm">Failed to connect to backend engine. Is FastAPI running locally?</div>}

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
              <Metric value={apiData?.recommended_standards?.length?.toString().padStart(2, '0') || "00"} label="RECOMMENDED" />
              <Metric value={apiData?.alternative_candidates?.length?.toString().padStart(2, '0') || "00"} label="ALTERNATIVES" />
              <Metric value="--" label="RELATED" />
              <Metric value="--" label="EXCLUDED" />
            </section>

            <section className="flex flex-wrap gap-4 p-4 border border-border bg-surface rounded-sm">
              <Select label="RELEVANCE" options={[{value:'all', label:'All'}, {value:'high', label:'High'}, {value:'medium', label:'Medium'}, {value:'low', label:'Low'}]} />
              <Select label="STATUS" options={[{value:'all', label:'All'}, {value:'current', label:'Current'}, {value:'amended', label:'Amended'}, {value:'superseded', label:'Superseded'}, {value:'withdrawn', label:'Withdrawn'}]} />
              <Select label="TYPE" options={[{value:'all', label:'All'}, {value:'primary', label:'Primary'}, {value:'test', label:'Test Method'}, {value:'safety', label:'Safety'}, {value:'installation', label:'Installation'}, {value:'material', label:'Material'}]} />
              <Select label="CERTIFICATION" options={[{value:'all', label:'All'}, {value:'bis', label:'BIS'}, {value:'crs', label:'CRS'}, {value:'hallmarking', label:'Hallmarking'}, {value:'unknown', label:'Unknown'}]} />
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="01" title="RECOMMENDED" />
              <div className="flex flex-col gap-6">
                {!apiData?.recommended_standards?.length && !isLoading && (
                   <Body className="text-text-muted">No standards found. Please try a different query.</Body>
                )}
                {apiData?.recommended_standards?.map((std) => (
                  <div key={std.standard_id} className="relative">
                    <StandardCard 
                      id={std.standard_id}
                      year={""}
                      status={"CURRENT"}
                      title={std.title}
                      description={"Standard retrieved from MaanakAI Engine."}
                      type={"PRIMARY"}
                      relevance={std.confidence.confidence_level === 'HIGH' ? 'HIGH' : std.confidence.confidence_level === 'MEDIUM' ? 'MEDIUM' : 'LOW'}
                      certification={std.verification_status === 'VERIFIED' ? 'REQUIRED' : 'UNKNOWN'}
                      onWhyRecommended={() => { setSelectedStandard(std); setDialogType('why'); }}
                      onViewEvidence={() => { setSelectedStandard(std); setDialogType('evidence'); }}
                      onViewStandard={() => navigate(`/standards/${encodeURIComponent(std.standard_id.toLowerCase().replace(/ /g, '-'))}`)}
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedStandard(std); setDialogType('versions'); }}>VIEW VERSION HISTORY</Button>
                      <Button variant={basket.has(std.standard_id) ? "secondary" : "ghost"} size="sm" onClick={() => handleToggleBasket(std.standard_id)}>
                        {basket.has(std.standard_id) ? '✓ SELECTED' : '+ ADD'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="02" title="ALLIED STANDARDS" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Body className="text-text-muted">Explore individual standards to view allied relationships.</Body>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="03" title="CONSIDERED AND EXCLUDED" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Body className="text-text-muted">Excluded candidates available in backend logs.</Body>
              </div>
            </section>

          </div>
        }
        secondary={
          <div className="flex flex-col gap-6 sticky top-8">
            <SectionHeader number="" title="STANDARDS BASKET" />
            <div className="p-6 border border-border bg-surface flex flex-col gap-6 rounded-sm">
              <div className="flex flex-col gap-1">
                <Mono className="text-3xl text-text-primary">{basket.size.toString().padStart(2, '0')}</Mono>
                <Meta>SELECTED</Meta>
              </div>
              <div className="flex flex-col gap-2">
                {Array.from(basket).map(id => (
                  <div key={id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <Mono className="text-sm">{id}</Mono>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleBasket(id)} className="px-1 py-0 h-auto text-xs">✕</Button>
                  </div>
                ))}
              </div>
              <Button disabled={basket.size === 0} onClick={() => navigate('/tender-health')}>VIEW BASKET →</Button>
            </div>
          </div>
        }
      />

      {/* DIALOGS */}
      <Dialog
        isOpen={dialogType === 'why' && !!selectedStandard}
        onClose={closeDialog}
        title="WHY RECOMMENDED"
        footer={<Button onClick={closeDialog}>CLOSE</Button>}
      >
        {selectedStandard && (
          <RecommendationReason 
            matches={selectedStandard.confidence.reasons}
            evidenceCount={selectedStandard.evidence?.length || 0}
          />
        )}
      </Dialog>

      <Dialog
        isOpen={dialogType === 'evidence' && !!selectedStandard}
        onClose={closeDialog}
        title="EVIDENCE"
        footer={<Button onClick={closeDialog}>CLOSE</Button>}
      >
        {selectedStandard && (
          <div className="flex flex-col gap-4">
            {selectedStandard.evidence?.map((ev, i) => (
              <EvidenceBlock 
                key={i}
                id={selectedStandard.standard_id}
                year={""}
                clause={ev.clause || "-"}
                page={ev.page?.toString() || "-"}
                text={ev.text || "Direct retrieval hit from MaanakAI"}
                sourceLabel={ev.source || "LOCAL DATABASE"}
                confidence={selectedStandard.confidence.confidence_level === 'HIGH' ? 'HIGH' : 'LOW'}
              />
            )) || <Body>No specific evidence snippets returned.</Body>}
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={dialogType === 'versions' && !!selectedStandard}
        onClose={closeDialog}
        title="VERSION HISTORY"
        footer={<Button onClick={closeDialog}>CLOSE</Button>}
      >
        {selectedStandard && (
          <div className="p-4 border border-border bg-surface rounded-sm">
            <VersionTimeline 
              versions={[
                { date: 'CURRENT', status: 'CURRENT', label: `${selectedStandard.standard_id}`, isCurrent: true },
              ]}
            />
            <Body className="text-xs text-text-muted mt-4 italic">Note: Navigate to Standard detail to load full version history.</Body>
          </div>
        )}
      </Dialog>

    </PageContainer>
  );
}
