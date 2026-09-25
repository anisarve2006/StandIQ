import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Metric } from '../../components/ui/Metric';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Mono, Body } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useProcurement } from '../../stores/procurement.store';
import { mockProcurements } from './procurements.data';

export default function ProcurementsPage() {
  const navigate = useNavigate();
  const { setCurrentProcurement } = useProcurement();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = mockProcurements.filter(p => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpen = (p: any) => {
    setCurrentProcurement({ id: p.id, name: p.name, category: p.category });
    navigate('/requirements');
  };

  const statusToVariant = (status: string) => {
    if (status === 'READY' || status === 'COMPLETED') return 'success';
    if (status === 'ATTENTION') return 'danger';
    if (status === 'IN_REVIEW' || status === 'DRAFT') return 'warning';
    return 'neutral';
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="PROCUREMENTS"
        title="PROCUREMENT WORKSPACE"
        description="Manage active procurement analyses, drafts, reviews and completed specification packages."
      />

      <div className="flex flex-col gap-12 pb-24">
        <div className="flex justify-between items-center">
          <Button onClick={() => navigate('/procurements/new')}>+ CREATE PROCUREMENT</Button>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-border p-6 bg-surface rounded-sm">
          <Metric value="12" label="ACTIVE" />
          <Metric value="04" label="DRAFTS" />
          <Metric value="05" label="IN REVIEW" />
          <Metric value="18" label="COMPLETED" />
        </section>

        <section className="flex flex-wrap gap-4 p-4 border border-border bg-surface rounded-sm">
          <Select 
            label="STATUS" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              {value: 'ALL', label: 'ALL'},
              {value: 'ACTIVE', label: 'ACTIVE'},
              {value: 'DRAFT', label: 'DRAFT'},
              {value: 'IN_REVIEW', label: 'IN REVIEW'},
              {value: 'ATTENTION', label: 'ATTENTION'},
              {value: 'COMPLETED', label: 'COMPLETED'}
            ]} 
          />
          <div className="flex-1 min-w-[200px]">
            <SearchInput 
              placeholder="SEARCH PROCUREMENTS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
        </section>

        <section>
          {filtered.length === 0 ? (
            <EmptyState 
              eyebrow="NO PROCUREMENTS FOUND"
              description="No procurement matches the current filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PROCUREMENT</TableHead>
                  <TableHead>CATEGORY</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>FINDINGS</TableHead>
                  <TableHead>STANDARDS</TableHead>
                  <TableHead>UPDATED</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <tbody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-text-primary">{p.name}</TableCell>
                    <TableCell><Body className="text-sm">{p.category}</Body></TableCell>
                    <TableCell><Badge variant={statusToVariant(p.status) as any}>{p.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><Mono>{p.findingCount}</Mono></TableCell>
                    <TableCell><Mono>{p.standardCount}</Mono></TableCell>
                    <TableCell><Mono className="text-text-muted">{p.updatedAt}</Mono></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleOpen(p)}>OPEN →</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
