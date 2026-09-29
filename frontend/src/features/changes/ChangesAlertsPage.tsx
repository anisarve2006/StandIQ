import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCheck, 
  ExternalLink, 
  BookOpen
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';
import { getChanges } from '../../services/changesApi';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  type: 'Amendment' | 'Update' | 'New' | 'Notification';
  typeColor: string;
  date: string;
  standardCode?: string;
  unread: boolean;
}

export default function ChangesAlertsPage() {
  const navigate = useNavigate();
  const { markAlertsAsRead, formatDate } = useStandIQ();

  const [activeTab, setActiveTab] = useState<'All' | 'Standard Updates' | 'Amendments' | 'Notifications'>('All');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getChanges()
      .then(res => {
        if (!mounted) return;
        if (res?.changes && Array.isArray(res.changes)) {
          const mapped: AlertItem[] = res.changes.map((c, i) => {
            const isAmend = c.change_type?.toLowerCase().includes('amend');
            const isNew = c.change_type?.toLowerCase().includes('new');
            const isNotif = c.change_type?.toLowerCase().includes('notif') || c.change_type?.toLowerCase().includes('order');
            const type = isAmend ? 'Amendment' : isNew ? 'New' : isNotif ? 'Notification' : 'Update';
            
            return {
              id: c.id || `change-${i}`,
              title: `${c.standard_id} — ${c.change_type || 'Standard Revision'}`,
              description: c.impact || `Standard version transitioned from ${c.previous_version || 'previous'} to ${c.current_version || 'current'}.`,
              type,
              typeColor: isAmend 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : isNew 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isNotif
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-blue-50 text-blue-700 border-blue-200',
              date: c.date || 'Recent',
              standardCode: c.standard_id,
              unread: true
            };
          });
          setAlerts(mapped);
        } else {
          setAlerts([]);
        }
      })
      .catch(() => {
        if (mounted) setAlerts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
    markAlertsAsRead();
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'Standard Updates' && a.type !== 'Update' && a.type !== 'New') return false;
    if (activeTab === 'Amendments' && a.type !== 'Amendment') return false;
    if (activeTab === 'Notifications' && a.type !== 'Notification') return false;
    return true;
  });

  const allCount = alerts.length;
  const updatesCount = alerts.filter(a => a.type === 'Update' || a.type === 'New').length;
  const amendmentsCount = alerts.filter(a => a.type === 'Amendment').length;
  const notificationsCount = alerts.filter(a => a.type === 'Notification').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Changes & Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of Indian Standard revisions, Quality Control Orders (QCOs), and Gazette notifications.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-xs self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* 02. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'All', label: 'All', count: allCount },
          { key: 'Standard Updates', label: 'Standard Updates', count: updatesCount },
          { key: 'Amendments', label: 'Amendments', count: amendmentsCount },
          { key: 'Notifications', label: 'Notifications', count: notificationsCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 pt-1 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 03. Alert Cards List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-2" />
            Loading regulatory changes...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 my-6">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">All Clear — No Active Alerts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              There are no pending Gazette notifications, QCO revisions, or standard amendments for your tracked procurement specifications.
            </p>
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.unread ? 'border-blue-200 bg-blue-50/10' : 'border-slate-200/90'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.typeColor}`}>
                    {item.type}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{formatDate(item.date)}</span>
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread alert" />
                  )}
                </div>

                <h2 
                  onClick={() => {
                    if (item.standardCode) {
                      navigate(`/standards`);
                    }
                  }}
                  className={`text-sm font-bold text-slate-900 transition-colors ${item.standardCode ? 'hover:text-blue-600 cursor-pointer' : ''}`}
                >
                  {item.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  onClick={() => {
                    setAlerts(prev => prev.map(a => a.id === item.id ? { ...a, unread: !a.unread } : a));
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Toggle Read/Unread"
                >
                  {item.unread ? 'Mark read' : 'Unread'}
                </button>
                {item.standardCode && (
                  <button
                    onClick={() => navigate(`/standards`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspect Standard</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/tender-health')}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="View Impact in Tender Health"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
