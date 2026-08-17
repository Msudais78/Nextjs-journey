'use client';

/**
 * AuthPage Component
 * 
 * This page handles the main authentication flow (Log In and Sign Up).
 * It features a toggle between login and registration forms,
 * responsive layout, and integration with Next.js navigation.
 * Also includes UI elements for social login (Google, Apple) 
 * and password visibility toggling.
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter(); // Next.js router for programmatic navigation
  
  // --- UI Toggle States ---
  const [isLogin, setIsLogin] = useState(false); // Toggles between Log In (true) and Sign Up (false) modes
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility (text vs password input type)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggles confirm password visibility

  // --- Form Input States ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- Form Submission & Feedback States ---
  const [isLoading, setIsLoading] = useState(false); // Disables button and shows 'Processing...' text during API calls
  const [errorMsg, setErrorMsg] = useState(''); // Stores the main error message to display in the red banner
  const [errorDetails, setErrorDetails] = useState<string[]>([]); // Stores detailed validation errors (e.g. specific password requirements missed)
  const [successMsg, setSuccessMsg] = useState(''); // Stores success messages to display before redirecting

  /**
   * Handles the submission of the authentication form.
   * Processes either Log In or Sign Up based on the `isLogin` state.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset all feedback states before processing a new submission
    setErrorMsg('');
    setErrorDetails([]);
    setSuccessMsg('');

    if (!isLogin) {
      // --- SIGN UP FLOW ---
      
      // Basic client-side validation: ensure passwords match
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      
      setIsLoading(true);
      try {
        // Send registration request to backend API
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        
        const data = await response.json();
        
        // Handle failed API responses (e.g., user exists, invalid email, weak password)
        if (!response.ok) {
          setErrorMsg(data.error || data.message || 'Something went wrong');
          // If the backend returns detailed validation rules (like password requirements), store them
          if (data.details && Array.isArray(data.details)) {
            setErrorDetails(data.details);
          }
          setIsLoading(false);
          return;
        }

        // Handle successful registration
        // Display the success message and wait 2 seconds before redirecting so the user can read it
        setSuccessMsg(data.message || 'Success! Redirecting to verification...');
        setTimeout(() => {
          // Redirect to the OTP verification page, passing the email via query parameters
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      } catch (error) {
        // Handle network errors (e.g., server down, no internet connection)
        setErrorMsg('Network error. Please try again.');
        setIsLoading(false);
      }
    } else {
      // --- LOG IN FLOW ---
      // Login logic placeholder (To be implemented)
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    // Main container ensuring the page fills the entire viewport height
    <div className="min-h-screen flex w-full bg-white text-black">
      
      {/* --- Left Section: Form Area --- */}
      {/* Occupies full width on mobile, half width on large screens. Centers content dynamically. */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 md:p-10">
        
        {/* Logo & Title Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 mb-2 relative">
            <Image 
              src="/logo.png" 
              alt="sudaisai logo" 
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Join sudaisai</h1>
        </div>

        {/* Auth Mode Toggle (Log In vs Sign Up) */}
        {/* Switches the form state when clicked and animates the active background tab */}
        <div className="flex w-full max-w-sm bg-gray-100 rounded-md p-1 mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all duration-300 ${
              isLogin ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all duration-300 ${
              !isLogin ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Main Authentication Form */}
        <form className="w-full max-w-sm space-y-3" onSubmit={handleSubmit}>
          
          {/* Global Error Banner */}
          {/* Displays top-level errors and detailed validation lists with a slide-in animation */}
          {errorMsg && (
            <div className="bg-black text-white text-sm p-4 rounded-md border border-gray-800 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex flex-col">
                <span className="font-semibold">{errorMsg}</span>
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
          {errorMsg === '' && successMsg && (
            <div className="bg-black text-white text-sm p-4 rounded-md border border-gray-800 flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#FDE047]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-100">{successMsg}</span>
            </div>
          )}
          
          {/* Username Input - Only rendered during Sign Up */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Input - Shared between Log In and Sign Up */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email address <span className="text-red-500">*</span></label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              required
            />
          </div>

          {/* Password Input - Features visibility toggle button (eye icon) */}
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none pr-10"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input - Only rendered during Sign Up */}
          {!isLogin && (
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none pr-10"
                  required={!isLogin}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Additional Options: Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" />
              Remember Me
            </label>
            <Link href="/auth/reset" className="text-xs text-gray-500 hover:text-black">
              Forgot Password?
            </Link>
          </div>

          {/* Form Submit Button - Adapts text based on state */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#FDE047] hover:bg-[#FACC15] text-black font-semibold py-2.5 rounded-md mt-4 transition-colors duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        {/* --- Social Login & Divider Section --- */}
        {/* Divider with dynamic text indicating current auth mode */}
        <div className="w-full max-w-sm flex items-center my-6">
          <div className="grow border-t border-dotted border-gray-300"></div>
          <span className="px-4 text-xs text-gray-400">Or {isLogin ? 'Log in' : 'Sign up'} with</span>
          <div className="grow border-t border-dotted border-gray-300"></div>
        </div>

        {/* Social Buttons (Currently placeholders without OAuth integration) */}
        <div className="w-full max-w-sm space-y-2">
          {/* Google Login Button */}
          <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium py-2 rounded-md transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          {/* Apple Login Button */}
          <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium py-2 rounded-md transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.31-.85 3.78-.71 1.67.14 2.83.82 3.6 2.01-3.04 1.76-2.51 5.92.51 7.21-.69 1.6-1.57 3-2.97 3.66zm-3.66-14.7c.72-1.12 1.07-2.3.93-3.58-1.13.1-2.48.74-3.25 1.83-.65.92-.99 2.15-.84 3.38 1.25.14 2.45-.51 3.16-1.63z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* --- Terms and Privacy Links --- */}
        <div className="w-full max-w-sm mt-5 space-y-3">
          <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" />
            I don't want to receive emails about sudaisai feature updates and best practice
          </label>
          <p className="text-[10px] text-gray-400 leading-tight">
            By creating an account, you agree to our <Link href="#" className="hover:text-black">Terms of Service</Link> and <Link href="#" className="hover:text-black">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* --- Right Section: Showcase Image --- */}
      {/* Hidden on mobile, takes up half width on large screens */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0B151F]">
        <Image 
          src="/holographic_human_avatar.webp" 
          alt="Holographic Human Avatar" 
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay gradient to blend the image's bottom edge seamlessly */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    </div>
  );
}
