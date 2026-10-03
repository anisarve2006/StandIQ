import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, ArrowRight, Building, Mail, User, Sparkles } from 'lucide-react';
import BISenseLogo from './BISenseLogo';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Anirudh Sarve',
    email: 'anirudh@example.gov.in',
    organization: 'National Infrastructure & Procurement Board',
    role: 'Chief Procurement Officer / Senior Engineer',
    interest: 'Tender Health & Knowledge Graph',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleLaunchDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BISenseLogo size="sm" />
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                Live Guided Walkthrough
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              Experience BISense in Action
            </h3>
            <p className="text-sm text-slate-600 mt-1 mb-6">
              See how our AI engine uncovers hidden cross-references and automates compliance for your procurement tenders.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder="you@department.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Organization / Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    placeholder="e.g. CPWD, BHEL, Indian Railways"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Area of Interest
                </label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option>Tender Health & Gap Diagnostics</option>
                  <option>Indian Standards Knowledge Graph</option>
                  <option>GeM BoQ Specification Builder</option>
                  <option>Quality Control Order (QCO) Tracking</option>
                  <option>Full Enterprise Deployment</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Request Live Demonstration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLaunchDashboard}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Or enter live interactive workspace immediately</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Demo Request Received!
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Our standards intelligence specialist will contact <strong className="text-slate-900">{formData.email}</strong> within 4 business hours.
            </p>

            <div className="pt-4">
              <button
                onClick={handleLaunchDashboard}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Launch Interactive Workspace Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDemoModal;
