import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useChanges } from '../../hooks/useChanges';

export default function ChangesAlertsPage() {
  const { data: changesData, isLoading } = useChanges();
  return (
    <PageContainer>
      <PageHeader
        eyebrow="CHANGES & ALERTS"
        title="STANDARD CHANGE MONITOR"
        description="Track new editions, amendments, reaffirmations, superseded standards and withdrawals."
      />

      <div className="flex flex-col gap-12 pb-24 mt-12">
        {isLoading ? (
          <div className="flex justify-center text-text-muted">Loading changes...</div>
        ) : changesData?.changes && changesData.changes.length > 0 ? (
          <div>
            {/* If we had changes, we'd map them here */}
          </div>
        ) : (
          <EmptyState 
            title="NO CHANGES" 
            description="No standard changes are currently tracked in the database." 
          />
        )}
      </div>
    </PageContainer>
  );
}
