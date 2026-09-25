import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SplitPane } from '../../components/layout/SplitPane';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Button } from '../../components/ui/Button';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { useTenderDiff } from '../../hooks/useTender';
import { useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../components/ui/ErrorState';
import { Textarea } from '../../components/ui/Textarea';

export default function TenderDiffPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';

  const [versionA, setVersionA] = useState('');
  const [versionB, setVersionB] = useState('');

  const { mutate: runDiff, data: diffData, isPending, error } = useTenderDiff();

  const handleDiff = () => {
    if (!versionA || !versionB) return;
    runDiff({ version_a_text: versionA, version_b_text: versionB });
  };

  const addedCount = diffData?.added_clauses?.length || 0;
  const removedCount = diffData?.removed_clauses?.length || 0;
  const modifiedCount = (diffData?.modified_clauses?.length || 0) + (diffData?.changed_technical_values?.length || 0) + (diffData?.changed_standards?.length || 0);
  const totalIssues = addedCount + removedCount + modifiedCount;

  return (
    <PageContainer>
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" className="px-0 text-text-muted hover:text-text-primary uppercase text-xs tracking-wider" onClick={() => navigate(`/tender-health?session_id=${sessionId}`)}>
          ← BACK TO TENDER HEALTH
        </Button>
      </div>

      <PageHeader
        eyebrow="TENDER DIFF / FIX"
        title="SPECIFICATION CORRECTION WORKSPACE"
        description="Compare the current tender specification against identified standards and recommended corrections."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value={totalIssues.toString().padStart(2, '0')} label="TOTAL CHANGES" />
          <Metric value={addedCount.toString().padStart(2, '0')} label="ADDED CLAUSES" />
          <Metric value={removedCount.toString().padStart(2, '0')} label="REMOVED CLAUSES" />
          <Metric value={modifiedCount.toString().padStart(2, '0')} label="MODIFIED CLAUSES" />
        </section>

        <section className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <Textarea
              label="VERSION A (ORIGINAL)"
              placeholder="Paste original tender text..."
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
              rows={8}
            />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Textarea
              label="VERSION B (UPDATED)"
              placeholder="Paste updated tender text..."
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
              rows={8}
            />
          </div>
        </section>

        <div className="flex justify-center mb-8">
          <Button onClick={handleDiff} disabled={isPending || !versionA || !versionB}>
            {isPending ? 'ANALYZING...' : 'COMPARE VERSIONS'}
          </Button>
        </div>

        {error && <ErrorState title="ANALYSIS FAILED" description={(error as any).message || 'Failed to compare versions.'} />}

        {diffData && (
          <SplitPane
            primary={
              <div className="flex flex-col gap-8">
                {/* ADDED CLAUSES */}
                <div className="flex flex-col gap-4 border border-success/30 bg-success/5 p-6 rounded-sm">
                  <Meta className="text-success">ADDED CLAUSES ({addedCount})</Meta>
                  {addedCount === 0 ? <Body className="text-sm">No new clauses added.</Body> : (
                    <ul className="flex flex-col gap-2">
                      {diffData.added_clauses.map((clause, idx) => (
                        <li key={idx} className="text-sm bg-background p-3 border border-success/20">
                          <Mono className="text-success text-xs font-bold mr-2">+</Mono> {clause}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* REMOVED CLAUSES */}
                <div className="flex flex-col gap-4 border border-danger/30 bg-danger/5 p-6 rounded-sm">
                  <Meta className="text-danger">REMOVED CLAUSES ({removedCount})</Meta>
                  {removedCount === 0 ? <Body className="text-sm">No clauses removed.</Body> : (
                    <ul className="flex flex-col gap-2">
                      {diffData.removed_clauses.map((clause, idx) => (
                        <li key={idx} className="text-sm bg-background p-3 border border-danger/20 line-through opacity-70">
                          <Mono className="text-danger text-xs font-bold mr-2">-</Mono> {clause}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* MODIFIED CLAUSES */}
                <div className="flex flex-col gap-4 border border-warning/30 bg-warning/5 p-6 rounded-sm">
                  <Meta className="text-warning">MODIFIED CLAUSES ({diffData.modified_clauses?.length || 0})</Meta>
                  {(diffData.modified_clauses?.length || 0) === 0 ? <Body className="text-sm">No clauses modified.</Body> : (
                    <div className="flex flex-col gap-4">
                      {diffData.modified_clauses.map((mod, idx) => (
                        <div key={idx} className="flex flex-col gap-2 bg-background p-4 border border-warning/20">
                          <Body className="text-sm line-through text-danger opacity-70">
                            <Mono className="text-danger text-xs font-bold mr-2">-</Mono> {mod.original || '(missing)'}
                          </Body>
                          <Body className="text-sm text-success">
                            <Mono className="text-success text-xs font-bold mr-2">+</Mono> {mod.modified || '(missing)'}
                          </Body>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            }
            secondary={
              <div className="flex flex-col gap-6 sticky top-8">
                <SectionHeader number="03" title="TECHNICAL CHANGES" />
                <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <Meta>CHANGED TECHNICAL VALUES</Meta>
                    {(diffData.changed_technical_values?.length || 0) === 0 ? <Body className="text-sm">None detected.</Body> : (
                      <ul className="flex flex-col gap-2">
                        {diffData.changed_technical_values.map((v, i) => (
                          <li key={i} className="flex justify-between items-center bg-background p-2 border border-border">
                            <Body className="text-sm truncate w-1/2">{JSON.stringify(v)}</Body>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-4 pt-6 border-t border-border">
                    <Meta>CHANGED STANDARDS</Meta>
                    {(diffData.changed_standards?.length || 0) === 0 ? <Body className="text-sm">None detected.</Body> : (
                      <ul className="flex flex-col gap-2">
                        {diffData.changed_standards.map((s, i) => (
                          <li key={i} className="flex flex-col gap-1 bg-background p-2 border border-border">
                            <Body className="text-sm font-bold">{s.standard_id || JSON.stringify(s)}</Body>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            }
          />
        )}
      </div>


    </PageContainer>
  );
}
