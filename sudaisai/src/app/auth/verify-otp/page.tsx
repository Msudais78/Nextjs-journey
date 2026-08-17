'use client';

/**
 * VerifyOtpPage Component
 * 
 * This page provides an interface for users to enter a 6-digit 
 * One-Time Password (OTP) sent to their email. It handles 
 * individual digit inputs, auto-focusing, backspace navigation, 
 * and pasting a full code directly.
 */

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1); // Only take the last character if multiple are pasted/typed
    }
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    
    let currentFocus = 0;
    pastedData.forEach((char, index) => {
      if (/^\d+$/.test(char) && index < 6) {
        newOtp[index] = char;
        currentFocus = index;
      }
    });
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    if (currentFocus < 5) {
      inputRefs[currentFocus + 1].current?.focus();
    } else {
      inputRefs[5].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      console.log('Verifying OTP:', otpValue);
      // Add actual verification logic here
    }
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
          
          {/* Circular Shield Icon */}
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
                    className="w-7 h-7"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Titles */}
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">Enter verification code</h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            We've sent a code to <span className="font-medium text-black">hello@example.com</span>
          </p>

          {/* Form */}
          <form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div className="flex gap-2 sm:gap-3 justify-center w-full mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-semibold bg-white border border-gray-300 rounded-lg focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            {/* Resend Link */}
            <p className="text-sm text-gray-500 mb-8">
              Didn't receive a code? <button type="button" className="font-semibold text-black hover:underline transition-all">Click to resend</button>
            </p>

            {/* Dotted Divider */}
            <div className="w-full border-t border-dotted border-gray-300 mb-8"></div>

            {/* Actions */}
            <div className="flex gap-4 w-full">
              <button
                type="submit"
                className="flex-1 bg-[#FDE047] hover:bg-[#FACC15] text-black font-medium py-3 rounded-md transition-colors duration-300"
              >
                Verify
              </button>
              <Link
                href="/auth"
                className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-md transition-colors duration-300"
              >
                Cancel
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
