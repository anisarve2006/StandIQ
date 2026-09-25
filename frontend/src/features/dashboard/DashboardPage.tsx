import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { FindingRow } from '../../components/product/Tender';
import { mockDashboardData } from './dashboard.data';
import { VersionTimeline } from '../../components/product/Standards';
import { useNavigate } from 'react-router-dom';
import { useHealth } from '../../hooks/useHealth';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { useProcurements } from '../../hooks/useProcurement';

export default function DashboardPage() {
  const navigate = useNavigate();
  const data = mockDashboardData;
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary();
  const { data: procurementsData, isLoading: procurementsLoading } = useProcurements();


  const changesForTimeline = data.recentChanges.map(c => ({
    date: c.date,
    status: c.type,
    label: c.standardId,
    isCurrent: c.type === 'NEW EDITION'
  }));

  return (
    <PageContainer>
      <PageHeader 
        eyebrow="DASHBOARD"
        title="ATTENTION CENTER"
        description="Monitor procurement standards, tender health, and recent standards changes."
        metadata={`BACKEND HEALTH: ${healthLoading ? 'CHECKING...' : healthError ? 'UNAVAILABLE' : healthData?.status || 'UNKNOWN'}`}
      />

      <div className="flex flex-col gap-16 pb-24">
        
        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Metric value={summaryLoading ? '--' : (summaryData?.active_procurements?.toString() || '00').padStart(2, '0')} label="ACTIVE PROCUREMENTS" />
          <Metric value={summaryLoading ? '--' : (summaryData?.standards_requiring_review?.toString() || '00').padStart(2, '0')} label="STANDARDS REQUIRING REVIEW" />
          <Metric value={summaryLoading ? '--' : (summaryData?.tender_findings?.toString() || '00').padStart(2, '0')} label="TENDER FINDINGS" />
          <Metric value={summaryLoading ? '--' : (summaryData?.certification_gaps?.toString() || '00').padStart(2, '0')} label="CERTIFICATION GAPS" />
        </div>

        {/* ACTIVE PROCUREMENTS */}
        <section>
          <SectionHeader number="02" title="ACTIVE PROCUREMENTS" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procurement</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Standards</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <tbody>
              {procurementsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading procurements...</TableCell>
                </TableRow>
              ) : procurementsData?.sessions && procurementsData.sessions.length > 0 ? (
                procurementsData.sessions.map((p: any) => (
                  <TableRow key={p.session_id} className="cursor-pointer" onClick={() => navigate(`/requirements?session_id=${p.session_id}`)}>
                    <TableCell className="font-medium text-text-primary">{p.title || p.session_id}</TableCell>
                    <TableCell><Body className="text-sm">General</Body></TableCell>
                    <TableCell><Mono>{p.selected_standards?.length || 0}</Mono></TableCell>
                    <TableCell><Mono>{p.tender_findings?.length || 0}</Mono></TableCell>
                    <TableCell><Badge variant="success">READY</Badge></TableCell>
                    <TableCell><Mono className="text-text-muted">Just now</Mono></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-text-muted italic">No active procurements.</TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* REVIEW QUEUE */}
          <section className="lg:col-span-2">
            <SectionHeader number="03" title="REVIEW QUEUE" />
            <div className="flex flex-col gap-4">
              {data.reviewQueue.map((item) => (
                <FindingRow 
                  key={item.id}
                  status={item.type.replace('_', ' ')}
                  title={item.title}
                  description={item.description}
                  actionLabel={item.actionLabel}
                  onAction={() => {}}
                />
              ))}
            </div>
          </section>

          {/* RECENT CHANGES */}
          <section>
            <SectionHeader number="04" title="RECENT STANDARD CHANGES" />
            <div className="p-6 border border-border bg-surface rounded-sm flex flex-col gap-6">
              <Body className="text-xs text-text-muted">DEMO DATA</Body>
              <VersionTimeline versions={changesForTimeline} />
              <Button variant="ghost" size="sm" onClick={() => navigate('/changes')} className="w-full justify-center">VIEW ALL CHANGES →</Button>
            </div>
          </section>

        </div>

        {/* QUICK ACTIONS */}
        <section>
          <SectionHeader number="05" title="QUICK ACTIONS" />
          <div className="flex flex-wrap items-center gap-4">
            <Button>CREATE PROCUREMENT →</Button>
            <Button variant="secondary">ANALYZE TENDER →</Button>
            <Button variant="ghost">SEARCH STANDARDS →</Button>
          </div>
        </section>

      </div>
    </PageContainer>
  );
}
