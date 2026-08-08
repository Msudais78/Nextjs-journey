import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-gray-900 bg-[#050505] text-white py-8 px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
      <div className="mb-4 md:mb-0 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="SudaisAI Logo"
          width={120}
          height={40}
          className="h-10 w-auto object-contain"
        />
        <div className="border-l border-gray-800 pl-3">
          © 2026 SudaisAI. All rights reserved.
        </div>
      </div>
      <div className="flex gap-6 uppercase tracking-wider">
        <Link href="#" className="hover:text-white">Privacy Policy</Link>
        <Link href="#" className="hover:text-white">Terms of Service</Link>
        <Link href="#" className="hover:text-white">Cookie Policy</Link>
        <Link href="#" className="hover:text-white">Contact</Link>
      </div>
    </footer>
  );
}
