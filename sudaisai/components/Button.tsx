import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200",
    secondary: "bg-[#111111] text-white hover:bg-[#222222]",
    outline: "bg-transparent text-white border border-gray-600 hover:border-white"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
