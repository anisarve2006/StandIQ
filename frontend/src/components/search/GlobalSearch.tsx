import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { SearchInput } from '../ui/SearchInput';
import { Mono, Body, Meta } from '../ui/Typography';
import { useStandIQ } from '../../stores/standiq.store';

interface SearchResult {
  id: string;
  type: 'PAGE' | 'DOCUMENT' | 'STANDARD' | 'CLAUSE';
  title: string;
  subtitle: string;
  route: string;
}

const SYSTEM_PAGES: SearchResult[] = [
  { id: 'page-review', type: 'PAGE', title: 'Review & Verify', subtitle: 'Extract requirements, clauses, and mandatory BIS standards', route: '/review' },
  { id: 'page-standards', type: 'PAGE', title: 'Standards Search', subtitle: 'Search 25,000+ Indian Standards (IS), ISO, and IEC specifications', route: '/standards' },
  { id: 'page-health', type: 'PAGE', title: 'Tender Health Scorer', subtitle: 'GFR 2017 Rule 144(i), CVC brand bias, and CAG compliance auditor', route: '/tender-health' },
  { id: 'page-diff', type: 'PAGE', title: 'Specification Diff', subtitle: 'Line-by-line comparison between original and standardized tenders', route: '/tender-diff' },
  { id: 'page-builder', type: 'PAGE', title: 'Specification Builder', subtitle: 'Compile and export fortified tender specifications', route: '/specification-builder' },
  { id: 'page-procurements', type: 'PAGE', title: 'Procurement Schedule', subtitle: 'Active tender files and procurement tracking', route: '/procurements' },
  { id: 'page-changes', type: 'PAGE', title: 'Regulatory Changes & Alerts', subtitle: 'Gazette notifications, quality control orders, and revisions', route: '/changes' },
  { id: 'page-approval', type: 'PAGE', title: 'Audit & Approval Workflow', subtitle: 'Sign-off audit trail and compliance verification', route: '/approval' }
];

export function GlobalSearch({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { documents, basket, setActiveDocId } = useStandIQ();

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
    
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // 1. Search System Navigation
    SYSTEM_PAGES.forEach(page => {
      if (page.title.toLowerCase().includes(q) || page.subtitle.toLowerCase().includes(q)) {
        results.push(page);
      }
    });

    // 2. Search Real Documents
    documents.forEach(doc => {
      if (
        doc.title.toLowerCase().includes(q) || 
        doc.fileName.toLowerCase().includes(q) || 
        doc.department.toLowerCase().includes(q)
      ) {
        results.push({
          id: doc.id,
          type: 'DOCUMENT',
          title: doc.fileName,
          subtitle: `${doc.department} • ${doc.status}`,
          route: '/review'
        });
      }
    });

    // 3. Search Standards Basket
    basket.forEach(std => {
      if (std.code.toLowerCase().includes(q) || std.title.toLowerCase().includes(q)) {
        results.push({
          id: std.code,
          type: 'STANDARD',
          title: std.code,
          subtitle: std.title,
          route: `/standards`
        });
      }
    });

    // 4. Search Extracted Clauses in Documents
    documents.forEach(doc => {
      (doc.requirements || []).forEach(req => {
        if (req.requirementText.toLowerCase().includes(q) || (req.title && req.title.toLowerCase().includes(q))) {
          if (!results.some(r => r.id === `req-${req.id}`)) {
            results.push({
              id: `req-${req.id}`,
              type: 'CLAUSE',
              title: req.title || `Clause ${req.clauseNumber || req.id}`,
              subtitle: req.requirementText.slice(0, 80) + '...',
              route: '/review'
            });
          }
        }
      });
    });

    return results.slice(0, 8);
  };

  const results = getResults();
  
  // Group results
  const grouped = results.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleNavigate = (route: string, docId?: string) => {
    setIsOpen(false);
    if (docId) {
      setActiveDocId(docId);
    }
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
        <div className="flex flex-col gap-4 py-4 min-h-[380px]">
          <SearchInput
            placeholder="Search navigation, documents, standards, clauses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            autoFocus
          />

          <div className="flex flex-col gap-6 mt-2 overflow-y-auto">
            {query.trim() && results.length === 0 ? (
              <div className="text-center p-8 border border-border bg-surface text-text-muted mt-4">
                <Meta className="mb-2">NO RESULTS</Meta>
                <Body className="text-sm">No matching navigation pages, documents, or standards found.</Body>
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
                        onClick={() => handleNavigate(item.route, item.type === 'DOCUMENT' ? item.id : undefined)}
                      >
                        <div className="flex flex-col gap-0.5 max-w-[85%]">
                          <Mono className="text-sm font-bold text-text-primary">{item.title}</Mono>
                          <Body className="text-xs text-text-muted truncate">{item.subtitle}</Body>
                        </div>
                        <Mono className="text-xs text-accent uppercase shrink-0">VIEW →</Mono>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
            
            {!query.trim() && (
              <div className="p-6 border border-border bg-surface/50 text-text-muted mt-2 rounded-sm space-y-2">
                <Mono className="text-xs uppercase text-text-primary block font-bold">Quick Jump Suggestions</Mono>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {SYSTEM_PAGES.slice(0, 6).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleNavigate(p.route)}
                      className="text-left p-2 rounded border border-border bg-surface hover:bg-surface-elevated transition-colors text-text-primary flex flex-col cursor-pointer"
                    >
                      <span className="font-semibold">{p.title}</span>
                      <span className="text-[11px] text-text-muted truncate">{p.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
