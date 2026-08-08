import React from 'react';
import FeatureCard from './FeatureCard';

export default function FeaturesSection() {
  return (
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
  );
}
