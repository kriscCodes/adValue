import React, { useState, useEffect } from 'react';
import { X, QrCode, Ban } from 'lucide-react';

const REWARDS_DATA = [
  { id: 1, shop: "The Daily Grind", offer: "FREE DRINK", expires: "Oct 24, 2027", status: "READY TO USE", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400" },
  { id: 2, shop: "Pasta House", offer: "15% OFF", expires: "Nov 02, 2027", status: "READY TO USE", image: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400" },
  { id: 3, shop: "Sweet Treats", offer: "FREE DONUT", expires: "Oct 30, 2027", status: "READY TO USE", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400" },
  { id: 4, shop: "Crusty Batch", offer: "FREE LOAF", expires: "Nov 15, 2027", status: "READY TO USE", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
  { id: 5, shop: "Urban Greens", offer: "20% OFF BOWL", expires: "Dec 01, 2024", status: "READY TO USE", image: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSomkx2iDPGVKA6YlRiU3D7UCy0KvYtbkG_F0-vNGP25PJJF0Ic_LpoUncqefBr" },
  { id: 6, shop: "Velvet Bean", offer: "PASTRY + $5 COFFEE", expires: "Oct 28, 2027", status: "READY TO USE", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400" },
  { id: 7, shop: "Bryan's Bakery", offer: "Free Latte (Up to $8)", expires: "Oct 15, 2027", status: "USED", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
];

const App = () => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [filter, setFilter] = useState('All');

  // Modal Component (Web Popup Design)
  const QRModal = ({ reward, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl">
        <h2 className="text-3xl font-bold text-[#1a2b4b] mb-1">{reward.shop}</h2>
        <p className="text-blue-600 font-semibold text-lg mb-4">$10 In store Credit</p>
        
        <div className="flex gap-2 mb-6">
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Reward</span>
          <span className="bg-emerald-50 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Valid</span>
        </div>

        <div className="relative p-4 border-2 border-blue-50 rounded-3xl mb-8">
           {/* Mock QR Code UI */}
          <div className="w-48 h-48 bg-white flex items-center justify-center border-[12px] border-white shadow-sm">
            <QrCode size={160} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-100 rounded-tl-xl"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-100 rounded-tr-xl"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-100 rounded-bl-xl"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-100 rounded-br-xl"></div>
        </div>

        <p className="text-slate-400 text-sm mb-8">Scan at checkout to redeem your reward</p>
        
        <button 
          onClick={onClose}
          className="w-full bg-[#2b6eff] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <X size={20} /> Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header (Laptop View) */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-8">
          <span className="text-[#2b6eff] font-bold text-xl">adValue</span>
          <nav className="flex gap-6 text-gray-500 text-sm font-medium">
            <a href="#" className="hover:text-black">Explore</a>
            <a href="#" className="text-[#2b6eff]">Rewards</a>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button className="relative">
            <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0 border-2 border-white"></div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="w-8 h-8 bg-emerald-700 rounded-full"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2b4b]">Active Reward Tickets</h1>
          <p className="text-gray-500 mt-2">Manage and redeem your exclusive local business offers.</p>
        </div>

        {/* Mobile Filter Tabs */}
        <div className="flex md:hidden gap-2 mb-8">
          {['All Tickets', 'Ready to use', 'Used'].map((t) => (
            <button 
              key={t}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${t === 'All Tickets' ? 'bg-[#2b6eff] text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Responsive Grid/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REWARDS_DATA.map((reward) => (
            <div key={reward.id} className="group">
              {/* DESKTOP CARD DESIGN */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <img src={reward.image} alt={reward.shop} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800">{reward.shop}</h3>
                  <p className="text-blue-600 font-black text-xl mb-3 tracking-tight">{reward.offer}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mb-6">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Expires: {reward.expires}
                  </p>
                  <button 
                    onClick={() => setSelectedReward(reward)}
                    className="w-full bg-[#2b6eff] text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <QrCode size={16} /> View QR Code
                  </button>
                </div>
              </div>

              {/* MOBILE CARD DESIGN */}
              <div className="md:hidden bg-white rounded-3xl border border-gray-100 shadow-sm p-4 relative">
                <div className="flex gap-4">
                  <img src={reward.image} alt={reward.shop} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800">{reward.shop}</h3>
                        <p className={`font-semibold ${reward.status === 'USED' ? 'text-slate-400' : 'text-blue-600'}`}>{reward.offer}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">Issued {reward.expires}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${reward.status === 'READY TO USE' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                          {reward.status}
                        </span>
                        {reward.status === 'READY TO USE' ? <QrCode className="text-slate-300" size={18} /> : <Ban className="text-slate-200" size={18} />}
                      </div>
                    </div>
                  </div>
                </div>
                {reward.status !== 'USED' && (
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
                    <button onClick={() => setSelectedReward(reward)} className="text-blue-500 text-sm font-semibold w-full text-left">Tap to open</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Trigger */}
      {selectedReward && <QRModal reward={selectedReward} onClose={() => setSelectedReward(null)} />}
    </div>
  );
};

export default App;