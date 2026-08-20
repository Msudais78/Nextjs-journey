'use client';

/**
 * NewPasswordPage Component
 * 
 * Route: /auth/new-password?token=<rawToken>
 * Purpose: Allows users to create a new password after clicking the reset link 
 *          from their email. The page reads the reset token from the URL query 
 *          parameters and submits it along with the new password to the backend.
 * 
 * Layout: Split-screen design matching the main auth page:
 *   - Left side: Password form with error/success banners
 *   - Right side: Decorative showcase image (hidden on mobile)
 * 
 * Flow:
 * 1. User arrives via the reset link in their email (URL contains ?token=...)
 * 2. User enters and confirms their new password
 * 3. Client-side validation checks password match and minimum length
 * 4. Form submits a POST request to /api/auth/update-password
 * 5. On success: Shows success message, then redirects to /auth after 2 seconds
 * 6. On error: Displays error message with optional validation details
 */

// --- Dependency Imports ---
import { useState, Suspense } from 'react';                    // React hooks for state management and lazy loading
import Image from 'next/image';                                 // Next.js optimized image component with lazy loading
import Link from 'next/link';                                    // Next.js client-side navigation component
import { useRouter, useSearchParams } from 'next/navigation';   // Next.js hooks for routing and URL query parameters

/**
 * NewPasswordForm Component (Internal)
 * 
 * Separated from the main page export because `useSearchParams()` requires
 * a Suspense boundary. This component handles all the form logic and UI.
 */
function NewPasswordForm() {
  // --- Navigation & URL Parameters ---
  const router = useRouter();                                    // Next.js router for programmatic navigation (redirect after success)
  const searchParams = useSearchParams();                        // Access URL query parameters
  const token = searchParams.get('token');                       // Extract the raw reset token from the URL (?token=...)

  // --- Form Input States ---
  const [password, setPassword] = useState('');                  // Stores the new password input
  const [confirmPassword, setConfirmPassword] = useState('');    // Stores the confirm password input
  const [showPassword, setShowPassword] = useState(false);       // Toggles password field visibility (text vs dots)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggles confirm password field visibility
  
  // --- Form Submission & Feedback States ---
  const [isLoading, setIsLoading] = useState(false);             // Disables the submit button and shows "Processing..." during API calls
  const [errorMsg, setErrorMsg] = useState('');                   // Stores the main error message for the error banner
  const [errorDetails, setErrorDetails] = useState<string[]>([]); // Stores detailed validation errors (e.g., password requirements)
  const [successMsg, setSuccessMsg] = useState('');               // Stores success message before redirect

  /**
   * Handles the form submission for setting a new password.
   * Performs client-side validation, then sends the token and new password
   * to the backend API for verification and password update.
   * 
   * @param e - React form event, used to prevent default browser form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset all feedback states before processing a new submission
    setErrorMsg('');
    setErrorDetails([]);
    setSuccessMsg('');

    // Client-side validation: Ensure both password fields match
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    // Client-side validation: Enforce minimum password length
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    // Verify that a reset token exists in the URL (prevents submission without a valid link)
    if (!token) {
      setErrorMsg('Invalid or missing reset token.');
      return;
    }

    // Begin the API submission — disable the button to prevent double-clicks
    setIsLoading(true);
    try {
      // Send the reset token and new password to the backend API for verification and update
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      // Parse the JSON response body from the API
      const data = await response.json();
      
      // Handle API errors (invalid/expired token, weak password, etc.)
      if (!response.ok) {
        setErrorMsg(data.error || data.message || 'Something went wrong');
        // If the backend returns detailed validation errors, store them for the error banner
        if (data.details && Array.isArray(data.details)) {
          setErrorDetails(data.details);
        }
        setIsLoading(false);
        return;
      }

      // On success: Display a success message and redirect to the login page after 2 seconds
      setSuccessMsg(data.message || 'Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (error) {
      // Handle network-level errors (server unreachable, no internet, etc.)
      setErrorMsg('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    // --- Left Section: Form Area ---
    // Occupies full width on mobile, half width on large screens. Centers content dynamically.
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 md:p-10">
      
      {/* Logo & Title Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        {/* Application Logo */}
        <div className="w-12 h-12 mb-2 relative">
          <Image 
            src="/logo.png" 
            alt="sudaisai logo" 
            fill
            className="object-contain"
          />
        </div>
        {/* Page Title & Subtitle */}
        <h1 className="text-2xl font-bold tracking-tight">Create New Password</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          Please enter your new password below.
        </p>
      </div>

      {/* --- Main Password Reset Form --- */}
      <form className="w-full max-w-sm space-y-3" onSubmit={handleSubmit}>
        
        {/* Global Error Banner */}
        {/* Displays error messages with a warning icon and optional detailed validation list */}
        {/* Uses a dark background with red icon to match the app's auth page design system */}
        {errorMsg && (
          <div className="bg-black text-white text-sm p-4 rounded-md border border-gray-800 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Warning Triangle Icon */}
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col">
              {/* Main error message text */}
              <span className="font-semibold">{errorMsg}</span>
              {/* Optional detailed validation errors (e.g., specific password requirements) */}
              {errorDetails.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-gray-400">
                  {errorDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Global Success Banner */}
        {/* Shown only when there's no error and a success message exists */}
        {/* Uses a yellow checkmark icon to match the app's yellow accent color */}
        {errorMsg === '' && successMsg && (
          <div className="bg-black text-white text-sm p-4 rounded-md border border-gray-800 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Checkmark Circle Icon */}
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#FDE047]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-gray-100">{successMsg}</span>
          </div>
        )}

        {/* New Password Input — Features a visibility toggle button (eye icon) */}
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700">New Password <span className="text-red-500">*</span></label>
          <div className="relative">
            {/* Input toggles between "password" and "text" type based on showPassword state */}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none pr-10"
              required
            />
            {/* Password Visibility Toggle Button */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {/* Eye Icon (open) — Shown when password is visible */}
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                /* Eye Icon (closed/slashed) — Shown when password is hidden */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Input — Same visibility toggle pattern as above */}
        <div className="space-y-1 relative">
          <label className="text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
          <div className="relative">
            {/* Input toggles between "password" and "text" type based on showConfirmPassword state */}
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none pr-10"
              required
            />
            {/* Confirm Password Visibility Toggle Button */}
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {/* Eye Icon (open) — Shown when confirm password is visible */}
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                /* Eye Icon (closed/slashed) — Shown when confirm password is hidden */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Form Submit Button — Yellow CTA matching the app's design system */}
        {/* Disabled during loading to prevent duplicate submissions */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#FDE047] hover:bg-[#FACC15] text-black font-semibold py-2.5 rounded-md mt-4 transition-colors duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>

      {/* Back to Login Link */}
      <div className="w-full max-w-sm mt-5 space-y-3 flex justify-center">
        <Link href="/auth" className="text-xs text-gray-500 hover:text-black transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

/**
 * NewPasswordPage — Default Page Export
 * 
 * Wraps the NewPasswordForm in a Suspense boundary (required by Next.js 
 * because `useSearchParams()` triggers client-side rendering) and renders 
 * the split-screen layout with the showcase image on the right.
 */
export default function NewPasswordPage() {
  return (
    // --- Main Page Container: Split-screen layout ---
    <div className="min-h-screen flex w-full bg-white text-black">

      {/* Left Section: Password Form (wrapped in Suspense for useSearchParams) */}
      <Suspense fallback={<div className="w-full lg:w-1/2 flex items-center justify-center">Loading...</div>}>
        <NewPasswordForm />
      </Suspense>

      {/* Right Section: Decorative Showcase Image */}
      {/* Hidden on mobile (< lg breakpoint), visible on desktop taking up half the screen */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0B151F]">
        <Image 
          src="/holographic_human_avatar.webp" 
          alt="Holographic Human Avatar" 
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay to smoothly blend the image's bottom edge into the dark background */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    </div>
  );
}
