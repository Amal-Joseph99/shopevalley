import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ActiveAdsProps {
  onNavigate: (path: string) => void;
}

interface AdBanner {
  id: string;
  image_url: string;
  image_path: string;
}

export default function ActiveAds(_props: ActiveAdsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from('ad_campaigns')
        .select('id, image_url, image_path')
        .eq('status', 'Active')
        .order('display_order', { ascending: true })
        .limit(5);

      if (data && data.length > 0) {
        const resolved = data.map(ad => {
          let finalUrl = ad.image_url || '';
          if (ad.image_path) {
            const { data: urlData } = supabase.storage.from('ad-banners').getPublicUrl(ad.image_path);
            if (urlData?.publicUrl) finalUrl = urlData.publicUrl;
          }
          return { ...ad, image_url: finalUrl };
        });
        setBanners(resolved);
      }
      setIsLoading(false);
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="w-full px-4 sm:px-6 pt-2 pb-1" id="sh_hero_ads_carousel">
      <div className="relative w-full max-w-7xl mx-auto h-[300px] rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.image_url}
              alt=""
              className="w-full h-full object-contain bg-white"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>
        ))}

        {banners.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition-all cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition-all cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeIdx === idx ? 'bg-blue-600 w-6' : 'bg-white/70 hover:bg-white border border-slate-300'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
