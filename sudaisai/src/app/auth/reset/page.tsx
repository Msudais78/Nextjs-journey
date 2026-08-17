'use client';

/**
 * ResetPasswordPage Component
 * 
 * This page allows users to request a password reset link 
 * by entering their email address. It features a decorative 
 * layout matching the main authentication pages.
 */

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Add actual reset logic here
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col relative overflow-hidden">
      {/* Decorative top background pattern (approximation of the wave grid) */}
      <div 
        className="absolute top-0 left-0 w-full h-64 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% -20%, #e5e7eb 0%, transparent 70%), linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent)',
          backgroundSize: '100% 100%, 50px 50px, 50px 50px'
        }}
      ></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white rounded-xl p-8 flex flex-col items-center">
          
          {/* Circular Reset Icon */}
          <div className="mb-8">
            <div className="w-28 h-28 rounded-full bg-gray-50 flex items-center justify-center shadow-sm">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center shadow-inner">
                <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center shadow-lg">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="white" 
                    className="w-8 h-8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Titles */}
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">Reset password</h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Enter your email address to reset your password
          </p>

          {/* Dotted Divider */}
          <div className="w-full border-t border-dotted border-gray-300 mb-8"></div>

          {/* Form */}
          {isSubmitted ? (
            <div className="w-full text-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm mb-6 border border-green-100">
                If an account exists with {email}, you will receive a password reset link shortly.
              </div>
              <Link href="/auth" className="text-sm font-medium text-black hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="w-full space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FDE047] hover:bg-[#FACC15] text-black font-medium py-3 rounded-md transition-colors duration-300"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* Back Link */}
          {!isSubmitted && (
            <div className="mt-8 text-center">
              <Link href="/auth" className="text-xs text-gray-500 hover:text-black transition-colors">
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
