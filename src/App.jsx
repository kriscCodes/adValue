import React, { useState } from 'react';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Branding Section (Left) */}
      <div className="bg-[#2b64d9] w-full md:w-1/2 flex flex-col items-center justify-center p-12 text-white text-center">
        <h1 className="text-7xl md:text-8xl font-bold mb-4 tracking-tight">adValue</h1>
        <p className="text-xl md:text-2xl max-w-md font-medium leading-snug">
          Connecting local food businesses with their community through context reviews and real rewards.
        </p>
      </div>

      {/* Form Section (Right) */}
      <div className="bg-[#f1f8fe] w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-md">
          <div className="flex bg-[#e2edfb] rounded-2xl p-1.5 mb-10 shadow-sm border border-blue-100 font-bold">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-xl transition-all ${isLogin ? 'bg-[#1e5adb] text-white shadow-md' : 'text-gray-500'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-xl transition-all ${!isLogin ? 'bg-[#1e5adb] text-white shadow-md' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-6">
            {!isLogin && (
              <div className="flex flex-col gap-2">
                <label className="text-slate-800 font-bold text-lg">Full Name</label>
                <input type="text" placeholder="e.g. Howard Thurman" className="w-full p-4 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] bg-white outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-slate-800 font-bold text-lg">Email</label>
              <input type="email" placeholder="e.g. user@email.com" className="w-full p-4 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] bg-white outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-800 font-bold text-lg">Password</label>
              <input type="password" placeholder="Password" className="w-full p-4 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] bg-white outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <button className="w-full bg-[#1e5adb] text-white font-bold py-4 rounded-2xl text-xl shadow-lg hover:bg-blue-700 transition-colors">
              {isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="relative flex py-10 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-slate-900 font-extrabold text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white py-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-6 h-6" />
            <span className="text-slate-700 font-bold text-lg">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
