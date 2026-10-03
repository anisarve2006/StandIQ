import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Factory, Building2, Box, ShieldCheck } from 'lucide-react';
import HeroMockupPreview from './HeroMockupPreview';

interface HeroSectionProps {
  onSeeHowItWorksClick: () => void;
  onSelectSector?: (sector: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSeeHowItWorksClick,
  onSelectSector,
}) => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    // Navigates directly to dashboard
    navigate('/dashboard');
  };

  return (
    <section className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden bg-gradient-to-b from-[#faf8f5] via-[#fdfbf7] to-white">
      {/* Delhi Landmarks Architectural Background Watermark */}
      <div className="absolute top-0 inset-x-0 h-[480px] pointer-events-none overflow-hidden select-none opacity-25 mix-blend-multiply flex items-center justify-center">
        <img
          src="/delhi_watermark.jpg"
          alt="Indian Standards Heritage Background"
          className="w-full max-w-7xl h-full object-contain object-top"
          loading="eager"
        />
        {/* Soft gradient mask to blend smoothly into page */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#faf8f5]/40 to-[#faf8f5]" />
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-200/30 via-amber-100/20 to-orange-100/30 blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Content Center */}
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge: Intelligence for Indian Standards */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-orange-200/90 shadow-xs mb-8 transition-transform hover:scale-105 duration-200 cursor-default">
            {/* Small orange square badge with logo mark */}
            <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center p-0.5 shadow-xs">
              <img src="/logo.png" alt="BISense Logo" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
            </div>
            <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
              Intelligence for Indian Standards
            </span>
          </div>

          {/* Main Headline: Serif Editorial Masterpiece */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal tracking-tight text-slate-900 leading-[1.06] mb-6">
            Understand standards.
            <br />
            Build with confidence.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-sans max-w-2xl mx-auto leading-relaxed mb-8">
            AI-powered standards intelligence that helps teams discover requirements, 
            connect related standards, and turn complex BIS information into actionable compliance workflows.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {/* Primary Dark Button -> Explore BISense */}
            <button
              id="hero-explore-btn"
              onClick={handleExploreClick}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-base font-semibold text-white bg-slate-900 hover:bg-black transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
            >
              <span>Explore BISense</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Secondary Button -> See how it works */}
            <button
              id="hero-how-it-works-btn"
              onClick={onSeeHowItWorksClick}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-base font-medium text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
              <span>See how it works</span>
            </button>
          </div>

          {/* Sector Tags Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 md:gap-6 mb-12">
            
            {/* Sector 1: Manufacturing */}
            <button
              onClick={() => onSelectSector?.('manufacturing')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 text-xs md:text-sm font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <span className="p-1 rounded bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                <Factory className="w-3.5 h-3.5 text-orange-500" />
              </span>
              <span>Manufacturing</span>
            </button>

            {/* Sector 2: Infrastructure */}
            <button
              onClick={() => onSelectSector?.('infrastructure')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 text-xs md:text-sm font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <span className="p-1 rounded bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
              </span>
              <span>Infrastructure</span>
            </button>

            {/* Sector 3: Consumer Products */}
            <button
              onClick={() => onSelectSector?.('consumer')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 text-xs md:text-sm font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <span className="p-1 rounded bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                <Box className="w-3.5 h-3.5 text-orange-500" />
              </span>
              <span>Consumer Products</span>
            </button>

            {/* Sector 4: Quality Teams */}
            <button
              onClick={() => onSelectSector?.('quality')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white border border-slate-200/80 hover:border-orange-300 text-xs md:text-sm font-semibold text-slate-700 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <span className="p-1 rounded bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
              </span>
              <span>Quality Teams</span>
            </button>

          </div>

        </div>

        {/* Floating Mockup Preview Component */}
        <div className="mt-2 md:mt-4">
          <HeroMockupPreview />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
