import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Mono, H3, Body, Meta } from '../ui/Typography';
import { StatusIndicator } from '../ui/StatusIndicator';
import { ConfidenceIndicator } from './Evidence';

export const StandardStatus = ({ status }: { status: string }) => {
  return <StatusIndicator status={status} />;
};

export const CertificationIndicator = ({ type }: { type: 'REQUIRED' | 'APPLICABLE' | 'NOT_IDENTIFIED' | 'UNKNOWN' | string }) => {
  if (type === 'NOT_IDENTIFIED') return <Mono className="text-text-muted text-xs">NOT IDENTIFIED</Mono>;
  if (type === 'UNKNOWN') return <Mono className="text-text-muted text-xs">UNKNOWN</Mono>;
  return <Mono className="text-text-primary text-xs">{type}</Mono>;
};

export const StandardCard = ({ id, year, status, title, description, type, relevance, certification, onWhyRecommended, onViewEvidence, onViewStandard }: any) => {
  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <Mono className="text-lg font-bold text-text-primary">{id} : {year}</Mono>
        </div>
        <StandardStatus status={status} />
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div>
          <H3 className="text-base">{title}</H3>
          <Body className="text-sm mt-1">{description}</Body>
        </div>
        <Badge variant="neutral" className="w-fit">{type}</Badge>
        <div className="flex items-center gap-6 mt-2 pt-4 border-t border-border">
          <div className="flex flex-col gap-1">
            <Meta>RELEVANCE</Meta>
            <ConfidenceIndicator level={relevance.level} score={relevance.score} />
          </div>
          <div className="flex flex-col gap-1">
            <Meta>CERTIFICATION</Meta>
            <CertificationIndicator type={certification} />
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-start gap-4">
        {onWhyRecommended && <Button variant="ghost" size="sm" onClick={onWhyRecommended} className="px-0 uppercase text-xs font-mono">WHY RECOMMENDED →</Button>}
        {onViewStandard && <Button variant="ghost" size="sm" onClick={onViewStandard} className="px-0 uppercase text-xs font-mono">VIEW STANDARD →</Button>}
        {onViewEvidence && <Button variant="ghost" size="sm" onClick={onViewEvidence} className="px-0 uppercase text-xs font-mono text-accent">VIEW EVIDENCE →</Button>}
      </CardFooter>
    </Card>
  );
};

export const VersionTimeline = ({ versions }: { versions: any[] }) => {
  return (
    <div className="flex flex-col gap-4 relative">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border z-0" />
      {versions.map((v, i) => (
        <div key={i} className="flex gap-4 relative z-10">
          <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
            <span className={`w-3 h-3 rounded-full border-2 border-background ${v.isCurrent ? 'bg-accent' : 'bg-border'}`} />
          </div>
          <div className="flex flex-col pb-4">
            <div className="flex items-center gap-2">
              <Mono className="text-sm text-text-primary">{v.date}</Mono>
              <Badge variant="neutral" className="text-[10px] py-0 px-1">{v.status}</Badge>
            </div>
            <Mono className="text-sm font-medium mt-1 text-text-primary">{v.label}</Mono>
          </div>
        </div>
      ))}
    </div>
  );
};

export const RelationshipItem = ({ type, id, description, onAction }: any) => {
  return (
    <div className="flex items-start gap-4 p-4 border border-border bg-surface rounded-sm">
      <Badge variant="neutral" className="shrink-0">{type}</Badge>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <Mono className="text-sm font-bold">{id}</Mono>
        <Body className="text-xs truncate">{description}</Body>
      </div>
      {onAction && (
        <Button variant="ghost" size="sm" onClick={onAction} className="shrink-0 px-2 py-1 h-auto text-xs font-mono">
          → VIEW STANDARD
        </Button>
      )}
    </div>
  );
};
