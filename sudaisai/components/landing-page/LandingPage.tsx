import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import ProcessSection from './ProcessSection';
import TestimonialsSection from './TestimonialsSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] font-sans selection:bg-cyan-500/30">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}
