import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-8">
      <nav className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl shadow-black/5 rounded-full px-6 py-3 flex items-center justify-between transition-all">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center p-1 shadow-sm">
            <Image
              src="/logo.png"
              alt="SudaisAI Logo"
              width={28}
              height={28}
              className="w-full h-full object-contain brightness-200"
            />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-black">sudaisai</span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
          <Link href="#features" className="hover:text-black transition-colors">Features</Link>
          <Link href="#process" className="hover:text-black transition-colors">Process</Link>
          <Link href="#testimonials" className="hover:text-black transition-colors">Testimonials</Link>
          <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
        </div>

        {/* Right CTA Button */}
        <Link href="/auth" className="bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95">
          <span>Launch App</span>
          <span className="text-gray-400 font-normal">›</span>
        </Link>
      </nav>
    </header>
  );
}
