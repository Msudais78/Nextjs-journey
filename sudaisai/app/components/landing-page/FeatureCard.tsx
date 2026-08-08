import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-[#0a0a0a] text-white p-8 border border-gray-800 hover:border-cyan-500/50 transition-colors duration-300 flex flex-col justify-end h-72">
      {icon && <div className="mb-auto text-cyan-400 text-3xl">{icon}</div>}
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
