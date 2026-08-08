import React from 'react';
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
          Talk to AI Like a <br/><span className="text-gray-400">Real Insaan.</span>
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
      
      {/* Hero Image Mockup */}
      <div className="flex-1 relative w-full aspect-square max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-purple-900/20 rounded-3xl border border-gray-800 backdrop-blur-sm overflow-hidden flex items-center justify-center">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-luminosity"></div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/50 p-4 rounded-xl border border-gray-700 backdrop-blur-md">
              <span className="text-cyan-400 text-sm flex items-center gap-2"><span className="animate-pulse">🎙️</span> Listening...</span>
          </div>
        </div>
      </div>
    </section>
  );
}
