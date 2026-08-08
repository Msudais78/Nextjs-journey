'use client';

import React from 'react';
import Image from 'next/image';
import { useVideoPlayer } from '@/utils/constants';

export default function HeroSection() {
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    progressPercent,
    videoRef,
    togglePlay,
    handleTimeUpdate,
  } = useVideoPlayer();

  return (
    <section className="bg-white text-gray-900 pt-36 pb-24 px-6 sm:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: HERO TEXT & CTAS */}
        <div className="flex-1 z-10">
          
          {/* Status Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-8 bg-emerald-50 border border-emerald-200/80 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            NEXT-GEN AI ENGINE ONLINE
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-[1.08] mb-6">
            Talk to AI Like a <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Real Friend.
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-lg max-w-lg mb-10 leading-relaxed font-normal">
            Experience conversational AI with unprecedented realism. Zero latency, emotional resonance, and human-like presence.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-full flex items-center gap-3 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-95">
              <span>START FREE TRIAL</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">→</span>
            </button>

            <button
              onClick={togglePlay}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-full flex items-center gap-2.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'PAUSE VIDEO' : 'PLAY VIDEO'}</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">A</span>
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">K</span>
              <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">S</span>
              <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm">+8k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400 text-sm">★★★★★</div>
              <span className="text-xs font-semibold text-gray-500">Trusted by 10k+ early friends</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: VIDEO SHOWCASE CARD */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg relative">
          <div className="relative bg-[#0b0c16] rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden">
            
            {/* Inner Video Container */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#14162b] to-[#0a0b15] flex flex-col justify-between p-6" style={{ height: '480px' }}>
              
              {/* Top Bar Overlay */}
              <div className="z-20 flex justify-between items-center">
                <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-2 border border-white/10 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>sudaisai</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-red-400 font-bold tracking-wider">LIVE</span>
                </div>
              </div>

              {/* Video Element */}
              <video
                ref={videoRef}
                src="/hero-video.mp4"
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              />

              {/* Center Graphic & Waveform Overlay */}
              <div className="z-20 my-auto text-center pointer-events-none flex flex-col items-center justify-center">
                {/* Audio Waveform Animation */}
                <div className="flex items-end justify-center gap-1 h-8 mb-4">
                  {[40, 70, 30, 90, 50, 80, 40, 100, 60, 30, 75, 45, 90].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: isPlaying ? `${h}%` : '20%' }}
                      className="w-1 bg-white/70 rounded-full transition-all duration-300 animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Custom Bottom Video Controls Bar */}
              <div className="z-20 bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3 text-white">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white transition-colors"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                
                <span className="text-xs font-mono text-gray-300">
                  {currentTime} / {duration}
                </span>

                {/* Progress Bar */}
                <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>🔊</span>
                  <span>⛶</span>
                </div>
              </div>

            </div>

            {/* Bottom Card Sub-Badge */}
            <div className="mt-3 px-2 flex items-center gap-2 text-xs font-medium text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Zero latency • 12ms response</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
