import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ChangesAlertsPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="CHANGES & ALERTS"
        title="STANDARD CHANGE MONITOR"
        description="Track new editions, amendments, reaffirmations, superseded standards and withdrawals."
      />

      <div className="flex flex-col gap-12 pb-24 mt-12">
        <EmptyState 
          title="BACKEND GAP" 
          description="The standard change monitor relies on historical version timelines and impact mapping which are not currently exposed by the backend." 
        />
      </div>
    </PageContainer>
  );
}
