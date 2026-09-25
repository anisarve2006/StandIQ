import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { Metric } from '../../components/ui/Metric';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body, Meta } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { FindingRow } from '../../components/product/Tender';
import { VersionTimeline } from '../../components/product/Standards';
import { useProcurement } from '../../stores/procurement.store';
import { mockChanges } from './changes.data';
import type { StandardChange } from './changes.types';

export default function ChangesAlertsPage() {
  const navigate = useNavigate();
  const { setCurrentProcurement } = useProcurement();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedChange, setSelectedChange] = useState<StandardChange | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = mockChanges.filter(c => {
    if (filter !== 'ALL' && c.changeType !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.standardId.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenProcurement = (proc: any) => {
    setCurrentProcurement({ id: proc.id, name: proc.name, category: 'Unknown' });
    navigate('/requirements');
  };

  const toggleDismiss = (id: string) => {
    const newSet = new Set(dismissed);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setDismissed(newSet);
  };

  const timelineData = mockChanges.slice(0, 3).map(c => ({
    date: c.date,
    status: c.changeType.replace('_', ' '),
    label: `${c.standardId}: ${c.currentVersion !== '—' ? c.currentVersion : c.previousVersion}`,
    isCurrent: c.changeType === 'NEW_EDITION'
  }));

  const reviewRequired = mockChanges.filter(c => c.affectedProcurements.length > 0 && !dismissed.has(c.id));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CHANGES & ALERTS"
        title="STANDARD CHANGE MONITOR"
        description="Track new editions, amendments, reaffirmations, superseded standards and withdrawals."
      />

      <div className="flex flex-col gap-12 pb-24">
        
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value="05" label="NEW EDITIONS" />
          <Metric value="03" label="AMENDMENTS" />
          <Metric value="02" label="SUPERSEDED" />
          <Metric value="01" label="WITHDRAWN" />
        </section>

        <section className="flex flex-wrap gap-4 p-4 border border-border bg-surface rounded-sm">
          <Select 
            label="TYPE" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              {value: 'ALL', label: 'ALL'},
              {value: 'NEW_EDITION', label: 'NEW EDITION'},
              {value: 'AMENDMENT', label: 'AMENDMENT'},
              {value: 'REAFFIRMED', label: 'REAFFIRMED'},
              {value: 'SUPERSEDED', label: 'SUPERSEDED'},
              {value: 'WITHDRAWN', label: 'WITHDRAWN'},
              {value: 'UNDER_REVISION', label: 'UNDER REVISION'}
            ]} 
          />
          <div className="flex-1 min-w-[200px]">
            <SearchInput 
              placeholder="SEARCH STANDARDS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <section className="lg:col-span-2 flex flex-col gap-6">
            <SectionHeader number="01" title="CHANGES" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STANDARD</TableHead>
                  <TableHead>CHANGE</TableHead>
                  <TableHead>PREVIOUS</TableHead>
                  <TableHead>CURRENT</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>IMPACT</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filtered.map(c => (
                  <TableRow key={c.id} className={dismissed.has(c.id) ? 'opacity-50' : ''}>
                    <TableCell className="font-medium text-text-primary">{c.standardId}</TableCell>
                    <TableCell><Badge variant="neutral">{c.changeType.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><Mono className="text-sm">{c.previousVersion}</Mono></TableCell>
                    <TableCell><Mono className="text-sm">{c.currentVersion}</Mono></TableCell>
                    <TableCell><Mono className="text-sm">{c.date}</Mono></TableCell>
                    <TableCell>
                      <Badge variant={c.impact === 'HIGH' ? 'danger' : c.impact === 'MEDIUM' ? 'warning' : 'neutral'}>{c.impact}</Badge>
                    </TableCell>
                    <TableCell>
                      {dismissed.has(c.id) ? (
                        <Button variant="ghost" size="sm" onClick={() => toggleDismiss(c.id)}>RESTORE</Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedChange(c)}>REVIEW →</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </section>

          <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-6">
              <SectionHeader number="02" title="RECENT CHANGE TIMELINE" />
              <div className="p-6 border border-border bg-surface rounded-sm">
                <VersionTimeline versions={timelineData} />
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHeader number="03" title="REVIEW REQUIRED" />
              <div className="flex flex-col gap-4">
                {reviewRequired.length === 0 ? (
                  <Body className="text-sm text-text-muted italic">No immediate reviews required.</Body>
                ) : reviewRequired.map(c => (
                  c.affectedProcurements.map(p => (
                    <FindingRow
                      key={`${c.id}-${p.id}`}
                      status={c.changeType.replace('_', ' ')}
                      title={p.name}
                      description={`${c.standardId}`}
                      actionLabel="REVIEW"
                      onAction={() => handleOpenProcurement(p)}
                    />
                  ))
                ))}
              </div>
            </section>
          </div>

        </div>
      </div>

      <Dialog
        isOpen={!!selectedChange}
        onClose={() => setSelectedChange(null)}
        title="STANDARD CHANGE"
        footer={<><Button variant="ghost" onClick={() => { if(selectedChange) toggleDismiss(selectedChange.id); setSelectedChange(null); }}>DISMISS</Button><Button onClick={() => setSelectedChange(null)}>CLOSE</Button></>}
      >
        {selectedChange && (
          <div className="flex flex-col gap-8 py-2">
            <div className="flex flex-col gap-1">
              <Mono className="text-lg font-bold text-text-primary">{selectedChange.standardId}</Mono>
              <Badge variant="neutral" className="w-fit mt-2">{selectedChange.changeType.replace('_', ' ')}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-border">
              <div className="flex flex-col gap-2">
                <Meta>PREVIOUS</Meta>
                <Mono className="text-sm">{selectedChange.previousVersion}</Mono>
              </div>
              <div className="flex flex-col gap-2">
                <Meta>CURRENT</Meta>
                <Mono className="text-sm text-text-primary">{selectedChange.currentVersion}</Mono>
              </div>
              <div className="flex flex-col gap-2">
                <Meta>EFFECTIVE</Meta>
                <Mono className="text-sm">{selectedChange.date}</Mono>
              </div>
              <div className="flex flex-col gap-2">
                <Meta>IMPACT</Meta>
                <Badge variant={selectedChange.impact === 'HIGH' ? 'danger' : selectedChange.impact === 'MEDIUM' ? 'warning' : 'neutral'} className="w-fit">{selectedChange.impact}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Meta>AFFECTED PROCUREMENTS</Meta>
              {selectedChange.affectedProcurements.length === 0 ? (
                <Body className="text-sm text-text-muted italic">No active procurements affected.</Body>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedChange.affectedProcurements.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 border border-border bg-surface hover:bg-surface-elevated transition-colors cursor-pointer rounded-sm" onClick={() => handleOpenProcurement(p)}>
                      <Body className="text-sm font-medium text-text-primary">{p.name}</Body>
                      <Badge variant={p.status === 'IN REVIEW' ? 'warning' : 'neutral'}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 p-4 border-l-2 border-accent bg-surface-elevated rounded-r-sm mt-4">
              <Meta>RECOMMENDED ACTION</Meta>
              <Body className="text-sm">Review the referenced edition and determine whether the procurement specification requires an update.</Body>
            </div>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
