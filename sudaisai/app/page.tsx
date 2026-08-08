import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] font-sans selection:bg-cyan-500/30">
      <Navbar />

      {/* HERO SECTION */}
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
        
        {/* Hero Image Mockup from image_c77eb4.jpg */}
        <div className="flex-1 relative w-full aspect-square max-w-lg">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-purple-900/20 rounded-3xl border border-gray-800 backdrop-blur-sm overflow-hidden flex items-center justify-center">
            {/* Replace this with your React Three Fiber canvas later */}
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-luminosity"></div>
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/50 p-4 rounded-xl border border-gray-700 backdrop-blur-md">
                <span className="text-cyan-400 text-sm flex items-center gap-2"><span className="animate-pulse">🎙️</span> Listening...</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (Light Theme) */}
      <section className="bg-[#e5e5e5] py-24 px-6 lg:px-12 text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Engineered for Reality</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm">
              The architecture behind seamless, human-like interaction demands absolute precision across every vector.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon="⚡"
              title="Zero Latency" 
              description="Instantaneous response times under 50ms ensure conversations flow naturally without immersion-breaking pauses." 
            />
            <FeatureCard 
              icon="🗣️"
              title="Natural Voice" 
              description="Advanced prosody modeling captures the subtle nuances of human speech, from breath pauses to emotional inflection." 
            />
            <FeatureCard 
              icon="🎭"
              title="Dynamic Lip-Sync" 
              description="Real-time phonetic mapping drives precise facial actuation, ensuring perfect audio-visual synchronization." 
            />
          </div>
        </div>
      </section>

      {/* PROCESS SECTION (Bento Box) */}
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
              <div className="bg-[#1a1a1a] p-8 flex flex-col justify-center items-center text-center h-full min-h-[200px]">
                <h3 className="text-4xl font-bold mb-2">4ms</h3>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Average Inference Time</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-900/40 to-transparent border border-cyan-900/30 p-8 flex flex-col justify-end h-full min-h-[200px]">
                <h3 className="text-lg font-bold mb-2">Visual Rendering Pipeline</h3>
                <p className="text-xs text-gray-400">Translating phonemes into real-time 3D facial mesh deformations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-[#050505] py-24 px-6 lg:px-12 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Trusted by Pioneers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <TestimonialCard 
              theme="light"
              quote="The latency is imperceptible. Integrating SudaisAI into our customer service flow felt less like deploying software and more like hiring a highly competent team of specialists overnight."
              author="David Chen"
              role="CTO, Nexus Corp"
            />
            <TestimonialCard 
              theme="accent"
              quote="We tested every major avatar engine on the market. Only SudaisAI possessed the nuanced emotional range required for our telehealth triage applications. It's profoundly human."
              author="Maria Rodriguez"
              role="Lead Developer"
            />
            <TestimonialCard 
              theme="dark"
              quote="The dynamic lip-sync is flawless even when handling specialized technical jargon. It maintains the illusion of reality flawlessly, which is critical for our executive training modules."
              author="James O'Connor"
              role="Product Lead"
            />
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="border-t border-gray-900 bg-[#050505] text-white py-8 px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="mb-4 md:mb-0">
              <span className="font-bold text-white text-base block mb-1">SudaisAI</span>
              © 2026 SudaisAI. All rights reserved.
          </div>
          <div className="flex gap-6 uppercase tracking-wider">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
              <Link href="#" className="hover:text-white">Cookie Policy</Link>
              <Link href="#" className="hover:text-white">Contact</Link>
          </div>
      </footer>
    </main>
  );
}
