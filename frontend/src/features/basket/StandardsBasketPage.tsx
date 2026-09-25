import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { StandardCard } from '../../components/product/Standards';
import { VerificationStatus } from '../../components/product/Evidence';
import { Mono, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { DataList } from '../../components/ui/DataList';
import { useSearchParams } from 'react-router-dom';
import { useGetSession } from '../../hooks/useProcurement';
import { LoadingState } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export default function StandardsBasketPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';

  const { data: sessionData, isLoading, error } = useGetSession(sessionId);

  // We rely on session.selected_standards for the basket.
  const standards = sessionData?.selected_standards || [];
  
  if (isLoading) return <LoadingState message="Loading standards basket..." />;
  if (error || !sessionId) return <PageContainer><ErrorState title="SESSION ERROR" description="Could not load the procurement session." /></PageContainer>;

  const handleRemoveStandard = (id: string) => {
    alert(`Removing standard ${id} from backend session is not implemented in the API yet.`);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="STANDARDS BASKET"
        title="SELECTED STANDARD SET"
        description="Review the standards and allied references that will form the basis of the procurement specification."
      />
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <Meta>DISCOVERED</Meta>
        <Mono className="text-sm">--</Mono>
        <span className="text-border">|</span>
        <Meta>SELECTED</Meta>
        <Mono className="text-sm">{standards.length}</Mono>
        <span className="text-border">|</span>
        <Meta>VERIFIED</Meta>
        <Mono className="text-sm">{sessionData?.verification_state}</Mono>
      </div>

      <div className="flex flex-col gap-12 pb-24">
        
        {/* BASKET ITEMS */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="01" title="SELECTED STANDARDS" />
          <div className="flex flex-col gap-6">
            {standards.length === 0 && <EmptyState title="EMPTY BASKET" description="No standards have been added to this procurement session." />}
            {standards.map(std => (
              <div key={std.standard_id || std.id} className="relative">
                <StandardCard 
                  id={std.standard_id || std.id}
                  year={std.year || 2024}
                  status={std.status || 'ACTIVE'}
                  title={std.title || 'Unknown Title'}
                  type={std.type || 'PRODUCT_STANDARD'}
                  relevance={{ level: 'HIGH', score: 1.0 }} 
                />
                <div className="absolute top-0 right-0 h-full flex flex-col md:flex-row items-end md:items-center justify-end p-4 gap-6 bg-surface md:bg-transparent pointer-events-none">
                  <div className="flex flex-col gap-1 pointer-events-auto items-end md:items-start bg-surface p-2 rounded-sm border md:border-0 border-border">
                    <Meta>VERIFICATION</Meta>
                    <VerificationStatus status={std.verificationStatus || 'UNVERIFIED'} />
                  </div>
                  <div className="flex flex-col gap-1 pointer-events-auto items-end md:items-start bg-surface p-2 rounded-sm border md:border-0 border-border">
                    <Meta>EVIDENCE</Meta>
                    <Mono className="text-sm font-medium">{std.evidenceCount || 0} REFERENCES</Mono>
                  </div>
                  <Button variant="ghost" size="sm" className="pointer-events-auto text-error hover:text-error hover:bg-error/10 uppercase" onClick={() => handleRemoveStandard(std.standard_id || std.id)}>
                    REMOVE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALLIED REFERENCES */}
        <section className="flex flex-col gap-6">
          <SectionHeader number="02" title="ALLIED REFERENCES" />
          <EmptyState title="NOT AVAILABLE" description="Allied references are not returned individually in the basket API payload." />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* BASKET SUMMARY */}
          <section className="flex flex-col gap-6">
            <SectionHeader number="03" title="BASKET SUMMARY" />
            <div className="p-6 border border-border bg-surface rounded-sm">
              <DataList 
                items={[
                  { label: 'PRIMARY STANDARDS', value: standards.filter(s => (s.type || '').includes('PRIMARY')).length.toString().padStart(2, '0') },
                  { label: 'TEST METHODS', value: '00' },
                  { label: 'SAFETY', value: '00' },
                  { label: 'INSTALLATION', value: '00' },
                  { label: 'CERTIFICATION', value: '00' }
                ]}
              />
              <div className="mt-6 pt-6 border-t border-border flex justify-between items-center">
                <Meta>TOTAL REFERENCES</Meta>
                <Mono className="text-lg font-bold">{standards.length}</Mono>
              </div>
            </div>
          </section>

          {/* VERIFICATION GAPS */}
          <section className="flex flex-col gap-6">
            <SectionHeader number="04" title="VERIFICATION GAPS" />
            <EmptyState title="NOT COMPUTED" description="Verification gaps are computed per standard individually, not natively on the session payload." />
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={() => navigate(`/specification-builder?session_id=${sessionId}`)} size="lg" className="w-full sm:w-auto">
            CONTINUE TO SPECIFICATION BUILDER →
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
