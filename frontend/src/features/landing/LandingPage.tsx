import React, { useState } from 'react';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import PillarsSection from './components/PillarsSection';
import SectorSolutions from './components/SectorSolutions';
import ComparisonSection from './components/ComparisonSection';
import LandingFooter from './components/LandingFooter';
import BookDemoModal from './components/BookDemoModal';
import HowItWorksModal from './components/HowItWorksModal';

export const LandingPage: React.FC = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Fixed / Sticky Navigation Bar */}
      <LandingNavbar onBookDemoClick={() => setDemoModalOpen(true)} />

      {/* Hero Section with Watermark Background & Pixel-Perfect Dashboard Mockup */}
      <main>
        <HeroSection 
          onSeeHowItWorksClick={() => setHowItWorksModalOpen(true)}
          onSelectSector={(_sector) => {
            const el = document.getElementById('features-overview');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Feature Pillars: Standards, Knowledge Graph, Compliance, Spec Builder */}
        <PillarsSection />

        {/* Industry / Sector Solutions */}
        <SectorSolutions />

        {/* Traditional Search vs BISense AI Platform */}
        <ComparisonSection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Interactive Modals */}
      <BookDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />

      <HowItWorksModal
        isOpen={howItWorksModalOpen}
        onClose={() => setHowItWorksModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
