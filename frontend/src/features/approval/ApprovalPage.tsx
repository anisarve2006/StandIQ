import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  CheckCircle2, 
  Clock, 
  Check
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

interface AuditItem {
  id: string;
  author: string;
  role: string;
  action: string;
  status: 'Completed' | 'Pending';
  date?: string;
  comment?: string;
}

const AUDIT_STEPS: AuditItem[] = [
  {
    id: '1',
    author: 'Anirudh Sarve',
    role: 'Senior Procurement Officer',
    action: 'Created procurement draft & linked IS 12615:2018',
    status: 'Completed',
    date: '24 Sep 2026, 10:30 AM',
    comment: 'All 5 recommended BIS standards incorporated with IE3 performance requirements.'
  },
  {
    id: '2',
    author: 'Technical Team',
    role: 'Engineering Reviewer',
    action: 'Reviewed standards selection and efficiency parameters',
    status: 'Completed',
    date: '25 Sep 2026, 03:15 PM',
    comment: 'Technical specifications approved. Aligns with tender energy efficiency mandate.'
  },
  {
    id: '3',
    author: 'Compliance Team',
    role: 'Quality & Regulatory Inspector',
    action: 'Reviewing for BIS CRS certification requirements',
    status: 'Pending',
    date: 'Under Review'
  },
  {
    id: '4',
    author: 'Head of Procurement',
    role: 'Sanctioning Authority',
    action: 'Final tender approval & publication sanction',
    status: 'Pending',
    date: 'Awaiting Compliance'
  }
];

export default function ApprovalPage() {
  const navigate = useNavigate();
  const { user } = useStandIQ();

  const [commentText, setCommentText] = useState('');
  const [auditFeed, setAuditFeed] = useState<AuditItem[]>(AUDIT_STEPS);
  const [submitted, setSubmitted] = useState(false);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newEntry: AuditItem = {
      id: Date.now().toString(),
      author: `${user.name} Sarve`,
      role: user.role,
      action: 'Added comment',
      status: 'Completed',
      date: 'Just now',
      comment: commentText.trim()
    };

    setAuditFeed([...auditFeed, newEntry]);
    setCommentText('');
  };

  const handleSendApproval = () => {
    setSubmitted(true);
    setTimeout(() => {
      navigate('/export');
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approval Workflow</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track approval status and manage reviews.
          </p>
        </div>

        <button
          onClick={handleSendApproval}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] text-xs sm:text-sm self-start sm:self-auto"
        >
          {submitted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Send className="w-4 h-4" />}
          <span>{submitted ? 'Sent for Approval!' : 'Send for Approval'}</span>
        </button>
      </div>

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
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
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
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-2xs"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Comments are recorded in the official audit history.</span>
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
