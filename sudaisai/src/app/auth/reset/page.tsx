'use client';

/**
 * ResetPasswordPage Component
 * 
 * Route: /auth/reset
 * Purpose: Allows users to request a password reset link by entering their 
 *          registered email address. On successful submission, displays a 
 *          confirmation message. Matches the decorative layout of the main 
 *          authentication pages.
 * 
 * Flow:
 * 1. User enters their email address
 * 2. Form submits a POST request to /api/auth/reset-password
 * 3. On success: Shows a confirmation message with a link back to login
 * 4. On error: Displays the error message from the API
 */

// --- Dependency Imports ---
import { useState } from 'react';   // React hook for managing component-level state
import Link from 'next/link';       // Next.js optimized client-side navigation component

export default function ResetPasswordPage() {
  // --- Component State ---
  const [email, setEmail] = useState('');            // Stores the user's email input
  const [isSubmitted, setIsSubmitted] = useState(false); // Tracks whether the form has been successfully submitted (switches to confirmation view)
  const [errorMsg, setErrorMsg] = useState('');       // Stores error messages from API or network failures

  /**
   * Handles the form submission for requesting a password reset.
   * Sends the email to the backend API and toggles the UI state based on the response.
   * 
   * @param e - React form event, used to prevent default browser form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous error messages before a new submission attempt
    setErrorMsg('');
    
    try {
      // Send a POST request to the reset-password API endpoint with the user's email
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),      
      });

      // Parse the JSON response body from the API
      const data = await response.json();

      // Handle API errors (validation failures, server errors, etc.)
      if (!response.ok) {
        setErrorMsg(data.error || data.message || 'Something went wrong');
      } else {
        // On success, switch to the confirmation view
        setIsSubmitted(true);
      }
    } catch (error) {
      // Handle network-level errors (server unreachable, no internet, etc.)
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    // --- Main Page Container ---
    // Full-screen white background layout with centered content
    <div className="min-h-screen w-full bg-white text-black flex flex-col relative overflow-hidden">

      {/* Decorative Background Pattern */}
      {/* Creates a subtle grid pattern at the top of the page using CSS gradients */}
      <div 
        className="absolute top-0 left-0 w-full h-64 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% -20%, #e5e7eb 0%, transparent 70%), linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .05) 25%, rgba(0, 0, 0, .05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .05) 75%, rgba(0, 0, 0, .05) 76%, transparent 77%, transparent)',
          backgroundSize: '100% 100%, 50px 50px, 50px 50px'
        }}
      ></div>

      {/* --- Centered Content Card --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white rounded-xl p-8 flex flex-col items-center">
          
          {/* Circular Reset Icon */}
          {/* Three concentric circles (gray-50 → gray-200 → black) with a refresh/reset SVG icon */}
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

          {/* Page Title & Subtitle */}
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">Reset password</h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Enter your email address to reset your password
          </p>

          {/* Dotted Divider Line */}
          <div className="w-full border-t border-dotted border-gray-300 mb-8"></div>

          {/* --- Conditional Rendering: Confirmation Message or Email Form --- */}
          {isSubmitted ? (
            // Success State: Show confirmation message after successful submission
            <div className="w-full text-center">
              {/* Green confirmation banner with the submitted email */}
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm mb-6 border border-green-100">
                If an account exists with {email}, you will receive a password reset link shortly.
              </div>
              {/* Link to navigate back to the login page */}
              <Link href="/auth" className="text-sm font-medium text-black hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            // Default State: Show the email input form
            <form className="w-full space-y-5" onSubmit={handleSubmit}>
              {/* Email Address Input Field */}
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

              {/* Submit Button — Yellow CTA matching the app's design system */}
              <button
                type="submit"
                className="w-full bg-[#FDE047] hover:bg-[#FACC15] text-black font-medium py-3 rounded-md transition-colors duration-300"
              >
                Reset Password
              </button>
            </form>
          )}

          {/* Back to Login Link — Only shown when the form is visible (not after submission) */}
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
