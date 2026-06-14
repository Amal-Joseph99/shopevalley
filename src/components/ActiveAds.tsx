import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ActiveAdsProps {
  onNavigate: (path: string) => void;
}

interface AdCampaign {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  badge: string;
  display_order: number;
}

export default function ActiveAds({ onNavigate }: ActiveAdsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'Active')
        .order('display_order', { ascending: true });
      if (data && data.length > 0) setCampaigns(data);
      setIsLoading(false);
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % campaigns.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [campaigns.length]);

  if (isLoading || campaigns.length === 0) return null;

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? campaigns.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % campaigns.length);
  };

  const currentCamp = campaigns[activeIdx];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4" id="sh_active_ads_section">
      <div 
        onClick={() => currentCamp.link && onNavigate(currentCamp.link)}
        className="w-full relative bg-zinc-900 rounded-[18px] overflow-hidden h-[260px] sm:h-[420px] shadow-sm border border-slate-100 cursor-pointer group"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={currentCamp.image_url} 
            alt={currentCamp.title}
            className="w-full h-full object-cover select-none transition-transform duration-1000 transform group-hover:scale-101"
            referrerPolicy="no-referrer"
          />
        </div>

        {campaigns.length > 1 && (
          <>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs">
              {campaigns.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activeIdx === idx ? 'bg-[#7c3aed] w-5' : 'bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white hover:text-violet-400 hover:bg-black/60 transition-all z-10 cursor-pointer backdrop-blur-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 text-white hover:text-violet-400 hover:bg-black/60 transition-all z-10 cursor-pointer backdrop-blur-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
