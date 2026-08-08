import React from 'react';

export default function ProcessSection() {
  return (
    <section className="bg-[#050505] py-24 px-6 lg:px-12 text-white border-b border-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12">The Synthesis Process</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Left Card */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-gray-800 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="text-cyan-400 text-2xl mb-6">⚙️</div>
              <h3 className="text-2xl font-bold mb-4">Cognitive Processing</h3>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                Our proprietary LLM stack parses complex queries, extracting intent and emotional context before formulating a response. This deep understanding layer is the foundation of genuine interaction.
              </p>
            </div>
            <div className="mt-12 space-y-4">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">
                <span className="text-cyan-400">01</span><span>Intent Parsing</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">
                <span className="text-cyan-400">02</span><span>Context Retrieval</span>
              </div>
            </div>
          </div>

          {/* Right Stacked Cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#1a1a1a] p-8 flex flex-col justify-center items-center text-center h-full" style={{ minHeight: '200px' }}>
              <h3 className="text-4xl font-bold mb-2">4ms</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Average Inference Time</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/40 to-transparent border border-cyan-900/30 p-8 flex flex-col justify-end h-full" style={{ minHeight: '200px' }}>
              <h3 className="text-lg font-bold mb-2">Visual Rendering Pipeline</h3>
              <p className="text-xs text-gray-400">Translating phonemes into real-time 3D facial mesh deformations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
