import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { SearchInput } from '../ui/SearchInput';
import { Mono, Body, Meta } from '../ui/Typography';
import { mockCandidates } from '../../features/standards/standards.data';
import { mockProcurements } from '../../features/procurements/procurements.data';
import { mockChanges } from '../../features/changes/changes.data';
import { mockDiffFindings } from '../../features/tender-diff/tender-diff.data';

interface SearchResult {
  id: string;
  type: 'STANDARD' | 'PROCUREMENT' | 'CHANGE' | 'FINDING';
  title: string;
  subtitle: string;
  route: string;
}

export function GlobalSearch({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const getResults = (): SearchResult[] => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Standards
    mockCandidates.forEach(s => {
      if (s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          type: 'STANDARD',
          title: s.id,
          subtitle: s.title,
          route: `/standards/${encodeURIComponent(s.id.toLowerCase().replace(/ /g, '-'))}-${s.year}`
        });
      }
    });

    // Procurements
    mockProcurements.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          type: 'PROCUREMENT',
          title: p.name,
          subtitle: p.category,
          route: '/procurements'
        });
      }
    });

    // Changes
    mockChanges.forEach(c => {
      if (c.standardId.toLowerCase().includes(q) || c.changeType.toLowerCase().includes(q.replace(' ', '_'))) {
        results.push({
          id: c.id,
          type: 'CHANGE',
          title: c.standardId,
          subtitle: c.changeType.replace('_', ' '),
          route: '/changes'
        });
      }
    });

    // Findings
    mockDiffFindings.forEach(f => {
      if (f.requirement.toLowerCase().includes(q) || f.issueType.toLowerCase().includes(q.replace(' ', '_'))) {
        results.push({
          id: f.id,
          type: 'FINDING',
          title: f.requirement,
          subtitle: f.issueType.replace(/_/g, ' '),
          route: '/tender-diff'
        });
      }
    });

    return results.slice(0, 8); // limit results
  };

  const results = getResults();
  
  // Group results
  const grouped = results.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleNavigate = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {triggerButton}
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="GLOBAL SEARCH"
      >
        <div className="flex flex-col gap-4 py-4 min-h-[400px]">
          <SearchInput
            placeholder="Search standards, procurements, changes, findings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            autoFocus
          />

          <div className="flex flex-col gap-6 mt-4 overflow-y-auto">
            {query.trim() && results.length === 0 ? (
              <div className="text-center p-8 border border-border bg-surface text-text-muted mt-4">
                <Meta className="mb-2">NO RESULTS</Meta>
                <Body className="text-sm">No matching procurement intelligence records found.</Body>
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="flex flex-col gap-2">
                  <Meta>{type}S</Meta>
                  <div className="flex flex-col gap-1 border border-border bg-surface rounded-sm">
                    {items.map(item => (
                      <div 
                        key={`${item.type}-${item.id}`}
                        className="flex justify-between items-center p-3 border-b border-border last:border-0 hover:bg-surface-elevated cursor-pointer transition-colors"
                        onClick={() => handleNavigate(item.route)}
                      >
                        <div className="flex flex-col gap-1">
                          <Mono className="text-sm font-bold text-text-primary">{item.title}</Mono>
                          <Body className="text-xs text-text-muted">{item.subtitle}</Body>
                        </div>
                        <Mono className="text-xs text-accent uppercase">VIEW →</Mono>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {!query.trim() && (
               <div className="text-center p-8 border border-border bg-surface text-text-muted mt-4 opacity-50">
                 <Mono className="text-sm">TYPE TO SEARCH</Mono>
               </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
