'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Button from './Button';

export default function HeroSection() {
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
      <div className="flex-1 z-10 text-white">
        <div className="inline-block px-3 py-1 mb-6 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest rounded-full bg-cyan-500/10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-2 animate-pulse"></span>
          Next-Gen AI Engine Online
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
          Talk to AI Like a <br/><span className="text-gray-400">Real Friend.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
          Experience conversational AI with unprecedented realism. Zero latency, emotional resonance, and dynamic visual synchronization built for the enterprise.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Start Free Trial</Button>
          <Button variant="outline" onClick={toggleSound}>
             <span>{isMuted ? '🔇 Unmute' : '🔊 Sound On'}</span>
          </Button>
        </div>
      </div>
      
      {/* Hero Video Card Showcase */}
      <div className="flex-1 relative w-full aspect-video sm:aspect-square max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-purple-950/20 to-black/90 rounded-3xl border border-gray-800 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center shadow-2xl">
          {/* Hero Video with Sound Enabled and Controls */}
          <video
            ref={videoRef}
            src="/hero-video.mp4"
            autoPlay
            loop
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-95 transition-opacity duration-500"
          />
          
          {/* Subtle Gradient Overlay at top for badge readability */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none rounded-t-3xl" />

          {/* Floating Logo Badge on Video */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
            <Image
              src="/logo.png"
              alt="SudaisAI Logo"
              width={24}
              height={24}
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-semibold text-white tracking-wider">sudaisai</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-500/40 backdrop-blur-md text-xs font-semibold transition-all"
          >
            {isMuted ? '🔇 Unmute Sound' : '🔊 Sound On'}
          </button>
        </div>
      </div>
    </section>
  );
}
