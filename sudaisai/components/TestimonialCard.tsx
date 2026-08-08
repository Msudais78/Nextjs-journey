import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  theme: 'light' | 'dark' | 'accent';
}

export default function TestimonialCard({ quote, author, role, theme }: TestimonialCardProps) {
  const themeStyles = {
    light: "bg-white text-black",
    dark: "bg-[#1a1a1a] text-white",
    accent: "bg-[#0a0a0a] text-white border-t-2 border-cyan-400"
  };

  return (
    <div className={`p-8 flex flex-col justify-between h-full min-h-[300px] ${themeStyles[theme]}`}>
      <p className="text-sm md:text-base leading-relaxed font-medium">"{quote}"</p>
      <div className="mt-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-500" />
        <div>
          <p className="font-bold text-sm">{author}</p>
          <p className="text-xs opacity-70 uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  );
}
