import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';

export default function Navbar() {
  return (
    <nav className="w-full absolute top-0 left-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 bg-transparent text-white">
      <Link href="/" className="flex items-center gap-3 group">
        <Image
          src="/logo.png"
          alt="SudaisAI Logo"
          width={36}
          height={36}
          className="rounded-full object-contain bg-white/10 p-0.5 transition-transform group-hover:scale-105"
        />
        <span className="text-xl font-bold tracking-tighter text-white">sudaisai</span>
      </Link>
      <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-medium text-gray-300">
        <Link href="#" className="hover:text-white">Features</Link>
        <Link href="#" className="hover:text-white">Process</Link>
        <Link href="#" className="hover:text-white">Testimonials</Link>
        <Link href="#" className="hover:text-white">Pricing</Link>
      </div>
      <Button variant="primary" className="py-2 px-4 text-xs">Launch App</Button>
    </nav>
  );
}
