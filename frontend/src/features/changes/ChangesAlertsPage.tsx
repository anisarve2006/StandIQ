import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCheck, 
  ExternalLink, 
  BookOpen
} from 'lucide-react';
import { useStandIQ } from '../../stores/standiq.store';

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

const ALL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    title: 'IS 12615:2018 - Amendment 2 published',
    description: 'Energy Efficient Induction Motors (Three-phase) — Updated test protocols for loss summation and harmonic limits.',
    type: 'Amendment',
    typeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    date: '24 Sep 2026',
    standardCode: 'IS 12615:2018',
    unread: true
  },
  {
    id: 'alt-2',
    title: 'IS 325:1996 - Under Review',
    description: 'Standard is under review for revision by the Electrotechnical Sectional Committee (ETD 15).',
    type: 'Update',
    typeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '20 Sep 2026',
    standardCode: 'IS 325:1996',
    unread: true
  },
  {
    id: 'alt-3',
    title: 'New Standard Published',
    description: 'IS 17428:2023 - Battery Management System for Electric Mobility Applications.',
    type: 'New',
    typeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    date: '18 Sep 2026',
    standardCode: 'IS 17428:2023',
    unread: true
  },
  {
    id: 'alt-4',
    title: 'IS 8789:1981 - Reaffirmation Confirmed',
    description: 'Reaffirmed by Sectional Committee without technical modifications for next 5-year cycle.',
    type: 'Update',
    typeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    date: '14 Sep 2026',
    standardCode: 'IS 8789:1981',
    unread: false
  },
  {
    id: 'alt-5',
    title: 'QCO Notification for Industrial Cables',
    description: 'Ministry of Heavy Industries mandatory certification order enforcement date extended by 90 days.',
    type: 'Notification',
    typeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    date: '10 Sep 2026',
    unread: false
  }
];

export default function ChangesAlertsPage() {
  const navigate = useNavigate();
  const { markAlertsAsRead, formatDate } = useStandIQ();

  const [activeTab, setActiveTab] = useState<'All' | 'Standard Updates' | 'Amendments' | 'Notifications'>('All');
  const [alerts, setAlerts] = useState<AlertItem[]>(ALL_ALERTS);

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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 01. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Changes & Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay updated with standard revisions, amendments and relevant notifications.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] text-xs self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-blue-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* 02. Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'All', label: 'All', count: 12 },
          { key: 'Standard Updates', label: 'Standard Updates', count: 8 },
          { key: 'Amendments', label: 'Amendments', count: 2 },
          { key: 'Notifications', label: 'Notifications', count: 2 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 pt-1 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* 03. Alert Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.map((item) => (
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
                    navigate(`/standards/${encodeURIComponent(item.standardCode)}`);
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
                  onClick={() => navigate(`/standards/${encodeURIComponent(item.standardCode || '')}`)}
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
        ))}
      </div>
    </div>
  );
}
