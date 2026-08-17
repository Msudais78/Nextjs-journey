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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-white text-black">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 md:p-10">
        
        {/* Logo & Title */}
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

        {/* Tab Switcher */}
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

        {/* Form Fields */}
        <form className="w-full max-w-sm space-y-3" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email address <span className="text-red-500">*</span></label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-gray-100 border-none rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              required
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
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

          {!isLogin && (
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" />
              Remember Me
            </label>
            <Link href="/auth/reset" className="text-xs text-gray-500 hover:text-black">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FDE047] hover:bg-[#FACC15] text-black font-semibold py-2.5 rounded-md mt-4 transition-colors duration-300"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full max-w-sm flex items-center my-6">
          <div className="grow border-t border-dotted border-gray-300"></div>
          <span className="px-4 text-xs text-gray-400">Or {isLogin ? 'Log in' : 'Sign up'} with</span>
          <div className="grow border-t border-dotted border-gray-300"></div>
        </div>

        {/* Social Buttons */}
        <div className="w-full max-w-sm space-y-2">
          <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium py-2 rounded-md transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-sm font-medium py-2 rounded-md transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.31-.85 3.78-.71 1.67.14 2.83.82 3.6 2.01-3.04 1.76-2.51 5.92.51 7.21-.69 1.6-1.57 3-2.97 3.66zm-3.66-14.7c.72-1.12 1.07-2.3.93-3.58-1.13.1-2.48.74-3.25 1.83-.65.92-.99 2.15-.84 3.38 1.25.14 2.45-.51 3.16-1.63z" />
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Terms */}
        <div className="w-full max-w-sm mt-5 space-y-3">
          <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400" />
            I don't want to receive emails about sudaisai feature updates and best practice
          </label>
          <p className="text-[10px] text-gray-400 leading-tight">
            By creating account, you agree to our <Link href="#" className="hover:text-black">Terms of Service</Link> and <Link href="#" className="hover:text-black">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0B151F]">
        <Image 
          src="/ai-hero.jpg" 
          alt="AI Interface Hero" 
          fill
          className="object-cover object-center"
          priority
        />
        {/* Subtle overlay to make it blend with the futuristic aesthetic */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    </div>
  );
}
