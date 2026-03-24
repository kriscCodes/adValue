import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Globe, Phone, X, Heart, Navigation, User, Bookmark } from 'lucide-react';

// Custom Marker Icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
});

const App = () => {
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const businesses = [
    { id: 1, name: "Italian Bistro", lat: 40.852, lng: -73.895, rating: 4.5, type: "Restaurant", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400" },
    { id: 2, name: "Bryan's Bakery", lat: 40.862, lng: -73.898, rating: 4.8, type: "Bakery", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* Header - Only visible on Desktop per your screenshot */}
      <header className="hidden md:flex bg-white border-b px-6 py-3 items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-blue-600 font-black text-2xl italic">adValue</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Search in The Bronx" className="pl-10 pr-4 py-2 border rounded-full bg-gray-50 w-80 text-sm outline-none focus:ring-1 ring-blue-500" />
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1"><Globe size={18}/> Explore</span>
          <span className="flex items-center gap-1"><Bookmark size={18}/> Saved</span>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white"><User size={18}/></div>
        </div>
      </header>

      {/* Map Content */}
      <div className="flex-1 relative">
        <MapContainer center={[40.855, -73.890]} zoom={14} className="h-full w-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {businesses.map(biz => (
            <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={customIcon} eventHandlers={{ click: () => setSelectedBusiness(biz) }} />
          ))}
        </MapContainer>

        {/* Floating Horizontal Cards - Desktop Only */}
        <div className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] z-[1000]">
          <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Nearby in The Bronx</h2>
              <button className="text-blue-600 text-xs font-bold">View All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto">
              {businesses.map(biz => (
                <div key={biz.id} className="flex-shrink-0 bg-white p-3 rounded-xl border flex items-center gap-4 w-64 shadow-sm">
                  <img src={biz.img} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-xs">{biz.name}</h3>
                    <p className="text-yellow-500 text-[10px]">★ {biz.rating}</p>
                    <button onClick={() => setSelectedBusiness(biz)} className="mt-1 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] w-full">View details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Popup Overlay */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setSelectedBusiness(null)} className="absolute top-4 right-4 bg-white/80 p-1 rounded-full z-10"><X size={20}/></button>
            <img src={selectedBusiness.img} className="w-full h-44 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-bold">{selectedBusiness.name}</h2>
              <p className="text-yellow-500 text-sm">★ {selectedBusiness.rating} <span className="text-gray-400 font-normal ml-1">(300 reviews)</span></p>
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> 97 West Fordham Road, Bronx</p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-blue-500"/> (212) 555-0111</p>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6 font-bold text-sm">Get Directions</button>
              
              {/* Rewards Progress */}
              <div className="mt-8 border-t pt-4">
                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest mb-4">Reward System</p>
                <div className="space-y-4">
                   {[ {v: '1k', l: 'Free item under $5', w: 'w-1/4'}, {v: '10k', l: 'Free item under $10', w: 'w-1/2'} ].map((t, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] w-6 font-bold">{t.v}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`${t.w} h-full bg-blue-600`}></div>
                        </div>
                        <span className="text-[10px] text-gray-500">{t.l}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
