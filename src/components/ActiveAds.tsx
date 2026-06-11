import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AD_CAMPAIGNS } from '../data';

interface ActiveAdsProps {
  onNavigate: (path: string) => void;
}

export default function ActiveAds({ onNavigate }: ActiveAdsProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Auto rotate left to right every 8 seconds (8000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % AD_CAMPAIGNS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? AD_CAMPAIGNS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % AD_CAMPAIGNS.length);
  };

  const currentCamp = AD_CAMPAIGNS[activeIdx];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4" id="sh_active_ads_section">
      {/* Center: Main Interactive Big Banner Slider - ONLY raw image without any text overlays and buttons */}
      <div 
        onClick={() => onNavigate(currentCamp.link)}
        className="w-full relative bg-zinc-900 rounded-[18px] overflow-hidden h-[260px] sm:h-[420px] shadow-sm border border-slate-100 cursor-pointer group"
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={currentCamp.image} 
            alt="Hero ad banner"
            className="w-full h-full object-cover select-none transition-transform duration-1000 transform group-hover:scale-101"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Carousel indicator dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
          {AD_CAMPAIGNS.map((_, idx) => (
            <button 
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                activeIdx === idx ? 'bg-[#2E7D32] w-5' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white hover:text-emerald-400 hover:bg-black/60 transition-all z-10 cursor-pointer backdrop-blur-xs"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white hover:text-emerald-400 hover:bg-black/60 transition-all z-10 cursor-pointer backdrop-blur-xs"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
