import React from 'react';
import TestimonialCard from './TestimonialCard';

export default function TestimonialsSection() {
  return (
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
  );
}
