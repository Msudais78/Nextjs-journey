'use client';

/**
 * VerifyOtpPage Component
 * 
 * This page provides an interface for users to enter a 6-digit 
 * One-Time Password (OTP) sent to their email. It handles 
 * individual digit inputs, auto-focusing, backspace navigation, 
 * and pasting a full code directly.
 */

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * VerifyOtpContent Component
 * 
 * The main content wrapper for the OTP verification interface.
 * It manages the state of the 6-digit OTP code, handles input logic
 * (typing, pasting, backspacing), and coordinates API submissions.
 */
function VerifyOtpContent() {
  // Navigation hooks for redirecting after success and reading URL query params
  const router = useRouter();
  const searchParams = useSearchParams();
  // Extract the email parameter that was passed from the signup page
  const email = searchParams.get('email') || 'your email';

  // State Management
  // Array storing the 6 individual digits of the OTP code
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  // Tracks whether an API request is currently in progress
  const [isLoading, setIsLoading] = useState(false);
  // Holds any error messages returned from the API or validation logic
  const [errorMsg, setErrorMsg] = useState('');
  // Holds success messages for the UI before redirecting
  const [successMsg, setSuccessMsg] = useState('');

  // Refs for each input box to allow programmatic auto-focusing
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  /**
   * Handles changes to an individual OTP input box.
   * Ensures only numbers are accepted and auto-focuses the next box.
   * 
   * @param index - The index of the input box being modified (0-5)
   * @param value - The character typed into the box
   */
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1); // Only take the last character if multiple are pasted/typed
    }
    
    // Validate: Only allow numeric digits
    if (value && !/^\d+$/.test(value)) return;

    // Update the OTP array state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance: Move focus to the next input box if a value was entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  /**
   * Intercepts key presses in the input boxes.
   * Handles the 'Backspace' key to delete a digit and auto-focus the previous box.
   * 
   * @param index - The index of the active input box
   * @param e - The Keyboard Event
   */
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  /**
   * Intercepts paste events on the first input box.
   * Reads a 6-digit code from the clipboard and spreads it across all boxes.
   * 
   * @param e - The Clipboard Event
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // Read up to 6 characters from the clipboard and split into an array
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    
    let currentFocus = 0;
    // Iterate over pasted characters and fill in valid digits
    pastedData.forEach((char, index) => {
      if (/^\d+$/.test(char) && index < 6) {
        newOtp[index] = char;
        currentFocus = index;
      }
    });
    
    setOtp(newOtp);
    
    // Auto-advance: Focus the next empty input, or the very last input if fully populated
    if (currentFocus < 5) {
      inputRefs[currentFocus + 1].current?.focus();
    } else {
      inputRefs[5].current?.focus();
    }
  };

  /**
   * Submits the 6-digit OTP code to the verification API endpoint.
   * Handles validation, loading states, and error/success rendering.
   * 
   * @param e - Form Submission Event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join(''); // Combine the array into a single 6-character string
    
    // Pre-flight check: Ensure all 6 digits are provided
    if (otpValue.length !== 6) {
      setErrorMsg('Please enter all 6 digits');
      return;
    }

    // Reset messages and begin loading state
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Dispatch the POST request to the API route
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpValue }),
      });
      
      const data = await response.json();
      
      // Handle API errors (e.g. invalid OTP, expired OTP)
      if (!response.ok) {
        setErrorMsg(data.error || data.message || 'Verification failed');
        setIsLoading(false);
        return;
      }

      // Handle Success: Show message and setup automatic redirect
      setSuccessMsg(data.message || 'Verification successful! Redirecting...');
      setTimeout(() => {
        router.push('/'); // Redirecting to home/dashboard
      }, 2000);
    } catch (error) {
      // Catch network-level failures (e.g. no internet connection)
      setErrorMsg('Network error. Please try again.');
      setIsLoading(false);
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
            We've sent a code to <span className="font-medium text-black">{email}</span>
          </p>

          {errorMsg && (
            <div className="w-full bg-black text-white text-sm p-4 rounded-md border border-gray-800 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="w-full bg-black text-white text-sm p-4 rounded-md border border-gray-800 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 mb-6">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#FDE047]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-100">{successMsg}</span>
            </div>
          )}

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
                disabled={isLoading}
                className={`flex-1 bg-[#FDE047] hover:bg-[#FACC15] text-black font-medium py-3 rounded-md transition-colors duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
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

export default function VerifyOtpPage() {
  return (
    // Wrap the component in Suspense since it uses the `useSearchParams` hook,
    // which relies on client-side routing data. This ensures Next.js build compatibility.
    <Suspense fallback={
      <div className="min-h-screen flex w-full items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
