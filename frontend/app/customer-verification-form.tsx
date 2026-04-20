import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Link as LinkIcon, 
  Paperclip, 
  Calendar,
  Play,
  MoreHorizontal
} from 'lucide-react-native';

// Auth Constants
const AUTH_ACCESS_KEY = 'access_token';
const AUTH_REFRESH_KEY = 'refresh_token';
const API_BASE = 'https://your-api-base.com';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // --- Auth Logic ---
  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      // Using localStorage for Web (standard replacement for AsyncStorage)
      const token = localStorage.getItem(AUTH_ACCESS_KEY);
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile/`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        
        if (res.status === 401) {
          localStorage.removeItem(AUTH_ACCESS_KEY);
          localStorage.removeItem(AUTH_REFRESH_KEY);
          if (!cancelled) {
             // Redirecting to auth if unauthorized
             window.location.href = '/auth';
          }
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error("Auth check failed", err);
        // Set loading to false for previewing purposes if API is unreachable
        setLoading(false); 
      }
    };

    checkAuth();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f7ff] font-sans text-slate-500">
        Verifying session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-8 font-sans text-slate-700">
      <main className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold text-[#2a59c3] mb-8 leading-tight">Customer Verification Form</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Header: Business Info */}
            <div className="flex items-center justify-between p-4 bg-[#f8faff] rounded-xl border border-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#3b63cc] rounded-xl flex items-center justify-center text-white text-2xl shadow-inner">
                  🍜
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Mama Rosa's Kitchen</h3>
                  <p className="text-[11px] text-slate-400 font-medium italic">Italian · 142 Orchard St, New York, NY</p>
                </div>
              </div>
              <span className="bg-[#e7f9f0] text-[#28a745] text-[10px] font-bold px-3 py-1 rounded-full border border-[#d1f2e0]">
                ✓ Registered
              </span>
            </div>

            {/* Inputs: Category & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Business Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-400 focus:ring-2 focus:ring-blue-100 outline-none appearance-none cursor-pointer">
                    <option>Select category</option>
                  </select>
                  <div className="absolute right-3 top-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Visit Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" placeholder="mm/dd/yyyy" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none placeholder:text-slate-300" />
                  <Calendar className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section: Video Review Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <Camera className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Video Review Details</h4>
                  <p className="text-[11px] text-slate-500">Tell us about the video you posted.</p>
                </div>
              </div>

              {/* Video Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Video Title <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Trying the BEST hidden ramen spot in NYC 🍜" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm placeholder:text-slate-300" />
              </div>

              {/* Platform Selector (Togglable) */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Platform Posted On <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'TikTok', icon: <Play className="w-3.5 h-3.5 fill-current" />, label: 'TikTok' },
                    { id: 'Instagram', icon: <Camera className="w-3.5 h-3.5" />, label: 'Instagram Reels' },
                    { id: 'YouTube', icon: <Play className="w-3.5 h-3.5" />, label: 'YouTube Shorts' },
                    { id: 'Other', icon: <MoreHorizontal className="w-3.5 h-3.5" />, label: 'Other' },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => setSelectedPlatform(prev => prev === platform.id ? null : platform.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all border-2 ${
                        selectedPlatform === platform.id
                          ? 'border-[#3b63cc] text-[#3b63cc] bg-blue-50/50'
                          : 'border-slate-200 text-slate-600 font-semibold hover:bg-slate-50'
                      }`}
                    >
                      {platform.icon} {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Video Link <span className="text-red-500">*</span></label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="https://www.tiktok.com/@yourhandle/video/..." className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-xs" />
                </div>
                <p className="text-[10px] text-slate-400 italic">Paste the direct public URL to your video. Make sure it's set to public.</p>
              </div>

              {/* Brief Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Brief Description of Review</label>
                <textarea rows="3" placeholder="Summarize what you covered in your video — dishes tried, atmosphere, overall impression..." className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-xs resize-none placeholder:text-slate-300"></textarea>
              </div>

              {/* Claimed View Count */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Claimed View Count <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. 15000" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                <p className="text-[10px] text-slate-400">Enter the total views at the time of submission. You can re-submit to update.</p>
              </div>

              {/* View Tier Display */}
              <div className="bg-[#eff6ff] p-5 rounded-xl flex justify-between items-center border border-blue-100 shadow-sm">
                <div className="space-y-1">
                  <div className="w-10 h-0.5 bg-slate-400 rounded-full"></div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">claimed views</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-extrabold text-[#1e56a0]">Estimated Reward Tier</p>
                  <p className="text-[10px] text-slate-500">Enter a view count above</p>
                </div>
              </div>

              {/* Screenshot Proof */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#1e56a0] uppercase tracking-widest">Screenshot Proof <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-blue-100 rounded-xl p-10 flex flex-col items-center justify-center bg-[#fdfeff] hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <Paperclip className="w-6 h-6 text-slate-300 mb-2 rotate-45 group-hover:text-blue-400 transition-colors" />
                  <p className="text-xs font-bold text-slate-700">Upload screenshot of your analytics</p>
                  <p className="text-[10px] text-slate-400">PNG, JPG or PDF · Max 5MB</p>
                </div>
                <p className="text-[10px] text-slate-400">A screenshot from your platform's analytics dashboard showing the view count.</p>
              </div>
            </div>

            {/* Checkbox */}
            <div className="bg-[#eff6ff] p-4 rounded-xl border border-blue-50 flex gap-4">
              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-blue-200 text-[#3b63cc] focus:ring-blue-500 cursor-pointer" />
              <p className="text-[10px] leading-relaxed text-slate-600">
                I confirm that <span className="font-bold text-slate-800">all information submitted is accurate</span> and the video linked is my original content. I understand that false claims may result in account suspension and forfeiture of any earned rewards.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="flex-1 py-3.5 px-6 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors text-xs flex items-center justify-center gap-2">
                ← Save Draft
              </button>
              <button className="flex-[2] py-3.5 px-6 bg-[#3b63cc] text-white rounded-xl font-bold hover:bg-[#2d4fb3] transition-all shadow-md shadow-blue-200 text-xs flex items-center justify-center gap-2">
                Submit for Verification →
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}