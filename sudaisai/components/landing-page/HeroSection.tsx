import React from 'react';
import Image from 'next/image';
import Button from './Button';

export default function HeroSection() {
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
          <Button variant="outline">
             <span>▶</span> Watch Demo
          </Button>
        </div>
      </div>
      
      {/* Hero Video Card Showcase */}
      <div className="flex-1 relative w-full aspect-video sm:aspect-square max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-purple-950/20 to-black/90 rounded-3xl border border-gray-800 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-center shadow-2xl">
          {/* Hero Video */}
          <video
            src="/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover rounded-3xl opacity-85 transition-opacity hover:opacity-100 duration-500"
          />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none rounded-3xl" />

          {/* Floating Logo Badge on Video */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Image
              src="/logo.png"
              alt="SudaisAI Logo"
              width={24}
              height={24}
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-semibold text-white tracking-wider">sudaisai</span>
          </div>

          {/* Status Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-between items-center bg-black/70 p-4 rounded-xl border border-gray-700/80 backdrop-blur-md">
              <span className="text-cyan-400 text-sm flex items-center gap-2 font-medium">
                <span className="animate-pulse">🎙️</span> Interactive Demo Stream
              </span>
              <span className="text-xs text-purple-400 font-mono">LIVE AI</span>
          </div>
        </div>
      </div>
    </section>
  );
}
