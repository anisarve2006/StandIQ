import { Mono, Body, Meta, H3 } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const EvidenceCitation = ({ id, year, clause, page }: any) => {
  return (
    <Mono className="text-xs text-text-secondary bg-surface-elevated px-1.5 py-0.5 rounded-sm border border-border">
      {id} : {year} · §{clause} · p.{page}
    </Mono>
  );
};

export const ConfidenceIndicator = ({ level, score }: { level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN', score?: number }) => {
  const colors = {
    HIGH: 'text-text-primary',
    MEDIUM: 'text-text-secondary',
    LOW: 'text-text-muted',
    UNKNOWN: 'text-text-muted'
  };
  return (
    <div className="flex items-center gap-2">
      <Mono className={`text-xs font-medium ${colors[level]}`}>{level}</Mono>
      {score !== undefined && <Mono className="text-xs text-text-muted">· {score.toFixed(2)}</Mono>}
    </div>
  );
};

export const VerificationStatus = ({ status }: { status: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'NEEDS_REVIEW' | 'UNVERIFIED' | 'REJECTED' | 'REVIEW' }) => {
  const variants = {
    VERIFIED: 'accent',
    PARTIALLY_VERIFIED: 'warning',
    NEEDS_REVIEW: 'warning',
    REVIEW: 'warning',
    UNVERIFIED: 'neutral',
    REJECTED: 'danger'
  };
  return <Badge variant={variants[status] as any}>{status.replace('_', ' ')}</Badge>;
};

export const EvidenceBlock = ({ id, year, clause, page, text, sourceLabel, confidence, onCitationAction }: any) => {
  return (
    <div className="flex flex-col border border-border rounded-sm bg-surface overflow-hidden">
      <div className="px-4 py-2 border-b border-border bg-surface-elevated flex justify-between items-center">
        <Meta>EVIDENCE</Meta>
        <Badge variant="neutral">{sourceLabel}</Badge>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <Mono className="text-sm font-bold text-text-primary">{id} : {year}</Mono>
            <Mono className="text-xs text-text-secondary">Clause {clause}</Mono>
          </div>
          {confidence && <ConfidenceIndicator level={confidence.level} score={confidence.score} />}
        </div>
        <div className="pl-4 border-l-2 border-border py-1">
          <Body className="text-sm italic text-text-secondary">"{text}"</Body>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-border flex justify-between items-center">
        <Mono className="text-xs text-text-muted uppercase">PAGE {page}</Mono>
        {onCitationAction && (
          <Button variant="ghost" size="sm" onClick={onCitationAction} className="h-auto py-1 px-2 text-xs font-mono text-accent">
            VIEW SOURCE →
          </Button>
        )}
      </div>
    </div>
  );
};

export const RecommendationReason = ({ matches, evidenceCount }: any) => {
  return (
    <div className="flex flex-col gap-4 p-4 border border-border bg-surface rounded-sm">
      <div className="flex flex-col gap-2">
        <Meta>WHY RECOMMENDED</Meta>
        <div className="flex flex-col gap-1 text-sm text-text-secondary">
          Matches:
          <ul className="list-disc pl-5 mt-1 flex flex-col gap-1">
            {matches.map((m: string, i: number) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-1 pt-3 border-t border-border">
        <Meta>SUPPORTED BY</Meta>
        <Body className="text-sm text-text-primary">{evidenceCount} evidence references</Body>
      </div>
    </div>
  );
};

export const ExclusionReason = ({ id, year, reasonTitle, description, onViewEvidence }: any) => {
  return (
    <div className="flex flex-col gap-4 p-4 border border-border bg-surface rounded-sm opacity-75 hover:opacity-100 transition-opacity">
      <Meta>CONSIDERED AND EXCLUDED</Meta>
      <div className="flex flex-col gap-1">
        <Mono className="text-sm font-bold text-text-primary">{id} : {year}</Mono>
        <H3 className="text-sm text-red-500 mt-2">{reasonTitle}</H3>
        <Body className="text-sm mt-1">{description}</Body>
      </div>
      {onViewEvidence && (
        <Button variant="ghost" size="sm" onClick={onViewEvidence} className="px-0 h-auto py-1 uppercase text-xs font-mono mt-2 self-start">
          VIEW EVIDENCE →
        </Button>
      )}
    </div>
  );
};
