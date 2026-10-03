import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Check,
  Download,
  ShieldCheck
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { exportDocumentToPdf } from '../../services/pdfExport';

interface AuditItem {
  id: string;
  author: string;
  role: string;
  action: string;
  status: 'Completed' | 'Pending';
  date?: string;
  comment?: string;
}

const getWorkflowSteps = (doc: any, userName: string, userRole: string): AuditItem[] => {
  if (!doc) {
    return [
      {
        id: '1',
        author: userName || 'Procurement Officer',
        role: userRole || 'Tender Lead',
        action: 'Draft tender document creation',
        status: 'Pending',
        date: 'Awaiting Document Upload'
      },
      {
        id: '2',
        author: 'Technical Cell',
        role: 'Engineering Reviewer',
        action: 'Standards clause verification & QCO alignment',
        status: 'Pending',
        date: 'Awaiting Technical Review'
      },
      {
        id: '3',
        author: 'Competent Authority',
        role: 'Sanctioning Officer',
        action: 'Final statutory sanction & GeM publication',
        status: 'Pending',
        date: 'Awaiting Final Approval'
      }
    ];
  }

  return [
    {
      id: '1',
      author: userName || 'Procurement Officer',
      role: userRole || 'Procurement Lead',
      action: `Created tender draft "${doc.fileName}"`,
      status: 'Completed',
      date: doc.uploadedAt || 'Uploaded',
      comment: `Tender registered under ${doc.department || 'Procurement Cell'}. Extracted ${doc.requirements?.length || 0} clauses.`
    },
    {
      id: '2',
      author: 'Technical Evaluation Cell',
      role: 'Standards Reviewer',
      action: 'Verified BIS standards alignment',
      status: doc.status === 'Ready' || doc.status === 'Completed' ? 'Completed' : 'Pending',
      date: doc.status === 'Ready' || doc.status === 'Completed' ? 'Approved' : 'In Review',
      comment: doc.status === 'Ready' || doc.status === 'Completed'
        ? `Validated against national standards. Total ${doc.recommendedStandards?.length || 0} standards linked.`
        : 'Technical scrutiny in progress.'
    },
    {
      id: '3',
      author: 'Sanctioning Authority',
      role: 'Head of Procurement',
      action: 'Final tender approval & publication sanction',
      status: doc.status === 'Completed' ? 'Completed' : 'Pending',
      date: doc.status === 'Completed' ? 'Sanctioned' : 'Awaiting Final Sign-Off'
    }
  ];
};

export default function ApprovalPage() {
  const navigate = useNavigate();
  const { user, activeDocument, basket } = useStandIQ();

  const [commentText, setCommentText] = useState('');
  const [auditFeed, setAuditFeed] = useState<AuditItem[]>(() => getWorkflowSteps(activeDocument, user.name, user.role));
  const [submitted, setSubmitted] = useState(false);
  const [approvedByAuthority, setApprovedByAuthority] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newEntry: AuditItem = {
      id: Date.now().toString(),
      author: user.name,
      role: user.role,
      action: 'Added review note',
      status: 'Completed',
      date: 'Just now',
      comment: commentText.trim()
    };

    setAuditFeed([...auditFeed, newEntry]);
    setCommentText('');
    showToast('Compliance audit note posted.');
  };

  const handleSendApproval = () => {
    setSubmitted(true);
    showToast('Tender package dispatched to Sanctioning Authority.');
    setTimeout(() => {
      navigate('/export');
    }, 1200);
  };

  const handleDirectSignOff = () => {
    setApprovedByAuthority(true);
    const signEntry: AuditItem = {
      id: Date.now().toString(),
      author: `${user.name} (Acting Sanction Authority)`,
      role: 'Sanctioning Officer',
      action: 'Granted Final Publication Sanction',
      status: 'Completed',
      date: 'Just now',
      comment: 'Official approval granted. Technical requirements and BIS compliance verified.'
    };
    setAuditFeed(prev => [...prev.slice(0, 3), signEntry]);
    showToast('Tender formally sanctioned! Ready for publication.');
  };

  const handleExportPdf = () => {
    if (activeDocument) {
      exportDocumentToPdf(activeDocument, basket);
      showToast('Exporting tender approval report PDF...');
    } else {
      showToast('Please select a tender document to export.');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approval Workflow & Sign-Off</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track multi-tier procurement approvals, record compliance notes, and finalize tender sanctions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportPdf}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xs text-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Report</span>
          </button>

          {!approvedByAuthority ? (
            <button
              onClick={handleDirectSignOff}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              <span>Sanction Approval</span>
            </button>
          ) : (
            <button
              onClick={handleSendApproval}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs cursor-pointer"
            >
              {submitted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Send className="w-4 h-4" />}
              <span>{submitted ? 'Sent to Export!' : 'Proceed to Export'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tender Header Card */}
      {activeDocument && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Target Procurement</span>
            <span className="font-bold text-slate-900 text-sm">{activeDocument.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono bg-white px-2.5 py-1 rounded border border-amber-200 text-amber-900 font-semibold">
              Compliance Score: {activeDocument.auditSummary?.complianceScore ?? 100}%
            </span>
            <span className="font-mono bg-white px-2.5 py-1 rounded border border-amber-200 text-amber-900 font-semibold">
              Standards: {basket.length}
            </span>
          </div>
        </div>
      )}

      {/* 02. Status Pipeline Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {[
            { title: 'Draft', date: '24 Sep 2026', status: 'completed' },
            { title: 'Technical Review', date: '25 Sep 2026', status: 'completed' },
            { title: 'Compliance Review', date: 'Pending', status: 'in-progress' },
            { title: 'Final Approval', date: 'Pending', status: 'pending' },
          ].map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/70 border border-slate-100">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                  step.status === 'completed'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : step.status === 'in-progress'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                ) : step.status === 'in-progress' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span className="font-mono">{idx + 1}</span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
              <span className={`text-[11px] font-mono mt-0.5 ${step.status === 'in-progress' ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                {step.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 03. Reviewers & Audit Timeline */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Reviewers & Audit Trail</h2>
          <span className="text-xs text-slate-400 font-mono">Tender Ref: TND-2026-089</span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditFeed.map((item) => (
            <div key={item.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.author.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.author}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                      {item.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{item.action}</p>
                  {item.comment && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-1.5 italic">
                      "{item.comment}"
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    item.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {item.status}
                </span>
                {item.date && (
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{item.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Comment Box */}
        <form onSubmit={handlePostComment} className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-3">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment or compliance note..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none shadow-2xs"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Comments are recorded in the official audit history.</span>
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
